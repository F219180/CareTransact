import React, { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Download,
    CheckCircle,
    XCircle,
    Search,
    Bell,
    User,
    Calendar,
    FileText,
    List,
    MoreVertical
} from 'lucide-react';

import './lab.css'; // Make sure to rename this to match your CSS file

const LabAttendentDashboard = () => {
    // State for Prescriptions Data
    const [prescriptions, setPrescriptions] = useState([]);

    // State for Filtering
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [dateFilter, setDateFilter] = useState(null);
    const [selectedPrescription, setSelectedPrescription] = useState(null);

    // Fetch All Lab Tests from Backend
    useEffect(() => {
        const fetchLabTests = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/auth/lab-attendee-tests');

                if (!response.data || response.data.length === 0) {
                    toast.error("No lab tests found.");
                    return;
                }

                // Format the data properly before setting state
                const formattedData = response.data.map(labTest => ({
                    id: labTest._id,
                    prescriptionId: labTest.prescriptionId._id,
                    patientName: labTest.prescriptionId.patientEmail,  // Use email or fetch patient name separately
                    patientId: labTest.prescriptionId.patientEmail,  // Using email as ID for now
                    doctorName: labTest.prescriptionId.doctorEmail,  // Use email or fetch doctor name separately
                    labAttendee: "Lab Attendant", // Add a default value or fetch from backend if available
                    date: new Date(labTest.prescriptionId.dateIssued).toISOString().split('T')[0],
                    status: labTest.labTests.every(test => test.status === "Completed") ? "Processed" : "Processing",
                    urgency: "Moderate", // Add default value or fetch from backend if available
                    labTests: labTest.labTests.map(test => ({
                        id: test._id,
                        testName: test.testName,
                        type: "Lab Test", // Add default value or fetch from backend if available
                        status: test.status
                    }))
                }));

                setPrescriptions(formattedData);
            } catch (error) {
                console.error("Error fetching lab tests:", error);
                toast.error("Failed to fetch lab tests.");
            }
        };

        fetchLabTests();
    }, []);
    // Fetch Lab Tests by Prescription ID
    const fetchLabTestsByPrescriptionId = async (prescriptionId) => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/lab-tests-by-prescription', {
                params: { prescriptionId }
            });

            // Format the selected prescription data if needed
            const selectedData = {
                ...response.data,
                labAttendee: response.data.labAttendee || "Lab Attendant"
            };

            setSelectedPrescription(selectedData);
        } catch (error) {
            console.error("Error fetching lab tests by prescription ID:", error);
            toast.error("Failed to fetch lab tests for this prescription.");
        }
    };

    // Filtered Prescriptions
    const filteredPrescriptions = useMemo(() => {
        return prescriptions.filter(prescription => {
            const matchesSearch =
                prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prescription.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = !statusFilter || prescription.status === statusFilter.value;

            const matchesDate = !dateFilter ||
                new Date(prescription.date).toDateString() === dateFilter.toDateString();

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [prescriptions, searchTerm, statusFilter, dateFilter]);

    // Status Options for Dropdown
    const statusOptions = [
        { value: 'Processing', label: 'Processing' },
        { value: 'Processed', label: 'Processed' }
    ];

    // Function to update individual lab test status
    const handleUpdateStatus = async (prescriptionId, testId, newStatus) => {
        try {
            const response = await axios.put('http://localhost:5000/api/auth/update-lab-test-status', {
                prescriptionId,
                testId,
                newStatus
            });

            if (response.status === 200) {
                toast.success(response.data.message);

                // Update the local state
                setPrescriptions(prevPrescriptions => {
                    const updatedPrescriptions = prevPrescriptions.map(prescription => {
                        if (prescription.id === prescriptionId) {
                            const updatedLabTests = prescription.labTests.map(test =>
                                test.id === testId ? { ...test, status: newStatus } : test
                            );

                            const allProcessed = updatedLabTests.every(test => test.status === "Completed");

                            return {
                                ...prescription,
                                labTests: updatedLabTests,
                                status: allProcessed ? "Processed" : "Processing"
                            };
                        }
                        return prescription;
                    });

                    // Update the selected prescription if it's the one being modified
                    if (selectedPrescription && selectedPrescription.id === prescriptionId) {
                        const updatedPrescription = updatedPrescriptions.find(p => p.id === prescriptionId);
                        setSelectedPrescription(updatedPrescription);
                    }

                    return updatedPrescriptions;
                });
            }
        } catch (error) {
            console.error("Error updating lab test status:", error);
            toast.error("Failed to update lab test status.");
        }
    };

    // Modal component for prescription details
    const PrescriptionDetailModal = ({ prescription, onClose, updateLabTestStatus }) => (
        <div className="lab-test-modal">
            <div className="lab-test-modal-content">
                <h2>Lab Test Details</h2>
                <div className="lab-test-details">
                    <div className="detail-section">
                        <User size={20} /> <span>Patient: {prescription.patientName}</span>
                    </div>
                    <div className="detail-section">
                        <Calendar size={20} /> <span>Date: {prescription.date}</span>
                    </div>
                    <div className="detail-section">
                        <FileText size={20} /> <span>Doctor: {prescription.doctorName}</span>
                    </div>
                </div>

                <div className="lab-tests-list">
                    <h3>Lab Tests</h3>
                    {prescription.labTests.map((test, index) => (
                        <div key={`${test.id}-${index}`} className="lab-test-item">
                            <h4>{test.testName} ({test.type || 'Lab Test'})</h4>
                            <p><strong>Status:</strong> {test.status}</p>
                            {test.status !== 'Completed' && (
                                <button
                                    className="process-btn"
                                    onClick={() => updateLabTestStatus(prescription.id, test.id, 'Completed')}
                                >
                                    Mark as Completed
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="close-modal-btn">Close</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="lab-attendent-dashboard">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            <header className="dashboard-header">
                <h1>Lab Attendant Management System</h1>
            </header>

            <div className="dashboard-filters">
                <div className="search-container">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search prescriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Select
                    options={statusOptions}
                    placeholder="Filter by Status"
                    onChange={(selected) => setStatusFilter(selected)}
                    isClearable
                    value={statusFilter}
                    className="react-select-container"
                />

                <DatePicker
                    selected={dateFilter}
                    onChange={(date) => setDateFilter(date)}
                    placeholderText="Filter by Date"
                    isClearable
                    className="date-picker-input"
                />
            </div>

            {/* Table Layout for Prescriptions */}
            <div className="prescriptions-table">
                <table>
                    <thead>
                        <tr>
                            <th>Prescription ID</th>
                            <th>Patient Name</th>
                            <th>Doctor</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPrescriptions.map(prescription => (
                            <tr key={prescription.id}>
                                <td>{prescription.id}</td>
                                <td>{prescription.patientName}</td>
                                <td>{prescription.doctorName}</td>
                                <td>{prescription.date}</td>
                                <td>
                                    <span className={`status-badge ${prescription.status.toLowerCase()}`}>
                                        {prescription.status}
                                    </span>
                                </td>
                                <td className="actions">
                                    <div className="action-buttons">
                                        <button onClick={() => setSelectedPrescription(prescription)}>
                                            <List />
                                        </button>
                                        <button>
                                            <MoreVertical />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Render Modal if a prescription is selected */}
            {selectedPrescription && (
                <PrescriptionDetailModal
                    prescription={selectedPrescription}
                    onClose={() => setSelectedPrescription(null)}
                    updateLabTestStatus={handleUpdateStatus}
                />
            )}
        </div>
    );
};

export default LabAttendentDashboard;
