import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useData } from "../../data/store";

export default function ResidentLogin() {
  const { session, login } = useData();
  const [room, setRoom] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  if (session) return <Navigate to="/resident" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\d{3}$/.test(room)) { setMessage("กรุณากรอกเลขห้อง 3 หลัก"); return; }
    const ok = await login(room, password);
    if (!ok) setMessage("เลขห้องหรือรหัสผ่านไม่ถูกต้อง");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
      <form onSubmit={submit} className="cm-card" style={{ width: "100%", maxWidth: 340, padding: 24 }}>
        <div className="cm-display" style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>CondoMate</div>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 18px" }}>เข้าสู่ระบบด้วยเลขห้องของคุณ</p>

        <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>เลขห้อง</label>
        <input className="cm-input" style={{ marginTop: 6, marginBottom: 18 }} placeholder="เช่น 999" value={room} inputMode="numeric" maxLength={3} onChange={(e) => setRoom(e.target.value.replace(/\D/g, ""))} autoFocus />
        <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>รหัสผ่าน</label>
        <input required type="password" className="cm-input" style={{ marginTop: 6, marginBottom: 18 }} value={password} onChange={(e) => setPassword(e.target.value)} />
        {message && <p style={{ color: "var(--red)", fontSize: 12, margin: "-8px 0 12px" }}>{message}</p>}

        <button type="submit" className="cm-btn" style={{ width: "100%" }}>เข้าสู่ระบบ</button>
        <p style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 12, marginBottom: 0 }}>
          ใช้เลขห้อง 3 หลักที่นิติบุคคลเพิ่มให้เท่านั้น
        </p>
      </form>
    </div>
  );
}
