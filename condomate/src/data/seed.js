export const REPAIR_TYPES = ["ไฟฟ้า", "ประปา", "แอร์", "ลิฟต์", "โครงสร้าง/ผนัง", "อื่น ๆ"];
export const FACILITIES = ["ฟิตเนส", "สนามแบด", "ห้องประชุม", "ห้องอเนกประสงค์"];
export const SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];

export const STATUS_META = {
  new: { label: "รับเรื่องแล้ว", color: "var(--gold)" },
  progress: { label: "กำลังดำเนินการ", color: "var(--teal)" },
  done: { label: "เสร็จแล้ว", color: "var(--green)" },
};

export function seedState() {
  return {
    tickets: [
      { id: 1024, room: "A-1205", type: "ไฟฟ้า", detail: "ไฟทางเดินหน้าห้องไม่ติด", status: "progress", note: "ช่างจะเข้าตรวจ 14:00" },
      { id: 1023, room: "B-302", type: "ประปา", detail: "น้ำรั่วใต้อ่างล้างจาน", status: "new", note: "" },
      { id: 1019, room: "A-1205", type: "แอร์", detail: "แอร์ส่วนกลางชั้น 5 มีเสียงดัง", status: "done", note: "เปลี่ยนแผ่นกรองแล้ว" },
    ],
    parcels: [
      { id: 501, room: "A-1205", courier: "Flash Express", time: "10:32", ack: false },
      { id: 502, room: "A-1205", courier: "Kerry Express", time: "08:15", ack: false },
    ],
    announcements: [
      { id: 1, title: "แจ้งปิดน้ำประปา", date: "30 สิงหาคม", time: "09:00–12:00", body: "เนื่องจากมีการซ่อมบำรุงท่อเมนของอาคาร ขออภัยในความไม่สะดวก" },
    ],
    bookings: { "ฟิตเนส|30 สิงหาคม|10:00": "A-2101" },
    residents: [
      { room: "A-1205", name: "คุณเจมส์", phone: "081-234-5678", status: "สมาชิก" },
      { room: "B-302", name: "คุณมานี", phone: "089-876-5432", status: "สมาชิก" },
      { room: "A-2101", name: "คุณสมชาย", phone: "090-111-2222", status: "ค้างชำระ" },
    ],
    facilities: FACILITIES.map((f) => ({ name: f, open: "08:00–21:00", capacity: f === "ฟิตเนส" ? 15 : 4 })),
  };
}
