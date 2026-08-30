import React, { useState } from "react";
import { Plus, Check } from "lucide-react";
import { useData } from "../../data/store";
import SectionTitle from "../../components/SectionTitle";

export default function AdminParcel() {
  const { data, addParcel } = useData();
  const [room, setRoom] = useState("");
  const [courier, setCourier] = useState("");
  const [message, setMessage] = useState("");

  const submit = async () => {
    if (!room.trim() || !courier.trim()) return;
    const time = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    const result = await addParcel({ room: room.trim(), courier: courier.trim(), time });
    if (!result.ok) { setMessage(`เพิ่มพัสดุไม่สำเร็จ: ${result.error}`); return; }
    setRoom(""); setCourier("");
    setMessage("เพิ่มพัสดุเรียบร้อย");
  };

  return (
    <div>
      <SectionTitle sub="กรอกพัสดุที่มาถึง ลูกบ้านจะได้รับแจ้งทันที">พัสดุ</SectionTitle>
      <div className="cm-card" style={{ padding: 16, display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)" }}>ห้อง</label>
          <input className="cm-input" style={{ marginTop: 4 }} placeholder="เช่น A-1205" value={room} onChange={(e) => setRoom(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)" }}>ผู้ให้บริการขนส่ง</label>
          <input className="cm-input" style={{ marginTop: 4 }} placeholder="เช่น Flash Express" value={courier} onChange={(e) => setCourier(e.target.value)} />
        </div>
        <button onClick={submit} className="cm-btn" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={15} />เพิ่มพัสดุ
        </button>
      </div>
      {message && <p style={{ fontSize: 12, color: message.includes("ไม่สำเร็จ") ? "var(--red)" : "var(--green)", margin: "-10px 0 14px" }}>{message}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.parcels.map((p) => (
          <div key={p.id} className="cm-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span className="cm-mono" style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{p.room}</span>
              <span style={{ fontSize: 13.5 }}>{p.courier}</span>
              <span className="cm-mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>{p.time}</span>
            </div>
            {p.ack ? (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "var(--green)" }}><Check size={14} />รับแล้ว</span>
            ) : (
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)" }}>รอรับ</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
