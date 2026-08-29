import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "6mb" }));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "uploads");
const adminSessions = new Map();
const residentSessions = new Map();
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "condomate-admin";

app.use("/uploads", express.static(UPLOAD_DIR));

function requireAdmin(req, res, next) {
  const token = req.get("authorization")?.replace(/^Bearer\s+/i, "");
  const session = token && adminSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (token) adminSessions.delete(token);
    return res.status(401).json({ error: "admin authentication required" });
  }
  next();
}
function requireResident(req, res, next) {
  const token = req.get("authorization")?.replace(/^Bearer\s+/i, "");
  const session = token && residentSessions.get(token);
  if (!session || session.expiresAt < Date.now()) return res.status(401).json({ error: "resident authentication required" });
  req.residentRoom = session.room;
  next();
}

async function saveImage(dataUrl) {
  if (!dataUrl) return "";
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error("invalid image format");
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > 4 * 1024 * 1024) throw new Error("image exceeds 4MB");
  const extension = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" }[match[1]];
  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

const send = (res, promise) =>
  promise.then((state) => res.json(db.publicState(state))).catch((err) => {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  });

// Whole-state read — the frontend loads this once on boot and after every
// mutation replaces its local copy with the response below.
app.get("/api/state", (req, res) => send(res, db.getState()));

// Maintenance tickets (แจ้งซ่อม)
app.post("/api/tickets", requireResident, (req, res) => {
  const { type, detail, image } = req.body || {};
  if (!type || !detail) return res.status(400).json({ error: "type, detail required" });
  saveImage(image).then((imageUrl) => db.addTicket({ room: req.residentRoom, type, detail, imageUrl })).then((state) => res.json(db.publicState(state))).catch((err) => {
    res.status(400).json({ error: err.message || "image upload failed" });
  });
});
app.patch("/api/tickets/:id", requireAdmin, (req, res) => send(res, db.updateTicket(req.params.id, req.body || {})));

// Parcels (พัสดุ)
app.post("/api/parcels", requireAdmin, (req, res) => {
  const { room, courier, time } = req.body || {};
  if (!room || !courier) return res.status(400).json({ error: "room, courier required" });
  send(res, db.addParcel({ room, courier, time: time || new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) }));
});
app.patch("/api/parcels/:id/ack", requireResident, async (req, res) => {
  const state = await db.getState();
  if (!state.parcels.some((parcel) => parcel.id === Number(req.params.id) && parcel.room === req.residentRoom)) return res.status(403).json({ error: "forbidden" });
  send(res, db.ackParcel(req.params.id));
});

// Announcements (ประกาศ)
app.post("/api/announcements", requireAdmin, (req, res) => {
  const { title, date, time, body } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: "title, body required" });
  send(res, db.addAnnouncement({ title, date: date || "", time: time || "", body }));
});
app.delete("/api/announcements/:id", requireAdmin, (req, res) => send(res, db.deleteAnnouncement(req.params.id)));

// Facility bookings (จองส่วนกลาง)
app.post("/api/bookings", requireResident, (req, res) => {
  const { key } = req.body || {};
  if (!key) return res.status(400).json({ error: "key required" });
  db.bookSlot(key, req.residentRoom).then((state) => res.json(db.publicState(state))).catch((err) => res.status(err.message === "slot already booked" ? 409 : 400).json({ error: err.message }));
});
app.delete("/api/bookings", requireResident, (req, res) => {
  const { key } = req.body || {};
  if (!key) return res.status(400).json({ error: "key required" });
  db.cancelBooking(key, req.residentRoom).then((state) => res.json(db.publicState(state))).catch((err) => res.status(400).json({ error: err.message }));
});

// Facility settings (นิติบุคคล only, no auth check yet — see README)
app.patch("/api/facilities/:name", requireAdmin, (req, res) => send(res, db.updateFacility(req.params.name, req.body || {})));

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return res.status(401).json({ error: "invalid username or password" });
  const token = crypto.randomUUID();
  adminSessions.set(token, { username, expiresAt: Date.now() + 1000 * 60 * 60 * 12 });
  res.json({ token, username });
});

app.post("/api/admin/logout", requireAdmin, (req, res) => {
  adminSessions.delete(req.get("authorization").replace(/^Bearer\s+/i, ""));
  res.status(204).end();
});

app.post("/api/residents", requireAdmin, (req, res) => {
  const { room, name = "", phone = "", status = "active" } = req.body || {};
  if (!room) return res.status(400).json({ error: "room required" });
  const { password } = req.body || {};
  db.addResident({ room, name, phone, status }, password).then((state) => res.json(db.publicState(state))).catch((err) => res.status(400).json({ error: err.message }));
});
app.patch("/api/residents/:room", requireAdmin, (req, res) => {
  const { password, ...patch } = req.body || {};
  db.updateResident(req.params.room, patch, password).then((state) => res.json(db.publicState(state))).catch((err) => res.status(400).json({ error: err.message }));
});
app.delete("/api/residents/:room", requireAdmin, (req, res) => {
  db.deleteResident(req.params.room).then((state) => res.json(db.publicState(state))).catch((err) => res.status(400).json({ error: err.message }));
});

// Phase 1 stand-in login: room number only, no password/OTP.
app.post("/api/session/login", (req, res) => {
  const { room, password } = req.body || {};
  if (!room || !password) return res.status(400).json({ error: "room and password required" });
  db.login(room, password).then(({ state, resident }) => {
    const token = crypto.randomUUID();
    residentSessions.set(token, { room, expiresAt: Date.now() + 1000 * 60 * 60 * 12 });
    res.json({ state: db.publicState(state), token, resident: db.publicState({ residents: [resident] }).residents[0] });
  }).catch((err) => res.status(401).json({ error: err.message }));
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`CondoMate API listening on http://localhost:${PORT}`));
