import React, { useState } from "react";
import "./dr_home.css";
import DocImage from "../../assets/images/doc1.jpg";
import editIcon from "../../assets/images/edit_profile.png";

const DoctorProfile = ({ isSidebarVisible, toggleSidebar }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "Dr. Ahmed Masood Ghuman",
        specialty: "Consultant Orthopedic Surgeon",
        education: "MBBS, FRCS, AO Trauma Fellow, Germany",
        services: [
            "Joint Replacement Surgery",
            "Arthroscopic Surgery",
            "Trauma Surgery",
            "Reconstructive Surgery",
            "Sports Surgery",
        ],
    });
    const [uploadedImage, setUploadedImage] = useState(null);

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value,
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => setUploadedImage(e.target.result);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const addService = () => {
        setProfileData({
            ...profileData,
            services: [...profileData.services, ""],
        });
    };

    const removeService = (index) => {
        const newServices = profileData.services.filter((_, i) => i !== index);
        setProfileData({
            ...profileData,
            services: newServices,
        });
    };

    const handleServiceChange = (index, value) => {
        const newServices = [...profileData.services];
        newServices[index] = value;
        setProfileData({
            ...profileData,
            services: newServices,
        });
    };

    return (
        <div className={`doc-home-container ${isSidebarVisible ? "sidebar-visible" : "sidebar-hidden"}`}>
            <div className="scrollable-container">
                <div className={`doctor-profile-card ${isSidebarVisible ? "with-sidebar" : ""}`}>
                    <div className="profile-image-container-doc">
                        <img
                            src={uploadedImage || DocImage}
                            alt="Doctor"
                            className="profile-image-doc"
                        />
                        {isEditMode && (
                            <label className="edit-icon">
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleImageChange}
                                />
                                <img src={editIcon} alt="Edit" className="edit-icon-image" />
                            </label>
                        )}
                        <button className="edit-profile-btn" onClick={toggleEditMode}>
                            {isEditMode ? "Save Changes" : "Edit Profile"}
                        </button>
                    </div>
                    <div className={`profile-details ${isEditMode ? "scrollable-form-container" : ""}`}>
                        {isEditMode && <h4>Full Name</h4>}
                        <h3>
                            {isEditMode ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleInputChange}
                                    className="profile-input"
                                />
                            ) : (
                                profileData.name
                            )}
                        </h3>
                        <p className="specialty">
                            {isEditMode && <h4>Specialty</h4>}
                            {isEditMode ? (
                                <input
                                    type="text"
                                    name="specialty"
                                    value={profileData.specialty}
                                    onChange={handleInputChange}
                                    className="profile-input"
                                />
                            ) : (
                                profileData.specialty
                            )}
                        </p>
                        <p>
                            <h4>Medical Education:</h4>
                            {isEditMode ? (
                                <input
                                    type="text"
                                    name="education"
                                    value={profileData.education}
                                    onChange={handleInputChange}
                                    className="profile-input"
                                />
                            ) : (
                                profileData.education
                            )}
                        </p>
                        <h4>Services</h4>
                        <ul>
                            {profileData.services.map((service, index) => (
                                <li key={index}>
                                    {isEditMode ? (
                                        <div className="number-control">
                                            <input
                                                type="text"
                                                value={service}
                                                onChange={(e) => handleServiceChange(index, e.target.value)}
                                                className="profile-input"
                                            />
                                            <button className="plus" onClick={addService}>+</button>
                                            <button
                                                className="minus"
                                                onClick={() => removeService(index)}
                                            >
                                                -
                                            </button>
                                        </div>
                                    ) : (
                                        service
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
