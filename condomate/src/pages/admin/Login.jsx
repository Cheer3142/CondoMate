import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useData } from "../../data/store";

export default function AdminLogin() {
  const { adminSession, loginAdmin } = useData();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  if (adminSession) return <Navigate to="/admin" replace />;
  const submit = async (event) => {
    event.preventDefault();
    const result = await loginAdmin(username, password);
    if (!result.ok) setMessage(result.error === "invalid username or password" ? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" : `เข้าสู่ระบบไม่ได้: ${result.error}`);
  };
  return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
    <form onSubmit={submit} className="cm-card" style={{ width: "100%", maxWidth: 360, padding: 24 }}>
      <div className="cm-display" style={{ fontSize: 22, fontWeight: 700 }}>CondoMate Admin</div>
      <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: "4px 0 20px" }}>เข้าสู่ระบบสำหรับนิติบุคคล</p>
      <label style={{ fontSize: 12, fontWeight: 700 }}>ชื่อผู้ใช้</label>
      <input required className="cm-input" style={{ margin: "6px 0 12px" }} value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
      <label style={{ fontSize: 12, fontWeight: 700 }}>รหัสผ่าน</label>
      <input required type="password" className="cm-input" style={{ margin: "6px 0 16px" }} value={password} onChange={(e) => setPassword(e.target.value)} />
      {message && <p style={{ color: "var(--red)", fontSize: 12, margin: "0 0 12px" }}>{message}</p>}
      <button className="cm-btn" style={{ width: "100%" }}>เข้าสู่ระบบ</button>
    </form>
  </div>;
}
