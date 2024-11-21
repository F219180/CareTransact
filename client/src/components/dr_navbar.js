import React from "react";
import "./dr_navbar.css";
import logo from "../assets/images/logo.PNG";
import profileImage from "../assets/images/image.jpg";

const Dr_navbar = () => {
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
        <a href="#profile">Profile</a>
      </div>
      <div className="navbar-right">
        <img src={profileImage} alt="Profile" className="navbar-profile" />
      </div>
    </nav>
  );
};

export default Dr_navbar;