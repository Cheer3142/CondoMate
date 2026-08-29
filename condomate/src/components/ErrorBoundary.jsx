import React from "react";

export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Phase 1: log to console. Wire this to a real error-tracking service later.
    console.error("CondoMate crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center", padding: 20 }}>
          <div className="cm-display" style={{ fontSize: 20, fontWeight: 700 }}>เกิดข้อผิดพลาดบางอย่าง</div>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", maxWidth: 320, margin: 0 }}>
            ลองรีเฟรชหน้านี้อีกครั้ง หากยังพบปัญหาอยู่ กรุณาแจ้งทีมพัฒนา
          </p>
          <button className="cm-btn" style={{ marginTop: 8 }} onClick={() => window.location.assign("/")}>
            กลับหน้าแรก
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
