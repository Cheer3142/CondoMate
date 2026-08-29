import React from "react";
import { NavLink, Outlet, Link, Navigate } from "react-router-dom";
import { LayoutDashboard, Wrench, Package, Megaphone, Settings, Users, ArrowLeft, LogOut } from "lucide-react";
import { useData } from "../../data/store";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/maintenance", label: "แจ้งซ่อม", icon: Wrench },
  { to: "/admin/parcel", label: "พัสดุ", icon: Package },
  { to: "/admin/announce", label: "ประกาศ", icon: Megaphone },
  { to: "/admin/facility", label: "ส่วนกลาง", icon: Settings },
  { to: "/admin/residents", label: "ลูกบ้าน", icon: Users },
];

export default function AdminLayout() {
  const { adminSession, logoutAdmin } = useData();
  if (!adminSession) return <Navigate to="/admin/login" replace />;
  return (
    <div className="cm-admin-shell">
      <div className="cm-card cm-admin-frame">
        <div className="cm-admin-sidebar">
          <div className="cm-display cm-brand" style={{ color: "#fff", fontWeight: 700, fontSize: 15, padding: "0 10px 6px" }}>นิติบุคคล</div>
          <Link className="cm-switch-view" to="/" style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", fontSize: 11.5, textDecoration: "none", padding: "0 10px 14px" }}>
            <ArrowLeft size={12} /> เปลี่ยนมุมมอง
          </Link>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 8,
                fontSize: 13, fontWeight: 600, textDecoration: "none",
                background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
              })}
            >
              <Icon size={16} />{label}
            </NavLink>
          ))}
          <button onClick={logoutAdmin} style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", border: 0, borderRadius: 8, background: "transparent", color: "rgba(255,255,255,0.55)", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>
            <LogOut size={16} />ออกจากระบบ
          </button>
        </div>

        <div className="cm-admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
