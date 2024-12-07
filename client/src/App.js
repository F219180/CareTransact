import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from './components/Pages/login';
import Signup from './components/Pages/Signup';
import LP from './components/Pages/landingpage';
import Header from './components/header';
import Footer from './components/Footer';
import DrHome from "./components/Pages/dr_home";
import AppointmentManagementCard from "./components/Pages/Doctor_appointment";
import ProfilePatient from "./components/Pages/profilePatient";
import SidebarPatient from "./components/Pages/sidebarPatient";
import SidebarDoctor from "./components/Pages/sidebardoctor"; // Ensure correct import
import { AuthProvider } from './context/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ForgotPassword from './components/Pages/forget_password';

const App = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const location = useLocation();

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  // Determine which sidebar to show based on route
  const isDoctorPage = location.pathname === "/Doctor";
  const isPatientPage = location.pathname === "/profilePatient";
  const isAppointmentPage = location.pathname === "/appointmentslots";

  return (
    <AuthProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="app">
          {/* Conditionally render the appropriate sidebar */}
          {isDoctorPage && (
            <SidebarDoctor
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebar}
            />
          )}
          {isPatientPage && (
            <SidebarPatient
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebar}
            />
          )}
           {isAppointmentPage && (
            <SidebarDoctor
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebar}
            />
          )}

          <Routes>
            <Route index element={<LP />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/landingpage" element={<LP />} />
            <Route path="/Header" element={<Header />} />
            <Route path="/Footer" element={<Footer />} />
            <Route path="/Doctor" element={<DrHome isSidebarVisible={isSidebarVisible} />} />
            <Route path="/profilePatient" element={<ProfilePatient isSidebarVisible={isSidebarVisible} />} />
            <Route path="/appointmentslots" element={<AppointmentManagementCard isSidebarVisible={isSidebarVisible} />} />
            
          </Routes>
        </div>
      </LocalizationProvider>
    </AuthProvider>
  );
};

export default App;
