import React, { useState, useEffect } from "react";
import "./dr_home.css";
import DocImage from "../../assets/images/image.jpg";
import editIcon from "../../assets/images/edit_profile.png";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const DoctorProfile = ({ isSidebarVisible, toggleSidebar }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "N/A",
        specialization: "N/A",
        education: "N/A",
        services: [],
        profilePicture: "N/A",
        gender: "Other",
        consultationFee: 0,
        yearOfExperience: 0, // Added yearOfExperience
    });

    const [uploadedImage, setUploadedImage] = useState(null);

    const { email } = useAuth();

    useEffect(() => {
        const fetchDoctorDetails = async () => {
            if (!email) return; // Prevent fetching if email is missing
            try {
                const response = await axios.get("http://localhost:5000/api/auth/doctor-details", { params: { email } });
                const services = response.data.services === "N/A" ? [] : response.data.services;
                setProfileData({ ...response.data, services });
            } catch (error) {
                console.error("Error fetching doctor details:", error);
            }
        };

        fetchDoctorDetails();
    }, [email]);


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

    const handleServiceChange = (index, value) => {
        const newServices = [...profileData.services];
        newServices[index] = value;
        setProfileData({
            ...profileData,
            services: newServices,
        });
    };

    const handleCconsultationChange = (e) => {
        const { name, value } = e.target;
        if (name === "consultationFee" && value < 0) {
            return; // Prevent setting negative values
        }
        setProfileData({
            ...profileData,
            [name]: value,
        });
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

    const saveChanges = async () => {
        try {
            await axios.put("http://localhost:5000/api/auth/update-doctor", {
                email,
                ...profileData,
                profilePicture: uploadedImage || profileData.profilePicture,
            });
            setIsEditMode(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return (
        <div className={`doc-home-container ${isSidebarVisible ? "sidebar-visible" : "sidebar-hidden"}`}>
            <div className="scrollable-container">
                <div className={`doctor-profile-card ${isSidebarVisible ? "with-sidebar" : ""}`}>
                    <div className="profile-image-container-doc">
                        <img
                            src={uploadedImage || (profileData.profilePicture === "N/A" ? DocImage : profileData.profilePicture)}
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
                        <button className="edit-profile-btn" onClick={isEditMode ? saveChanges : toggleEditMode}>
                            {isEditMode ? "Save Changes" : "Edit Profile"}
                        </button>
                    </div>
                    <div className={`profile-details ${isEditMode ? "scrollable-form-container" : ""}`}>
                        <h3>
                            {isEditMode ? (
                                <>
                                    <h4>Full Name</h4>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profileData.name}
                                        onChange={handleInputChange}
                                        className="profile-input"
                                    />
                                </>
                            ) : (
                                profileData.name
                            )}
                        </h3>
                        <h4>Specialization</h4>
                        <p>
                            {isEditMode ? (
                                <input
                                    type="text"
                                    name="specialization"
                                    value={profileData.specialization}
                                    onChange={handleInputChange}
                                    className="profile-input"
                                />
                            ) : (
                                profileData.specialization
                            )}
                        </p>
                        <h4>Medical Education</h4>
                        <p>
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
                        <h4>Gender</h4>
                        <p>
                            {isEditMode ? (
                                <select
                                    name="gender"
                                    value={profileData.gender}
                                    onChange={handleInputChange}
                                    className="profile-input"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            ) : (
                                profileData.gender
                            )}
                        </p>
                        <h4>Years of Experience</h4>
                        <p>
                            {isEditMode ? (
                                <input
                                    type="number"
                                    name="yearOfExperience"
                                    value={profileData.yearOfExperience}
                                    onChange={handleInputChange}
                                    min="0" // Prevent negative input
                                    className="profile-input"
                                />
                            ) : (
                                `${profileData.yearOfExperience} years`
                            )}
                        </p>

                        <h4>Consultation Fee</h4>
                        <p>
                            {isEditMode ? (
                                <input
                                    type="number"
                                    name="consultationFee"
                                    value={profileData.consultationFee}
                                    onChange={handleInputChange}
                                    min="0" // Prevent negative input
                                    className="profile-input"
                                />
                            ) : (
                                `Rs. ${profileData.consultationFee}`
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
                                            <button className="minus" onClick={() => removeService(index)}>-</button>
                                        </div>
                                    ) : (
                                        service
                                    )}
                                </li>
                            ))}
                        </ul>
                        {isEditMode && profileData.services.length === 0 && (
                            <div className="number-control">
                                <input
                                    type="text"
                                    placeholder="Add a service"
                                    className="profile-input"
                                    onChange={(e) => handleServiceChange(0, e.target.value)}
                                />
                                <button className="plus" onClick={addService}>+</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
