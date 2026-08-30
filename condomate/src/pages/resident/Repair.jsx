import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { useData } from "../../data/store";
import { REPAIR_TYPES } from "../../data/seed";
import SectionTitle from "../../components/SectionTitle";
import StatusPill from "../../components/StatusPill";
import ProtectedImage from "../../components/ProtectedImage";

export default function ResidentRepair() {
  const { data, session, addTicket } = useData();
  const [type, setType] = useState(REPAIR_TYPES[0]);
  const [detail, setDetail] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [image, setImage] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  const tickets = data.tickets.filter((t) => t.room === session.room);

  const submit = async () => {
    if (!detail.trim()) { setMessage("กรุณากรอกรายละเอียดปัญหา"); return; }
    const result = await addTicket({ type, detail, image });
    if (!result.ok) { setMessage(`ส่งแจ้งซ่อมไม่สำเร็จ: ${result.error}`); return; }
    setDetail("");
    setImage("");
    setPhotoName("");
    setSent(true);
    setMessage("");
    setTimeout(() => setSent(false), 2200);
  };

  return (
    <div>
      <SectionTitle sub="แจ้งปัญหาในห้องหรือพื้นที่ส่วนกลาง">แจ้งซ่อม</SectionTitle>

      <div className="cm-card" style={{ padding: 16, marginBottom: 18 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>ประเภท</label>
        <select className="cm-input" style={{ marginTop: 6, marginBottom: 12 }} value={type} onChange={(e) => setType(e.target.value)}>
          {REPAIR_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>

        <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>รายละเอียด</label>
        <textarea
          className="cm-input"
          style={{ marginTop: 6, marginBottom: 12, minHeight: 70, resize: "none" }}
          placeholder="เช่น ไฟทางเดินหน้าห้องไม่ติด"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />

        <label className="cm-input" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "var(--ink-soft)", cursor: "pointer", marginBottom: 14 }}>
          <ImageIcon size={16} /> {photoName || "เพิ่มรูป"}
          <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) { setPhotoName("รูปต้องมีขนาดไม่เกิน 2 MB"); return; }
            const reader = new FileReader();
            reader.onload = () => { setImage(String(reader.result)); setPhotoName(file.name); };
            reader.readAsDataURL(file);
          }} />
        </label>
        {image && <img src={image} alt="รูปที่แนบ" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 10, marginTop: -6, marginBottom: 14, border: "1px solid var(--line)" }} />}

        <button onClick={submit} className="cm-btn" style={{ width: "100%" }}>
          {sent ? "ส่งแจ้งซ่อมแล้ว ✓" : "ส่งแจ้งซ่อม"}
        </button>
        {message && <p style={{ color: "var(--red)", fontSize: 12, margin: "10px 0 0" }}>{message}</p>}
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
        สถานะของฉัน
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tickets.length === 0 && <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>ยังไม่มีรายการแจ้งซ่อม</div>}
        {tickets.map((t) => (
          <div key={t.id} className="cm-card" style={{ padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t.type}</span>
              <StatusPill status={t.status} />
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 4 }}>{t.detail}</div>
            {t.imageUrl && <ProtectedImage src={t.imageUrl} token={session.token} alt="รูปแจ้งซ่อม" style={{ width: "100%", maxHeight: 150, objectFit: "cover", borderRadius: 8, marginTop: 8 }} />}
            {t.note && <div className="cm-mono" style={{ fontSize: 11.5, color: "var(--teal)", marginTop: 6 }}>หมายเหตุ: {t.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
