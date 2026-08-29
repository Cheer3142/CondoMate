# CondoMate — Phase 1 MVP

React + Vite frontend, Express backend, responsive web installable as a PWA.
No native app in Phase 1.

## Run it (two terminals)

**Terminal 1 — backend**
```bash
cd server
npm install
npm run dev        # http://localhost:4000, data persisted to server/data/db.json
```

**Terminal 2 — frontend**
```bash
npm install
npm run dev         # http://localhost:5173
```

Start the backend first — the frontend shows a "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้" screen
with a retry button if it can't reach the API on load.

The frontend calls `http://localhost:4000/api` by default. To point it
somewhere else, copy `.env.example` to `.env.local` and change `VITE_API_URL`.

Open the printed local URL. On a phone on the same network, open the URL and
use "Add to Home Screen" — it installs and runs full-screen like an app (the
phone will need `VITE_API_URL` reachable from it too, not `localhost`).

```bash
npm run build     # production build, output in dist/
npm run preview   # serve the production build locally
```

## What's in Phase 1

- `/` — pick resident or admin (stand-in for real role-based login later)
- `/resident/login` — enter a room number (+ optional name) to "sign in"; new
  rooms are added to the residents list automatically
- `/resident/*` — home, แจ้งซ่อม, พัสดุ, ประกาศ, จองพื้นที่ส่วนกลาง (5 tabs, phone-shaped layout)
- `/admin/*` — Dashboard, แจ้งซ่อม, พัสดุ, ประกาศ, ส่วนกลาง, ลูกบ้าน (sidebar, desktop-shaped layout)
- Unknown URLs show a 404 page; a top-level error boundary catches runtime
  crashes instead of a blank white screen

## Backend

## New core flows

- `/admin/login` protects the juristic-person portal. Local demo credentials are
  `admin` / `condomate-admin`; set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in the
  backend environment before deployment.
- Repair tickets accept PNG, JPEG, or WebP photos up to 4 MB. Files are stored
  under `server/uploads/` and visible to residents and staff.
- Residents can use the bell icon to allow browser notifications. While the
  app is open, it checks every 20 seconds for new parcels and ticket changes.

`server/` is a small Express API (`server/index.js`) backed by a single JSON
file (`server/data/db.json`, created on first run, gitignored). Routes:

| Method | Path                          | Does |
|---|---|---|
| GET    | `/api/state`                  | full app state |
| POST   | `/api/tickets`                | new repair ticket |
| PATCH  | `/api/tickets/:id`             | update status/note |
| POST   | `/api/parcels`                | log an incoming parcel |
| PATCH  | `/api/parcels/:id/ack`         | resident acknowledges pickup |
| POST   | `/api/announcements`          | publish an announcement |
| DELETE | `/api/announcements/:id`      | remove an announcement |
| POST   | `/api/bookings`               | book a facility slot |
| PATCH  | `/api/facilities/:name`       | update open hours/capacity |
| POST   | `/api/session/login`          | register/confirm a resident's room |
| POST   | `/api/admin/login`            | create admin session |

Every mutating route returns the full updated state, and the frontend
(`src/data/store.jsx`) just replaces its local copy with the response — this
keeps both sides simple for Phase 1, at the cost of over-fetching on every
action. Fine at condo scale; revisit if it ever needs to scale further.

The frontend's fetch wrapper lives in `src/data/api.js` — if the API shape
ever changes, that's the only file that needs to change.

## Before this is real

- **Auth**: `/resident/login` accepts any room number with no password/OTP,
  and `POST /api/session/login` doesn't check identity either — it's a
  stand-in so the demo doesn't need a fixed unit. Add real authentication
  (and a separate login for นิติบุคคล staff — `/admin` currently has none at
  all) before this ships. Every admin route is also currently unprotected —
  add an auth check server-side, not just a hidden URL.
- **Database**: `server/db.js` is a single JSON file with no concurrent-write
  protection — fine for a demo or one condo's low traffic, but swap it for a
  real database before this handles multiple staff editing at once. The
  routes in `server/index.js` only call `db.js`'s exported functions, so the
  swap is contained to that one file.
- **Push notifications**: parcel/status updates only appear when the app is
  open. Real-time alerts need either polling, WebSockets, or Web Push —
  none are wired up yet.
- **Icons**: real PNG icons are already in `public/icons/` (192, 512, and a
  512 maskable variant), generated from the placeholder mark — swap them for
  your actual logo before shipping.
- **Image upload** on the แจ้งซ่อม form is a placeholder button; no file is
  actually attached or uploaded to the backend yet.

## Deliberately not in Phase 1

Payment/accounting, e-Voting, visitor management, real-time chat,
marketplace, social feed, AI chatbot, smart home / IoT, CCTV integration,
multi-condo, multi-language, ERP. Add these later, once the core loop above
is in real use.
