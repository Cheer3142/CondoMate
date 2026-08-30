import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { put, get } from "@vercel/blob";
import { Readable } from "node:stream";

const app = express();
app.use(cors());
app.use(express.json({ limit: "4mb" }));

const SESSION_SECRET = process.env.SESSION_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
let initialized;
let sql;

const seed = {
  tickets: [], parcels: [], announcements: [], bookings: {},
  residents: [
    { room: "999", name: "", phone: "", status: "active", passwordHash: "" },
    { room: "998", name: "", phone: "", status: "active", passwordHash: "" },
    { room: "997", name: "", phone: "", status: "active", passwordHash: "" },
  ],
  facilities: [
    { name: "Fitness", open: "08:00–21:00", capacity: 15 },
    { name: "Badminton", open: "08:00–21:00", capacity: 4 },
    { name: "Meeting room", open: "08:00–21:00", capacity: 8 },
    { name: "Multi-purpose room", open: "08:00–21:00", capacity: 20 },
  ],
};

function configurationError(res) {
  if (!process.env.DATABASE_URL || !SESSION_SECRET || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
    res.status(503).json({ error: "server configuration incomplete" });
    return true;
  }
  return false;
}
async function init() {
  if (!sql) sql = neon(process.env.DATABASE_URL);
  if (!initialized) initialized = (async () => {
    await sql`CREATE TABLE IF NOT EXISTS condomate_state (id INTEGER PRIMARY KEY, data JSONB NOT NULL, revision INTEGER NOT NULL DEFAULT 0, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
    await sql`ALTER TABLE condomate_state ADD COLUMN IF NOT EXISTS revision INTEGER NOT NULL DEFAULT 0`;
    await sql`INSERT INTO condomate_state (id, data) VALUES (1, ${JSON.stringify(seed)}::jsonb) ON CONFLICT (id) DO NOTHING`;
  })();
  return initialized;
}
async function getState() { await init(); return (await sql`SELECT data FROM condomate_state WHERE id = 1`)[0].data; }
async function mutate(fn) {
  await init();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const row = (await sql`SELECT data, revision FROM condomate_state WHERE id = 1`)[0];
    const state = row.data;
    await fn(state);
    const updated = await sql`UPDATE condomate_state SET data = ${JSON.stringify(state)}::jsonb, revision = revision + 1, updated_at = NOW() WHERE id = 1 AND revision = ${row.revision} RETURNING data`;
    if (updated.length) return updated[0].data;
  }
  throw new Error("data changed concurrently; please retry");
}
function publicState(state) { const copy = structuredClone(state); copy.residents.forEach((r) => delete r.passwordHash); return copy; }
function stateFor(state, user) {
  const copy = publicState(state);
  if (user.role === "admin") {
    copy.tickets.forEach((item) => { if (item.imageUrl) item.imageUrl = `/api/tickets/${item.id}/image`; });
    return copy;
  }
  copy.tickets = copy.tickets.filter((item) => item.room === user.room);
  copy.parcels = copy.parcels.filter((item) => item.room === user.room);
  copy.residents = copy.residents.filter((item) => item.room === user.room);
  copy.bookings = Object.fromEntries(Object.entries(copy.bookings).map(([key, room]) => [key, room === user.room ? room : "booked"]));
  copy.tickets.forEach((item) => { if (item.imageUrl) item.imageUrl = `/api/tickets/${item.id}/image`; });
  return copy;
}
function nextId(state) { return Math.max(3000, ...state.tickets.map((t) => Number(t.id)), ...state.parcels.map((p) => Number(p.id)), ...state.announcements.map((a) => Number(a.id))) + 1; }
function roomOK(room) { return /^\d{3}$/.test(room); }
async function hashWithSalt(password) { const salt = crypto.randomBytes(16).toString("hex"); return new Promise((resolve, reject) => crypto.scrypt(password, salt, 64, (e, key) => e ? reject(e) : resolve(`${salt}:${key.toString("hex")}`))); }
async function matches(password, stored) { if (!stored) return false; const [salt, value] = stored.split(":"); const actual = await new Promise((resolve, reject) => crypto.scrypt(password, salt, 64, (e, key) => e ? reject(e) : resolve(key.toString("hex")))); return crypto.timingSafeEqual(Buffer.from(value, "hex"), Buffer.from(actual, "hex")); }
function token(payload) { const body = Buffer.from(JSON.stringify(payload)).toString("base64url"); const sig = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url"); return `${body}.${sig}`; }
function verify(value) { try { const [body, signature] = value.split("."); const expected = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url"); if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null; const result = JSON.parse(Buffer.from(body, "base64url").toString()); return result.exp > Date.now() ? result : null; } catch { return null; } }
function auth(role) { return (req, res, next) => { if (configurationError(res)) return; const user = verify(req.get("authorization")?.replace(/^Bearer\s+/i, "") || ""); if (!user || (role && user.role !== role)) return res.status(401).json({ error: "authentication required" }); req.user = user; res.locals.user = user; next(); }; }
function send(res, promise) { promise.then((state) => res.json(stateFor(state, res.locals.user))).catch((error) => res.status(400).json({ error: error.message || "request failed" })); }

app.get("/api/state", auth(), async (req, res) => res.json(stateFor(await getState(), req.user)));
app.post("/api/admin/login", (req, res) => { if (configurationError(res)) return; const { username, password } = req.body || {}; if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return res.status(401).json({ error: "invalid username or password" }); res.json({ token: token({ role: "admin", exp: Date.now() + 43200000 }), username }); });
app.post("/api/session/login", async (req, res) => { if (configurationError(res)) return; const { room, password } = req.body || {}; const state = await getState(); const resident = state.residents.find((r) => r.room === room); if (!roomOK(room) || !resident || resident.status !== "active" || !(await matches(password, resident.passwordHash))) return res.status(401).json({ error: "invalid room or password" }); const user = { role: "resident", room }; res.json({ state: stateFor(state, user), token: token({ ...user, exp: Date.now() + 43200000 }), resident: publicState({ ...state, residents: [resident] }).residents[0] }); });
app.post("/api/residents", auth("admin"), async (req, res) => { const { room, name = "", phone = "", status = "active", password } = req.body || {}; if (!roomOK(room) || !password || password.length < 6) return res.status(400).json({ error: "room must be 3 digits and password at least 6 characters" }); send(res, mutate(async (state) => { if (state.residents.some((r) => r.room === room)) throw new Error("room already exists"); state.residents.push({ room, name, phone, status, passwordHash: await hashWithSalt(password) }); })); });
app.patch("/api/residents/:room", auth("admin"), (req, res) => { const { password, name, phone, status } = req.body || {}; if (status && !["active", "inactive"].includes(status)) return res.status(400).json({ error: "invalid status" }); send(res, mutate(async (state) => { const resident = state.residents.find((r) => r.room === req.params.room); if (!resident) throw new Error("room not found"); if (typeof name === "string") resident.name = name.trim(); if (typeof phone === "string") resident.phone = phone.trim(); if (status) resident.status = status; if (password) { if (password.length < 6) throw new Error("password must be at least 6 characters"); resident.passwordHash = await hashWithSalt(password); } })); });
app.delete("/api/residents/:room", auth("admin"), (req, res) => send(res, mutate((state) => { const room = req.params.room; if (!state.residents.some((resident) => resident.room === room)) throw new Error("room not found"); state.residents = state.residents.filter((r) => r.room !== room); state.tickets = state.tickets.filter((t) => t.room !== room); state.parcels = state.parcels.filter((p) => p.room !== room); for (const [key, booked] of Object.entries(state.bookings)) if (booked === room) delete state.bookings[key]; })));
app.post("/api/tickets", auth("resident"), (req, res) => { const { type, detail, image } = req.body || {}; if (!type || !detail) return res.status(400).json({ error: "type and detail required" }); send(res, (async () => { let imageUrl = ""; if (image) { if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("image storage is not configured"); const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(image); if (!match) throw new Error("invalid image"); const data = Buffer.from(match[2], "base64"); if (data.length > 2 * 1024 * 1024) throw new Error("image exceeds 2MB"); const ext = match[1] === "image/jpeg" ? "jpg" : match[1].split("/")[1]; imageUrl = (await put(`repairs/${crypto.randomUUID()}.${ext}`, data, { access: "private", contentType: match[1], token: process.env.BLOB_READ_WRITE_TOKEN })).url; } return mutate((state) => state.tickets.unshift({ id: nextId(state), room: req.user.room, type, detail: detail.trim(), status: "new", note: "", imageUrl })); })()); });
app.patch("/api/tickets/:id", auth("admin"), (req, res) => { const { status, note } = req.body || {}; if (status && !["new", "progress", "done"].includes(status)) return res.status(400).json({ error: "invalid ticket status" }); if (note !== undefined && typeof note !== "string") return res.status(400).json({ error: "invalid note" }); send(res, mutate((state) => { const item = state.tickets.find((t) => t.id === Number(req.params.id)); if (!item) throw new Error("ticket not found"); if (status) item.status = status; if (note !== undefined) item.note = note.trim(); })); });
app.get("/api/tickets/:id/image", auth(), async (req, res) => {
  try {
    const state = await getState();
    const ticket = state.tickets.find((item) => item.id === Number(req.params.id));
    if (!ticket?.imageUrl || (req.user.role !== "admin" && ticket.room !== req.user.room)) return res.status(404).json({ error: "image not found" });
    const blob = await get(ticket.imageUrl, { access: "private", token: process.env.BLOB_READ_WRITE_TOKEN });
    res.setHeader("Content-Type", blob.contentType || "image/*");
    return Readable.fromWeb(blob.stream).pipe(res);
  } catch { return res.status(404).json({ error: "image not found" }); }
});
app.post("/api/parcels", auth("admin"), (req, res) => { const { room, courier, time } = req.body || {}; send(res, mutate((state) => { if (!state.residents.some((r) => r.room === room)) throw new Error("room not found"); if (!courier) throw new Error("courier required"); state.parcels.unshift({ id: nextId(state), room, courier, time: time || new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }), ack: false }); })); });
app.patch("/api/parcels/:id/ack", auth("resident"), (req, res) => send(res, mutate((state) => { const item = state.parcels.find((p) => p.id === Number(req.params.id) && p.room === req.user.room); if (!item) throw new Error("parcel not found"); item.ack = true; })));
app.post("/api/bookings", auth("resident"), (req, res) => { const { key } = req.body || {}; send(res, mutate((state) => { if (!key || state.bookings[key]) throw new Error("slot already booked"); state.bookings[key] = req.user.room; })); });
app.delete("/api/bookings", auth("resident"), (req, res) => { const { key } = req.body || {}; send(res, mutate((state) => { if (state.bookings[key] !== req.user.room) throw new Error("booking not found"); delete state.bookings[key]; })); });
app.post("/api/announcements", auth("admin"), (req, res) => { const { title, date = "", time = "", body } = req.body || {}; send(res, mutate((state) => { if (!title || !body) throw new Error("title and body required"); state.announcements.unshift({ id: nextId(state), title, date, time, body }); })); });
app.delete("/api/announcements/:id", auth("admin"), (req, res) => send(res, mutate((state) => { state.announcements = state.announcements.filter((a) => a.id !== Number(req.params.id)); })));
app.patch("/api/facilities/:name", auth("admin"), (req, res) => { const { open, capacity } = req.body || {}; if (typeof open !== "string" || !open.trim() || !Number.isInteger(capacity) || capacity < 1) return res.status(400).json({ error: "invalid facility settings" }); send(res, mutate((state) => { const item = state.facilities.find((f) => f.name === req.params.name); if (!item) throw new Error("facility not found"); item.open = open.trim(); item.capacity = capacity; })); });
app.get("/api/health", (req, res) => res.json({ ok: true }));

export default app;
