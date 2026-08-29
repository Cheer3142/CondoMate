import React, { useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useData } from "../../data/store";
import SectionTitle from "../../components/SectionTitle";

const empty = { room: "", name: "", phone: "", status: "active" };

export default function AdminResidents() {
  const { data, addResident, updateResident, deleteResident } = useData();
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    if (!/^\d{3}$/.test(form.room)) { setMessage("เลขห้องต้องเป็นตัวเลข 3 หลัก"); return; }
    if (editing) updateResident(editing, { name: form.name, phone: form.phone, status: form.status });
    else addResident(form);
    setForm(empty); setEditing(null); setMessage("");
  };
  const edit = (resident) => { setEditing(resident.room); setForm(resident); setMessage(""); };
  const cancel = () => { setEditing(null); setForm(empty); setMessage(""); };
  return <div>
    <SectionTitle sub="จัดการเลขห้องและข้อมูลลูกบ้าน — เพิ่มห้องได้จากหน้านี้เท่านั้น">ลูกบ้าน</SectionTitle>
    <form onSubmit={submit} className="cm-card" style={{ padding: 16, marginBottom: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(90px,.6fr) 1fr 1fr minmax(110px,.7fr) auto", gap: 10, alignItems: "end" }}>
        <label style={{ fontSize: 12, fontWeight: 700 }}>ห้อง<input disabled={!!editing} className="cm-input" style={{ marginTop: 4 }} value={form.room} inputMode="numeric" maxLength={3} onChange={(e) => change("room", e.target.value.replace(/\D/g, ""))} placeholder="999" /></label>
        <label style={{ fontSize: 12, fontWeight: 700 }}>ชื่อ<input className="cm-input" style={{ marginTop: 4 }} value={form.name} onChange={(e) => change("name", e.target.value)} /></label>
        <label style={{ fontSize: 12, fontWeight: 700 }}>เบอร์โทร<input className="cm-input" style={{ marginTop: 4 }} value={form.phone} onChange={(e) => change("phone", e.target.value)} /></label>
        <label style={{ fontSize: 12, fontWeight: 700 }}>สถานะ<select className="cm-input" style={{ marginTop: 4 }} value={form.status} onChange={(e) => change("status", e.target.value)}><option value="active">ใช้งาน</option><option value="inactive">ไม่ใช้งาน</option></select></label>
        <div style={{ display: "flex", gap: 6 }}><button className="cm-btn" title={editing ? "บันทึก" : "เพิ่มห้อง"}>{editing ? <Save size={15} /> : <Plus size={15} />}{editing ? "บันทึก" : "เพิ่ม"}</button>{editing && <button type="button" onClick={cancel} className="cm-btn" style={{ background: "var(--ink-soft)" }} title="ยกเลิก"><X size={15} /></button>}</div>
      </div>
      {message && <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--red)" }}>{message}</p>}
    </form>
    <div className="cm-card" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 570 }}>
        <thead><tr style={{ background: "#F5F3EE", textAlign: "left" }}>{["ห้อง", "ชื่อ", "เบอร์โทร", "สถานะ", "จัดการ"].map((heading) => <th key={heading} style={{ padding: "10px 14px", fontSize: 11.5, color: "var(--ink-soft)" }}>{heading}</th>)}</tr></thead>
        <tbody>{data.residents.map((resident) => <tr key={resident.room} style={{ borderTop: "1px solid var(--line)" }}>
          <td className="cm-mono" style={{ padding: "10px 14px" }}>{resident.room}</td><td style={{ padding: "10px 14px", fontWeight: 600 }}>{resident.name || "—"}</td><td style={{ padding: "10px 14px" }}>{resident.phone || "—"}</td>
          <td style={{ padding: "10px 14px", color: resident.status === "active" ? "var(--green)" : "var(--red)" }}>{resident.status === "active" ? "ใช้งาน" : "ไม่ใช้งาน"}</td>
          <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}><button onClick={() => edit(resident)} title="แก้ไข" style={{ border: 0, background: "none", cursor: "pointer", color: "var(--teal)" }}><Pencil size={16} /></button><button onClick={() => { if (window.confirm(`ลบห้อง ${resident.room} และข้อมูลที่เกี่ยวข้อง?`)) deleteResident(resident.room); }} title="ลบ" style={{ border: 0, background: "none", cursor: "pointer", color: "var(--red)" }}><Trash2 size={16} /></button></td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}
