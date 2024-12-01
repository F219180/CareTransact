import React from "react";
import Login from './components/Pages/login';
import Signup from './components/Pages/Signup';
import LP from './components/Pages/landingpage';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from './components/header';
import Footer from './components/Footer';
import Doc_home from "./components/Pages/dr_home";
import { AuthProvider } from './context/AuthContext'; // Adjust the path if needed

export default function App() {
  return (
    <AuthProvider> {/* Wrap the entire app with AuthProvider */}
      <div>
        <BrowserRouter>
          <Routes>
            <Route index element={<LP />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/landingpage" element={<LP />} />
            <Route path="/Header" element={<Header />} />
            <Route path="/Footer" element={<Footer />} />
            <Route path="/Doctor" element={<Doc_home />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}
