const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
      ...options,
    });
  } catch {
    throw new Error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — ตรวจสอบว่ารัน backend อยู่ (npm run dev ใน server/)");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `คำขอล้มเหลว (${res.status})`);
  }
  return res.json();
}

export const api = {
  getState: (token) => request("/state", { headers: { Authorization: `Bearer ${token}` } }),

  addTicket: (t, token) => request("/tickets", { method: "POST", body: JSON.stringify(t), headers: { Authorization: `Bearer ${token}` } }),
  updateTicket: (id, patch, token) => request(`/tickets/${id}`, { method: "PATCH", body: JSON.stringify(patch), headers: { Authorization: `Bearer ${token}` } }),

  addParcel: (p, token) => request("/parcels", { method: "POST", body: JSON.stringify(p), headers: { Authorization: `Bearer ${token}` } }),
  ackParcel: (id, token) => request(`/parcels/${id}/ack`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }),

  addAnnouncement: (a, token) => request("/announcements", { method: "POST", body: JSON.stringify(a), headers: { Authorization: `Bearer ${token}` } }),
  deleteAnnouncement: (id, token) => request(`/announcements/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),

  bookSlot: (key, token) => request("/bookings", { method: "POST", body: JSON.stringify({ key }), headers: { Authorization: `Bearer ${token}` } }),
  cancelBooking: (key, token) => request("/bookings", { method: "DELETE", body: JSON.stringify({ key }), headers: { Authorization: `Bearer ${token}` } }),

  updateFacility: (name, patch, token) => request(`/facilities/${encodeURIComponent(name)}`, { method: "PATCH", body: JSON.stringify(patch), headers: { Authorization: `Bearer ${token}` } }),

  login: (room, password) => request("/session/login", { method: "POST", body: JSON.stringify({ room, password }) }),
  adminLogin: (username, password) => request("/admin/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  adminLogout: (token) => request("/admin/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } }),
  addResident: (resident, token) => request("/residents", { method: "POST", body: JSON.stringify(resident), headers: { Authorization: `Bearer ${token}` } }),
  updateResident: (room, patch, token) => request(`/residents/${encodeURIComponent(room)}`, { method: "PATCH", body: JSON.stringify(patch), headers: { Authorization: `Bearer ${token}` } }),
  deleteResident: (room, token) => request(`/residents/${encodeURIComponent(room)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),
};
