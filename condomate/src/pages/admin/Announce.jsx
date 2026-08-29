import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useData } from "../../data/store";
import SectionTitle from "../../components/SectionTitle";

export default function AdminAnnounce() {
  const { data, addAnnouncement, deleteAnnouncement } = useData();
  const [form, setForm] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [body, setBody] = useState("");

  const submit = () => {
    if (!title.trim() || !body.trim()) return;
    addAnnouncement({ title, date, time, body });
    setTitle(""); setDate(""); setTime(""); setBody(""); setForm(false);
  };

  return (
    <div>
      <SectionTitle sub="สร้างและจัดการประกาศถึงลูกบ้านทุกห้อง">ประกาศ</SectionTitle>
      <button onClick={() => setForm((f) => !f)} className="cm-btn" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
        {form ? <X size={15} /> : <Plus size={15} />} {form ? "ยกเลิก" : "สร้างประกาศ"}
      </button>

      {form && (
        <div className="cm-card" style={{ padding: 16, marginBottom: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          <input className="cm-input" placeholder="หัวข้อประกาศ" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div style={{ display: "flex", gap: 10 }}>
            <input className="cm-input" placeholder="วันที่ เช่น 30 สิงหาคม" value={date} onChange={(e) => setDate(e.target.value)} />
            <input className="cm-input" placeholder="เวลา เช่น 09:00–12:00" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <textarea className="cm-input" style={{ minHeight: 70, resize: "none" }} placeholder="รายละเอียด" value={body} onChange={(e) => setBody(e.target.value)} />
          <button onClick={submit} className="cm-btn" style={{ alignSelf: "flex-start" }}>เผยแพร่ประกาศ</button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.announcements.map((a) => (
          <div key={a.id} className="cm-card" style={{ padding: 14, display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</div>
              <div className="cm-mono" style={{ fontSize: 12, color: "var(--ink-soft)", margin: "4px 0" }}>{a.date} · {a.time}</div>
              <div style={{ fontSize: 13 }}>{a.body}</div>
            </div>
            <button onClick={() => deleteAnnouncement(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", height: "fit-content" }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
