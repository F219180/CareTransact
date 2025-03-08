import React, { useState, useEffect } from "react";
import "./doctor_prescription.css";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import bg from "../../assets/images/patinet_bg.avif";
import Sidebardoctor from "./sidebardoctor"; // Import Sidebar

const DoctorPrescription = ({ isSidebarVisible, toggleSidebar }) => {
    const [isSidebarVisibleState, setIsSidebarVisible] = useState(isSidebarVisible); // Use the passed prop
    const [prescriptionData, setPrescriptionData] = useState({
        patientEmail: "",
        patientAge: "",
        patientGender: "Male",
        diagnosis: "",
        symptoms: [],
        medications: [],
        labTests: [],
        advice: "",
        followUpDate: ""
    });




    const [doctorInfo, setDoctorInfo] = useState({
        name: "N/A",
        specialization: "N/A",
        education: "N/A"
    });

    const { email } = useAuth();

    useEffect(() => {
        const fetchDoctorDetails = async () => {
            if (!email) return;
            try {
                const response = await axios.get("http://localhost:5000/api/auth/doctor-details", { params: { email } });
                setDoctorInfo({
                    name: response.data.name,
                    specialization: response.data.specialization,
                    education: response.data.education
                });
            } catch (error) {
                console.error("Error fetching doctor details:", error);
            }
        };

        fetchDoctorDetails();
    }, [email]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPrescriptionData({
            ...prescriptionData,
            [name]: value,
        });
    };



    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const savePrescription = async () => {
        // Check if all required fields are filled
        if (!prescriptionData.patientEmail) {
            alert("Please enter the patient's email.");
            return;
        }
        if (!prescriptionData.patientAge) {
            alert("Please enter the patient's age.");
            return;
        }
        if (!prescriptionData.patientGender) {
            alert("Please select the patient's gender.");
            return;
        }
        if (!prescriptionData.diagnosis) {
            alert("Please enter the diagnosis.");
            return;
        }

        // Validate email format using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(prescriptionData.patientEmail)) {
            alert("Please enter a valid email address.");
            return;
        }

        try {
            // Check if patient exists in the database
            const patientResponse = await axios.get(`http://localhost:5000/api/auth/patient-details?email=${prescriptionData.patientEmail}`);
            const patientData = patientResponse.data;

            // Validate age and gender match with patient data
            if (patientData.age !== parseInt(prescriptionData.patientAge) || patientData.gender !== prescriptionData.patientGender) {
                alert("Patient details do not match with our records. Please check the email, age, and gender.");
                return;
            }

            // Transform labTests into the required format (remove status)
            const formattedLabTests = prescriptionData.labTests.map(test => ({
                testName: test // Only include testName
            }));

            // Prepare the prescription data to be sent to the backend
            const prescriptionPayload = {
                patientEmail: prescriptionData.patientEmail,
                patientAge: parseInt(prescriptionData.patientAge),
                patientGender: prescriptionData.patientGender,
                doctorEmail: email,
                diagnosis: prescriptionData.diagnosis,
                symptoms: prescriptionData.symptoms,
                medications: prescriptionData.medications,
                labTests: formattedLabTests, // Use the formatted labTests without status
                advice: prescriptionData.advice,
                followUpDate: prescriptionData.followUpDate ? new Date(prescriptionData.followUpDate) : null,
                dateIssued: new Date().toISOString()
            };

            // Validate follow-up date
            if (prescriptionPayload.followUpDate && isToday(prescriptionPayload.followUpDate)) {
                alert("Follow-up date cannot be today. Please select a future date.");
                return;
            }

            // Save prescription to database
            await axios.post("http://localhost:5000/api/auth/prescriptions/create", prescriptionPayload);

            alert("Prescription saved successfully!");

            // Do not clear the form after saving
            // clearForm(); // Comment out or remove this line
        } catch (error) {
            console.error("Error saving prescription:", error);
            alert("Failed to save prescription. Ensure the email is correct and registered.");
        }
    };

    // Helper function to check if a date is today
    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const handleSymptomChange = (index, value) => {
        const newSymptoms = [...prescriptionData.symptoms];
        newSymptoms[index] = value;
        setPrescriptionData({
            ...prescriptionData,
            symptoms: newSymptoms,
        });
    };

    const addSymptom = () => {
        setPrescriptionData({
            ...prescriptionData,
            symptoms: [...prescriptionData.symptoms, ""],
        });
    };

    const removeSymptom = (index) => {
        const newSymptoms = prescriptionData.symptoms.filter((_, i) => i !== index);
        setPrescriptionData({
            ...prescriptionData,
            symptoms: newSymptoms,
        });
    };

    const handleMedicationChange = (index, field, value) => {
        const newMedications = [...prescriptionData.medications];
        if (!newMedications[index]) {
            newMedications[index] = { name: "", dosage: "", frequency: "", duration: "" };
        }
        newMedications[index][field] = value;
        setPrescriptionData({
            ...prescriptionData,
            medications: newMedications,
        });
    };

    const addMedication = () => {
        setPrescriptionData({
            ...prescriptionData,
            medications: [...prescriptionData.medications, { name: "", dosage: "", frequency: "", duration: "" }],
        });
    };

    const removeMedication = (index) => {
        const newMedications = prescriptionData.medications.filter((_, i) => i !== index);
        setPrescriptionData({
            ...prescriptionData,
            medications: newMedications,
        });
    };

    const handleLabTestChange = (index, value) => {
        const newLabTests = [...prescriptionData.labTests];
        newLabTests[index] = value;
        setPrescriptionData({
            ...prescriptionData,
            labTests: newLabTests,
        });
    };

    const addLabTest = () => {
        setPrescriptionData({
            ...prescriptionData,
            labTests: [...prescriptionData.labTests, ""],
        });
    };

    const removeLabTest = (index) => {
        const newLabTests = prescriptionData.labTests.filter((_, i) => i !== index);
        setPrescriptionData({
            ...prescriptionData,
            labTests: newLabTests,
        });
    };



    const sendToLabAttendant = async () => {
        // Validate required fields for the prescription
        if (!prescriptionData.patientEmail) {
            alert("Please enter the patient's email.");
            return;
        }
        if (!prescriptionData.patientAge) {
            alert("Please enter the patient's age.");
            return;
        }
        if (!prescriptionData.patientGender) {
            alert("Please select the patient's gender.");
            return;
        }
        if (!prescriptionData.diagnosis) {
            alert("Please enter the diagnosis.");
            return;
        }

        // Validate email format using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(prescriptionData.patientEmail)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Validate lab tests
        if (prescriptionData.labTests.length === 0) {
            alert("Please add at least one lab test before sending to Lab Attendant.");
            return;
        }

        try {
            // Check if patient exists in the database
            const patientResponse = await axios.get(`http://localhost:5000/api/auth/patient-details?email=${prescriptionData.patientEmail}`);
            const patientData = patientResponse.data;

            // Validate age and gender match with patient data
            if (patientData.age !== parseInt(prescriptionData.patientAge) || patientData.gender !== prescriptionData.patientGender) {
                alert("Patient details do not match with our records. Please check the email, age, and gender.");
                return;
            }

            // Check if the prescription is already saved
            const prescriptionResponse = await axios.get("http://localhost:5000/api/auth/prescriptions/check", {
                params: {
                    doctorEmail: email,
                    patientEmail: prescriptionData.patientEmail,
                    date: new Date().toISOString()
                }
            });

            if (!prescriptionResponse.data.exists) {
                alert("Please save the prescription first before sending to the lab.");
                return;
            }

            // Save lab tests with status "Pending"
            const labTestPayload = {
                prescriptionId: prescriptionResponse.data.prescriptionId, // Prescription ID from the saved prescription
                labTests: prescriptionData.labTests.map(test => ({
                    testName: test,
                    status: "Pending"
                }))
            };

            await axios.post("http://localhost:5000/api/auth/lab-tests/create", labTestPayload);

            alert("Lab request sent successfully!");
        } catch (error) {
            console.error("Error sending lab request:", error);
            alert("Please save the Precription first.");
        }
    };

    const sendToPharmacist = async () => {
        // Validate required fields for the prescription
        if (!prescriptionData.patientEmail) {
            alert("Please enter the patient's email.");
            return;
        }
        if (!prescriptionData.patientAge) {
            alert("Please enter the patient's age.");
            return;
        }
        if (!prescriptionData.patientGender) {
            alert("Please select the patient's gender.");
            return;
        }
        if (!prescriptionData.diagnosis) {
            alert("Please enter the diagnosis.");
            return;
        }

        // Validate email format using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(prescriptionData.patientEmail)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Validate medications
        if (prescriptionData.medications.length === 0) {
            alert("Please add at least one medication before sending to the Pharmacist.");
            return;
        }

        try {
            // Check if patient exists in the database
            const patientResponse = await axios.get(`http://localhost:5000/api/auth/patient-details?email=${prescriptionData.patientEmail}`);
            const patientData = patientResponse.data;

            // Validate age and gender match with patient data
            if (patientData.age !== parseInt(prescriptionData.patientAge) || patientData.gender !== prescriptionData.patientGender) {
                alert("Patient details do not match with our records. Please check the email, age, and gender.");
                return;
            }

            // Check if the prescription is already saved
            const prescriptionResponse = await axios.get("http://localhost:5000/api/auth/prescriptions/check", {
                params: {
                    doctorEmail: email,
                    patientEmail: prescriptionData.patientEmail,
                    date: new Date().toISOString()
                }
            });

            if (!prescriptionResponse.data.exists) {
                alert("Please save the prescription first before sending to the Pharmacist.");
                return;
            }

            // Prepare the payload for the pharmacy request
            const pharmacyRequestPayload = {
                prescriptionId: prescriptionResponse.data.prescriptionId,
                doctorEmail: email,
                doctorName: doctorInfo.name,
                patientEmail: prescriptionData.patientEmail,
                patientAge: prescriptionData.patientAge,
                patientGender: prescriptionData.patientGender,
                diagnosis: prescriptionData.diagnosis,
                medications: prescriptionData.medications,
                advice: prescriptionData.advice,
                date: new Date().toISOString()
            };

            // Send the pharmacy request to the backend
            await axios.post("http://localhost:5000/api/auth/pharmacy-requests/create", pharmacyRequestPayload);

            alert("Prescription sent to pharmacist successfully!");
        } catch (error) {
            console.error("Error sending prescription to pharmacist:", error);
            alert("Please save the Precription first");
        }
    };


    const clearForm = () => {
        setPrescriptionData({
            patientEmail: "",
            patientAge: "",
            patientGender: "Male",
            diagnosis: "",
            symptoms: [],
            medications: [],
            labTests: [],
            advice: "",
            followUpDate: ""
        });
    };


    const formatDate = () => {
        const today = new Date();
        return today.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="doctor-prescription-container">
            {/* Sidebar */}
            <Sidebardoctor isSidebarVisible={isSidebarVisibleState} toggleSidebar={() => setIsSidebarVisible(!isSidebarVisibleState)} />

            <div className={`doc-home-container ${isSidebarVisibleState ? "sidebar-visible" : "sidebar-hidden"}`} style={{
                backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
                <div className="scrollable-container">
                    <div className={`doctor-prescription-card ${isSidebarVisibleState ? "with-sidebar" : ""}`}>
                        <div className="prescription-header">
                            <div className="prescription-title">
                                <h2>Medical Prescription</h2>
                                <p className="prescription-date">Date: {formatDate()}</p>
                            </div>
                            <div className="doctor-info">
                                <h3>{doctorInfo.name}</h3>
                                <p>{doctorInfo.specialization}</p>
                                <p>{doctorInfo.education}</p>
                            </div>
                        </div>

                        <div className="prescription-form">
                            <div className="form-section">
                                <h4>Patient Information</h4>
                                <div className="form-row">

                                    <div className="form-group">
                                        <label>Patient Email</label>
                                        <input
                                            type="text" // Change from "email" to "text" to avoid automatic validation
                                            name="patientEmail"
                                            value={prescriptionData.patientEmail}
                                            onChange={handleInputChange}
                                            placeholder="Enter patient email"
                                            required
                                        />
                                    </div>



                                    <div className="form-group">
                                        <label>Age</label>
                                        <input type="number" name="patientAge" value={prescriptionData.patientAge}
                                            onChange={handleInputChange} placeholder="Age" min="0" />
                                    </div>
                                    <div className="form-group">
                                        <label>Gender</label>
                                        <select name="patientGender" value={prescriptionData.patientGender}
                                            onChange={handleInputChange}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Diagnosis</h4>
                                <div className="form-group">
                                    <textarea name="diagnosis" value={prescriptionData.diagnosis} onChange={handleInputChange}
                                        placeholder="Enter diagnosis details" rows="3"></textarea>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Symptoms</h4>
                                {prescriptionData.symptoms.map((symptom, index) => (
                                    <div key={index} className="list-item-container">
                                        <input type="text" value={symptom} onChange={(e) => handleSymptomChange(index, e.target.value)}
                                            placeholder="Enter symptom"
                                        />
                                        <div className="item-controls">
                                            <button type="button" className="control-btn remove-btn" onClick={() =>
                                                removeSymptom(index)}>-</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="add-btn" onClick={addSymptom}>+ Add Symptom</button>
                            </div>

                            <div className="form-section">
                                <h4>Medications</h4>
                                {prescriptionData.medications.map((medication, index) => (
                                    <div key={index} className="medication-item">
                                        <div className="medication-header">
                                            <h5>Medication #{index + 1}</h5>
                                            <button type="button" className="control-btn remove-btn" onClick={() =>
                                                removeMedication(index)}>-</button>
                                        </div>
                                        <div className="medication-details">
                                            <div className="form-group">
                                                <label>Name</label>
                                                <input type="text" value={medication.name || ""} onChange={(e) =>
                                                    handleMedicationChange(index, "name", e.target.value)}
                                                    placeholder="Medication name"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Dosage</label>
                                                <input type="text" value={medication.dosage || ""} onChange={(e) =>
                                                    handleMedicationChange(index, "dosage", e.target.value)}
                                                    placeholder="e.g., 500mg"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Frequency</label>
                                                <input type="text" value={medication.frequency || ""} onChange={(e) =>
                                                    handleMedicationChange(index, "frequency", e.target.value)}
                                                    placeholder="e.g., Twice daily"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Duration</label>
                                                <input type="text" value={medication.duration || ""} onChange={(e) =>
                                                    handleMedicationChange(index, "duration", e.target.value)}
                                                    placeholder="e.g., 7 days"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="add-btn" onClick={addMedication}>+ Add Medication</button>
                            </div>

                            <div className="form-section">
                                <h4>Lab Tests</h4>
                                {prescriptionData.labTests.map((test, index) => (
                                    <div key={index} className="list-item-container">
                                        <input type="text" value={test} onChange={(e) => handleLabTestChange(index, e.target.value)}
                                            placeholder="Enter lab test"
                                        />
                                        <div className="item-controls">
                                            <button type="button" className="control-btn remove-btn" onClick={() =>
                                                removeLabTest(index)}>-</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="add-btn" onClick={addLabTest}>+ Add Lab Test</button>
                            </div>

                            <div className="form-section">
                                <h4>Additional Advice</h4>
                                <div className="form-group">
                                    <textarea name="advice" value={prescriptionData.advice} onChange={handleInputChange}
                                        placeholder="Enter additional advice or instructions" rows="3"></textarea>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Follow-up</h4>
                                <div className="form-group">
                                    <label>Follow-up Date</label>
                                    <input type="date" name="followUpDate" value={prescriptionData.followUpDate}
                                        onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="clear-btn" onClick={clearForm}>Clear Form</button>
                                <button type="button" className="lab-btn" onClick={sendToLabAttendant}>Send to Lab</button>
                                <button type="button" className="pharm-btn" onClick={sendToPharmacist}>Send to Pharmacist</button>
                                <button type="button" className="save-btn" onClick={savePrescription}>Save Prescription</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorPrescription;
