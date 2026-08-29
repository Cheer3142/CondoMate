import React, { useState } from "react";
import { useData } from "../../data/store";
import { SLOTS } from "../../data/seed";
import SectionTitle from "../../components/SectionTitle";

export default function ResidentBooking() {
  const { data, session, bookSlot, cancelBooking } = useData();
  const [facility, setFacility] = useState(() => data.facilities[0]?.name || "");
  const [message, setMessage] = useState("");
  const date = "30 สิงหาคม";

  return (
    <div>
      <SectionTitle sub="เลือกพื้นที่และช่วงเวลาที่ว่าง">จองพื้นที่ส่วนกลาง</SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {data.facilities.map(({ name: f }) => (
          <button
            key={f}
            onClick={() => setFacility(f)}
            style={{
              padding: "7px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              border: "1px solid var(--line)",
              background: facility === f ? "var(--ink)" : "#fff",
              color: facility === f ? "#fff" : "var(--ink)",
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="cm-mono" style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{date}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {SLOTS.map((s) => {
          const key = `${facility}|${date}|${s}`;
          const takenBy = data.bookings[key];
          const mine = takenBy === session.room;
          return (
            <button
              key={s}
              disabled={!!takenBy && !mine}
              onClick={async () => {
                if (mine) { await cancelBooking(key); setMessage("ยกเลิกการจองแล้ว"); }
                else { await bookSlot(key); setMessage(`จอง ${f} เวลา ${s} แล้ว`); }
              }}
              className="cm-slot"
              style={{
                padding: "12px 10px", borderRadius: 10, textAlign: "left", cursor: takenBy && !mine ? "not-allowed" : "pointer",
                border: `1px solid ${mine ? "var(--green)" : "var(--line)"}`,
                background: mine ? "rgba(62,142,90,0.08)" : takenBy ? "#F4F2EE" : "#fff",
              }}
            >
              <div className="cm-mono" style={{ fontWeight: 700, fontSize: 14 }}>{s}</div>
              <div style={{ fontSize: 11.5, color: mine ? "var(--green)" : takenBy ? "var(--ink-soft)" : "var(--teal)", marginTop: 2, fontWeight: 600 }}>
                {mine ? "จองแล้ว · กดเพื่อยกเลิก" : takenBy ? "ถูกจอง" : "ว่าง · กดเพื่อจอง"}
              </div>
            </button>
          );
        })}
      </div>
      {message && <p style={{ color: "var(--green)", fontSize: 12, fontWeight: 600, margin: "12px 0 0" }}>{message}</p>}
    </div>
  );
}
