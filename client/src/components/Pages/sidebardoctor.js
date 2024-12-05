import React from "react";
import "./sidebarPatient.css";
import NavIcon from "../../assets/images/nav_icon.png";
import Logo from "../../assets/images/CT_logo.png";
import LogoutIcon from "../../assets/images/logout.png";
//comminting
const Sidebardoctor = ({ isSidebarVisible, toggleSidebar }) => {
    return (
        <>
            {/* Sidebar Toggle Button */}
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                <img src={NavIcon} alt="Toggle Sidebar" />
            </button>

            {/* Sidebar */}
            <div className={`sidebar ${isSidebarVisible ? "visible" : "hidden"}`}>
                <div className="sidebar-logo">
                    <img src={Logo} alt="CareTransact Logo" className="logo" />
                    <h4>CareTransact</h4>
                </div>
                <ul className="sidebar-menu">
                    <li><a href="/profilePatient">Home</a></li>
                    <li><a href="/reports">Appointment Slots</a></li>
                    <li><a href="/prescriptions">Prescription</a></li>
                    <li><a href="/lab-results">Lab Results</a></li>
                    <li><a href="/reports">Reports</a></li>
                    <li><a href="/reports">Patients</a></li>
                    <li className="logout">
                        <a href="/logout">
                            <img src={LogoutIcon} alt="Logout" className="logout-icon" /> <b>Logout</b>
                        </a>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default Sidebardoctor;
