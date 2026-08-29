import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { api } from "./api";

/**
 * Phase 1 data layer — now backed by the real API in server/.
 *
 * `data` is loaded once from GET /api/state on mount. Every action below
 * calls the matching endpoint and replaces `data` with the server's
 * response, so the app always reflects what's actually persisted (no
 * separate optimistic-update bookkeeping to keep in sync).
 *
 * The resident "session" (which room is signed in) still lives in
 * localStorage — it's a stand-in for real auth, not app data, so it doesn't
 * need to round-trip through the server. `login()` does register the room
 * with the backend, since the residents list itself is shared data.
 */

const SESSION_KEY = "condomate.session.v1";
const ADMIN_SESSION_KEY = "condomate.admin-session.v1";
const DataContext = createContext(null);

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(loadSession);
  const [adminSession, setAdminSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || "null"); } catch { return null; }
  });
  const previousData = useRef(null);

  const refresh = useCallback(() => {
    const activeToken = adminSession?.token || session?.token;
    if (!activeToken) return Promise.resolve();
    setError(null);
    return api.getState(activeToken).then(setData).catch((e) => setError(e.message));
  }, [adminSession?.token, session?.token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    try {
      if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }, [session]);

  useEffect(() => {
    try {
      if (adminSession) localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminSession));
      else localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch { /* ignore */ }
  }, [adminSession]);

  useEffect(() => {
    if (!data || !session) { previousData.current = data; return; }
    const before = previousData.current;
    previousData.current = data;
    if (!before || !("Notification" in window) || Notification.permission !== "granted") return;
    const newParcel = data.parcels.find((p) => p.room === session.room && !p.ack && !before.parcels.some((old) => old.id === p.id));
    const statusChanged = data.tickets.find((t) => t.room === session.room && before.tickets.find((old) => old.id === t.id)?.status !== t.status);
    if (newParcel) new Notification("CondoMate: มีพัสดุของคุณ", { body: `${newParcel.courier} มาถึง ${newParcel.time}` });
    else if (statusChanged) new Notification("CondoMate: แจ้งซ่อมอัปเดตแล้ว", { body: `${statusChanged.type} — ${statusChanged.status}` });
  }, [data, session]);

  useEffect(() => {
    const timer = window.setInterval(refresh, 20000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  // Every action: call the API, apply the returned state, surface errors
  // (e.g. backend not running) instead of failing silently.
  const run = (promise) => promise.then(setData).catch((e) => setError(e.message));

  const actions = {
    addTicket: (t) => run(api.addTicket(t, session?.token)),
    updateTicket: (id, patch) => run(api.updateTicket(id, patch, adminSession?.token)),
    addParcel: (p) => run(api.addParcel(p, adminSession?.token)),
    ackParcel: (id) => run(api.ackParcel(id, session?.token)),
    addAnnouncement: (a) => run(api.addAnnouncement(a, adminSession?.token)),
    deleteAnnouncement: (id) => run(api.deleteAnnouncement(id, adminSession?.token)),
    bookSlot: (key) => run(api.bookSlot(key, session?.token)),
    cancelBooking: (key) => run(api.cancelBooking(key, session?.token)),
    updateFacility: (name, patch) => run(api.updateFacility(name, patch, adminSession?.token)),
    addResident: (resident) => run(api.addResident(resident, adminSession?.token)),
    updateResident: (room, patch) => run(api.updateResident(room, patch, adminSession?.token)),
    deleteResident: (room) => run(api.deleteResident(room, adminSession?.token)),
    retry: refresh,

    login: async (room, password) => {
      const trimmed = room.trim();
      if (!trimmed) return false;
      try {
        const result = await api.login(trimmed, password);
        setData(result.state);
        setSession({ room: trimmed, name: result.resident?.name || trimmed, token: result.token });
        return true;
      } catch (e) {
        setError(e.message);
        return false;
      }
    },
    logout: () => setSession(null),

    loginAdmin: async (username, password) => {
      try {
        const result = await api.adminLogin(username, password);
        setAdminSession(result);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    },
    logoutAdmin: () => {
      if (adminSession?.token) api.adminLogout(adminSession.token).catch(() => {});
      setAdminSession(null);
    },
    requestNotificationPermission: async () => {
      if (!("Notification" in window)) return "unsupported";
      return Notification.requestPermission();
    },
  };

  return (
    <DataContext.Provider value={{ data, error, session, adminSession, ...actions }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}
