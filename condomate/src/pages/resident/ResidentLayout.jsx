import React from "react";
import { NavLink, Outlet, Link, Navigate } from "react-router-dom";
import { Home, Wrench, Package, Megaphone, CalendarCheck, ArrowLeft, LogOut, Bell } from "lucide-react";
import { useData } from "../../data/store";

const TABS = [
  { to: "/resident", label: "หน้าแรก", icon: Home, end: true },
  { to: "/resident/repair", label: "แจ้งซ่อม", icon: Wrench },
  { to: "/resident/parcel", label: "พัสดุ", icon: Package },
  { to: "/resident/announce", label: "ประกาศ", icon: Megaphone },
  { to: "/resident/booking", label: "จองพื้นที่", icon: CalendarCheck },
];

export default function ResidentLayout() {
  const { session, logout, requestNotificationPermission } = useData();

  if (!session) return <Navigate to="/resident/login" replace />;

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", padding: "20px 12px" }}>
      <div
        className="cm-card"
        style={{ width: "100%", maxWidth: 420, minHeight: 640, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 12px 32px rgba(30,42,56,0.10)" }}
      >
        <div style={{ height: 6, background: "var(--ink)", flexShrink: 0 }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 0" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--ink-soft)", fontSize: 12, textDecoration: "none" }}>
            <ArrowLeft size={13} /> เปลี่ยนมุมมอง
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="cm-mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>ห้อง {session.room}</span>
            {"Notification" in window && Notification.permission !== "granted" && <button onClick={requestNotificationPermission} title="เปิดการแจ้งเตือน" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", display: "flex" }}><Bell size={14} /></button>}
            <button onClick={logout} title="ออกจากระบบ" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", display: "flex" }}>
              <LogOut size={13} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
          <Outlet />
        </div>

        <div style={{ display: "flex", borderTop: "1px solid var(--line)", padding: "8px 4px", flexShrink: 0 }}>
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `cm-navbtn ${isActive ? "active" : ""}`}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 0", textDecoration: "none" }}
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                  <span style={{ fontSize: 10.5, fontWeight: isActive ? 700 : 500 }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
