import React, { useState } from "react";
import "./dr_navbar.css";
import logo from "../assets/images/CT_logo.png";
import profileImage from "../assets/images/image.jpg";

const Dr_navbar = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="CareTransact Logo" className="navbar-logo" />
        <h1 className="navbar-title">CareTransact</h1>
      </div>
      <div className="navbar-links">
        <a href="#dashboard">Home</a>
        <a href="#appointments">Appointments</a>
        <a href="#patients">Patients</a>
        <a href="#claims">Claims</a>
        <a href="#profile" onClick={() => setShowProfileMenu(true)}>Profile</a>
      </div>
      {showProfileMenu && (
        <div className="profile-menu">
          <h2>My Profile</h2>
          <p>Email: myemail@example.com</p>
          <button onClick={() => setShowProfileMenu(false)}>Edit Profile</button>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </nav>
  );
};

const logout = () => {
  // implement logout logic here
};

export default Dr_navbar;
