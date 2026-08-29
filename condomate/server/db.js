import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data", "db.json");
let idCounter = 3000;
const nextId = () => ++idCounter;

function seedState() {
  return {
    tickets: [], parcels: [], announcements: [], bookings: {},
    residents: [
      { room: "999", name: "", phone: "", status: "active" },
      { room: "998", name: "", phone: "", status: "active" },
      { room: "997", name: "", phone: "", status: "active" },
    ],
    facilities: [
      { name: "Fitness", open: "08:00–21:00", capacity: 15 },
      { name: "Badminton", open: "08:00–21:00", capacity: 4 },
      { name: "Meeting room", open: "08:00–21:00", capacity: 8 },
      { name: "Multi-purpose room", open: "08:00–21:00", capacity: 20 },
    ],
  };
}

let state = null;
async function persist() { await mkdir(path.dirname(DB_PATH), { recursive: true }); await writeFile(DB_PATH, JSON.stringify(state, null, 2), "utf-8"); }
export async function load() {
  if (state) return state;
  if (existsSync(DB_PATH)) {
    try {
      state = JSON.parse(await readFile(DB_PATH, "utf-8"));
      idCounter = Math.max(3000, ...state.tickets.map((t) => Number(t.id) || 0), ...state.parcels.map((p) => Number(p.id) || 0));
      return state;
    } catch { /* reseed below */ }
  }
  state = seedState(); await persist(); return state;
}
async function mutate(fn) { await load(); const result = fn(state); await persist(); return result ?? state; }
function ensureRoom(room) { if (!/^\d{3}$/.test(room)) throw new Error("room must be exactly 3 digits"); }

export const db = {
  getState: () => load(),
  addTicket: (t) => mutate((s) => s.tickets.unshift({ id: nextId(), status: "new", note: "", imageUrl: "", ...t })),
  updateTicket: (id, patch) => mutate((s) => { const ticket = s.tickets.find((t) => t.id === Number(id)); if (!ticket) throw new Error("ticket not found"); Object.assign(ticket, patch); }),
  addParcel: (p) => mutate((s) => s.parcels.unshift({ id: nextId(), ack: false, ...p })),
  ackParcel: (id) => mutate((s) => { const parcel = s.parcels.find((p) => p.id === Number(id)); if (!parcel) throw new Error("parcel not found"); parcel.ack = true; }),
  addAnnouncement: (a) => mutate((s) => s.announcements.unshift({ id: nextId(), ...a })),
  deleteAnnouncement: (id) => mutate((s) => { s.announcements = s.announcements.filter((a) => a.id !== Number(id)); }),
  bookSlot: (key, room) => mutate((s) => { if (!s.residents.some((r) => r.room === room)) throw new Error("room not found"); if (s.bookings[key]) throw new Error("slot already booked"); s.bookings[key] = room; }),
  cancelBooking: (key, room) => mutate((s) => { if (s.bookings[key] !== room) throw new Error("booking not found"); delete s.bookings[key]; }),
  updateFacility: (name, patch) => mutate((s) => { const facility = s.facilities.find((f) => f.name === name); if (!facility) throw new Error("facility not found"); Object.assign(facility, patch); }),
  login: async (room) => { ensureRoom(room); const s = await load(); if (!s.residents.some((r) => r.room === room)) throw new Error("room not found"); return s; },
  addResident: (resident) => mutate((s) => { ensureRoom(resident.room); if (s.residents.some((r) => r.room === resident.room)) throw new Error("room already exists"); s.residents.push({ name: "", phone: "", status: "active", ...resident }); }),
  updateResident: (room, patch) => mutate((s) => { const resident = s.residents.find((r) => r.room === room); if (!resident) throw new Error("room not found"); Object.assign(resident, patch); }),
  deleteResident: (room) => mutate((s) => { if (!s.residents.some((r) => r.room === room)) throw new Error("room not found"); s.residents = s.residents.filter((r) => r.room !== room); s.tickets = s.tickets.filter((t) => t.room !== room); s.parcels = s.parcels.filter((p) => p.room !== room); for (const [key, bookedRoom] of Object.entries(s.bookings)) if (bookedRoom === room) delete s.bookings[key]; }),
};
