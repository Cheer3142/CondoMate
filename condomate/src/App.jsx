import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import DataGate from "./components/DataGate";

import ResidentLayout from "./pages/resident/ResidentLayout";
import ResidentLogin from "./pages/resident/Login";
import ResidentHome from "./pages/resident/Home";
import ResidentRepair from "./pages/resident/Repair";
import ResidentParcel from "./pages/resident/Parcel";
import ResidentAnnounce from "./pages/resident/Announce";
import ResidentBooking from "./pages/resident/Booking";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMaintenance from "./pages/admin/Maintenance";
import AdminParcel from "./pages/admin/Parcel";
import AdminAnnounce from "./pages/admin/Announce";
import AdminFacility from "./pages/admin/Facility";
import AdminResidents from "./pages/admin/Residents";
import AdminLogin from "./pages/admin/Login";

export default function App() {
  return (
    <DataGate>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/resident/login" element={<ResidentLogin />} />
        <Route path="/resident" element={<ResidentLayout />}>
          <Route index element={<ResidentHome />} />
          <Route path="repair" element={<ResidentRepair />} />
          <Route path="parcel" element={<ResidentParcel />} />
          <Route path="announce" element={<ResidentAnnounce />} />
          <Route path="booking" element={<ResidentBooking />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="maintenance" element={<AdminMaintenance />} />
          <Route path="parcel" element={<AdminParcel />} />
          <Route path="announce" element={<AdminAnnounce />} />
          <Route path="facility" element={<AdminFacility />} />
          <Route path="residents" element={<AdminResidents />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </DataGate>
  );
}
