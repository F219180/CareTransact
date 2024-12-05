import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./profilePatient.css";
import DefaultProfilePic from "../../assets/images/image.jpg";
import EditIcon from "../../assets/images/edit_profile.png";
import axios from "axios";

const ProfilePatient = ({ isSidebarVisible }) => {
    const { email } = useAuth();
    const [isEditMode, setIsEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        gender: "",
        age: "",
        bloodGroup: "",
        cnic: "",
        contactNumber: "",
        dob: "",
        maritalStatus: "",
    });
    const [profileImage, setProfileImage] = useState(DefaultProfilePic);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (email) {
            axios
                .get(`http://localhost:5000/api/auth/patient-details`, { params: { email } })
                .then((response) => {
                    const data = response.data;
                    setProfileData(data);
                    if (data.profilePicture) {
                        setProfileImage(data.profilePicture);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching patient details:", error);
                });
        }
    }, [email]);

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
        setErrors({});
    };

    const validateFields = () => {
        const newErrors = {};
        const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
        const phoneRegex = /^03\d{9}$/;
        const today = new Date();

        if (!profileData.cnic.match(cnicRegex)) {
            newErrors.cnic = "Invalid CNIC format (e.g., 12345-6789012-3).";
        }
        if (!profileData.contactNumber.match(phoneRegex)) {
            newErrors.contactNumber = "Invalid phone number format.";
        }
        if (new Date(profileData.dob) >= today) {
            newErrors.dob = "Date of Birth must be in the past.";
        }
        if (profileData.age < 0) {
            newErrors.age = "Age cannot be negative.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const saveChanges = () => {
        if (!validateFields()) return;

        const updatedProfile = { ...profileData, profilePicture: profileImage };
        axios
            .put(`http://localhost:5000/api/auth/update-patient`, updatedProfile)
            .then(() => {
                setIsEditMode(false);
                console.log("Profile updated successfully!");
            })
            .catch((error) => {
                console.error("Error updating profile:", error);
            });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "age" && value < 0) return; // Prevent negative age
        setProfileData({ ...profileData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfileImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
    };

    return (
        <div className={`profile-page ${isSidebarVisible ? "" : "sidebar-hidden"}`}>
            <div className={`profile-card ${isEditMode ? "edit-mode" : ""}`}>
                <div className="profile-image-container">
                    <img src={profileImage} alt="Profile" className="profile-image" />
                    {isEditMode && (
                        <>
                            <div
                                className="edit-icon"
                                onClick={() => document.getElementById("profile-image-input").click()}
                            >
                                <img src={EditIcon} alt="Edit Icon" />
                            </div>
                            <input
                                type="file"
                                id="profile-image-input"
                                style={{ display: "none" }}
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </>
                    )}
                </div>
                <div className="profile-info">
                    <p>{profileData.email}</p>
                    <button
                        className="edit-btn"
                        onClick={isEditMode ? saveChanges : toggleEditMode}
                    >
                        {isEditMode ? "Save Changes" : "Edit Profile"}
                    </button>
                </div>
                <div className="profile-details">
                    {[
                        { label: "Name", name: "name", type: "text" },
                        { label: "Gender", name: "gender", type: "select", options: ["Male", "Female", "Other"] },
                        { label: "Age", name: "age", type: "number" },
                        { label: "Blood Group", name: "bloodGroup", type: "select", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
                        { label: "CNIC", name: "cnic", type: "text" },
                        { label: "Contact Number", name: "contactNumber", type: "text" },
                        { label: "Date of Birth", name: "dob", type: "date" },
                        { label: "Marital Status", name: "maritalStatus", type: "select", options: ["Married", "Single", "Divorced", "Widowed"] },
                    ].map(({ label, name, type, options }) => (
                        <div key={name}>
                            <span>{label}:</span>
                            {isEditMode ? (
                                type === "select" ? (
                                    <select
                                        name={name}
                                        value={profileData[name] || ""}
                                        onChange={handleInputChange}
                                        className="profile-input"
                                    >
                                        {["N/A", ...options].map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={type}
                                        name={name}
                                        value={profileData[name] || ""}
                                        onChange={handleInputChange}
                                        className="profile-input"
                                    />
                                )
                            ) : (
                                <p>
                                    {name === "dob"
                                        ? formatDate(profileData[name])
                                        : profileData[name] || "N/A"}
                                </p>
                            )}
                            {errors[name] && <span className="error">{errors[name]}</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfilePatient;
