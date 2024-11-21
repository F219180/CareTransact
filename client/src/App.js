import React from "react";
import Login from './components/Pages/login';
import Signup from './components/Pages/Signup';
import LP from './components/Pages/landingpage';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from './components/header';
import Footer from './components/Footer';

export default function App() {
  return (
    <div>

      <BrowserRouter>
        <Routes>
          <Route index element={<LP />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/landingpage" element={<LP />} />
          <Route path="/Header" element={<Header />} />
          <Route path="/Footer" element={<Footer />} />

        </Routes>
      </BrowserRouter>

    </div>
  );
}