import React from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, Package, Megaphone, CalendarCheck, ChevronRight } from "lucide-react";
import { useData } from "../../data/store";
import { STATUS_META } from "../../data/seed";
import SectionTitle from "../../components/SectionTitle";

export default function AdminDashboard() {
  const { data } = useData();
  const navigate = useNavigate();
  const openTickets = data.tickets.filter((t) => t.status !== "done");

  const stats = [
    { label: "แจ้งซ่อม", value: data.tickets.length, icon: Wrench, go: "/admin/maintenance" },
    { label: "พัสดุ", value: data.parcels.filter((p) => !p.ack).length, icon: Package, go: "/admin/parcel" },
    { label: "ประกาศ", value: data.announcements.length, icon: Megaphone, go: "/admin/announce" },
    { label: "การจอง", value: Object.keys(data.bookings).length, icon: CalendarCheck, go: "/admin/facility" },
  ];

  return (
    <div>
      <SectionTitle sub="สรุปภาพรวมวันนี้">Dashboard</SectionTitle>
      <div className="cm-admin-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
        {stats.map(({ label, value, icon: Icon, go }) => (
          <button key={label} onClick={() => navigate(go)} className="cm-card" style={{ padding: 14, textAlign: "left", cursor: "pointer" }}>
            <Icon size={17} color="var(--ink-soft)" />
            <div className="cm-display" style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>{value}</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{label}</div>
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
        งานที่ต้องจัดการ
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {openTickets.length === 0 && <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>ไม่มีงานค้าง วันนี้เรียบร้อย 🎉</div>}
        {openTickets.map((t) => (
          <div key={t.id} className="cm-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="cm-dot" style={{ background: STATUS_META[t.status].color, width: 10, height: 10 }} />
              <span className="cm-mono" style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{t.room}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t.type}</span>
            </div>
            <button onClick={() => navigate("/admin/maintenance")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)" }}>
              <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
