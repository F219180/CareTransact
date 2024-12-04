import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from './components/Pages/login';
import Signup from './components/Pages/Signup';
import LP from './components/Pages/landingpage';
import Header from './components/header';
import Footer from './components/Footer';
import Doc_home from "./components/Pages/dr_home";
import { AuthProvider } from './context/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ProfilePatient from "./components/Pages/profilePatient";
import SidebarPatient from "./components/Pages/sidebarPatient";

const App = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev); // Toggle sidebar visibility
  };

  const location = useLocation();

  // Determine whether to show the sidebar based on the current path
  const showSidebar = location.pathname === "/profilePatient";

  return (
    <AuthProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="app">
          {/* Conditionally render the sidebar */}
          {showSidebar && (
            <SidebarPatient
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebar}
            />
          )}
          <Routes>
            <Route index element={<LP />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/landingpage" element={<LP />} />
            <Route path="/Header" element={<Header />} />
            <Route path="/Footer" element={<Footer />} />
            <Route path="/Doctor" element={<Doc_home />} />
            <Route path="/profilePatient" element={<ProfilePatient isSidebarVisible={isSidebarVisible} />} />
          </Routes>
        </div>
      </LocalizationProvider>
    </AuthProvider>
  );
};

export default App;
