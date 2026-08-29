import React from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, Package, CalendarCheck, Megaphone } from "lucide-react";
import { useData } from "../../data/store";

export default function ResidentHome() {
  const { data, session } = useData();
  const navigate = useNavigate();
  const myRoom = session.room;

  const myTickets = data.tickets.filter((t) => t.room === myRoom && t.status !== "done");
  const myParcels = data.parcels.filter((p) => p.room === myRoom && !p.ack);
  const announcement = data.announcements[0];

  const quick = [
    { to: "/resident/repair", label: "แจ้งซ่อม", icon: Wrench, badge: myTickets.length || null },
    { to: "/resident/parcel", label: `พัสดุ ${myParcels.length} รายการ`, icon: Package, badge: myParcels.length || null },
    { to: "/resident/booking", label: "จองส่วนกลาง", icon: CalendarCheck },
    { to: "/resident/announce", label: "ประกาศ", icon: Megaphone },
  ];

  return (
    <div>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: "0 0 2px" }}>สวัสดีครับ</p>
      <h1 className="cm-display" style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{session.name} 👋</h1>
      <div className="cm-mono" style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>ห้อง {myRoom}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
        {quick.map(({ to, label, icon: Icon, badge }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="cm-card"
            style={{ position: "relative", textAlign: "left", padding: 14, cursor: "pointer", border: "1px solid var(--line)" }}
          >
            <Icon size={20} />
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>{label}</div>
            {badge ? (
              <span style={{ position: "absolute", top: 10, right: 10, background: "var(--red)", color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 999, minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                {badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
          ประกาศล่าสุด
        </div>
        {announcement ? (
          <div className="cm-card" style={{ padding: 14, borderLeft: "3px solid var(--gold)" }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{announcement.title}</div>
            <div className="cm-mono" style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
              {announcement.date} · {announcement.time}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>ยังไม่มีประกาศ</div>
        )}
      </div>
    </div>
  );
}
