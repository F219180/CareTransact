import React, { useState } from "react";
import "./profilePatient.css";
import DefaultProfilePic from "../../assets/images/image.jpg"; // Default profile picture
import EditIcon from "../../assets/images/edit_profile.png"; // Edit icon for profile picture

const ProfilePatient = ({ isSidebarVisible }) => {
    const [isEditMode, setIsEditMode] = useState(false); // State to toggle edit mode
    const [profileImage, setProfileImage] = useState(DefaultProfilePic); // State for the profile picture
    const [profileData, setProfileData] = useState({
        name: "Mrs. Maria Waston",
        email: "mariawaston2022@gmail.com",
        sex: "Female",
        age: "28",
        bloodGroup: "A+",
        cnic: "12345-6789012-3",
        contactNumber: "0300-1234567",
        dob: "1995-01-15",
        maritalStatus: "Married",
    });

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
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfileImage(event.target.result); // Update profile picture preview
            };
            reader.readAsDataURL(file);
        }
    };

    const saveChanges = () => {
        setIsEditMode(false);
        console.log("Profile updated:", profileData);
    };

    return (
        <div className={`profile-page ${isSidebarVisible ? "" : "sidebar-hidden"}`}>
            <div className={`profile-card ${isEditMode ? "edit-mode" : ""}`}>
                {/* Profile Image */}
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

                {/* Email and Edit Button */}
                <div className="profile-info">
                    <h3>{profileData.name}</h3>
                    <p>{profileData.email}</p>
                    <button
                        className="edit-btn"
                        onClick={isEditMode ? saveChanges : toggleEditMode}
                    >
                        {isEditMode ? "Save Changes" : "Edit Profile"}
                    </button>
                </div>

                {/* Profile Details */}
                <div className="profile-details">
                    {[
                        { label: "Sex", name: "sex", type: "select", options: ["Female", "Male", "Other"] },
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
                                        value={profileData[name]}
                                        onChange={handleInputChange}
                                        className="profile-input"
                                    >
                                        {options.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={type}
                                        name={name}
                                        value={profileData[name]}
                                        onChange={handleInputChange}
                                        className="profile-input"
                                    />
                                )
                            ) : (
                                <p>{profileData[name]}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfilePatient;
