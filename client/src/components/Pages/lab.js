import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

import './lab.css';

const LabAttendentDashboard = () => {
    // Initial Prescriptions Data
    const [prescriptions, setPrescriptions] = useState([
        {
            "id": "RX001",
            "patientName": "Sophia Martinez",
            "patientId": "PT2025001",
            "doctorName": "Dr. James Anderson",
            "labAttendee": "Michael Scott",
            "date": "2025-03-10",
            "status": "Processing",
            "urgency": "Critical",
            "labTests": [
                {
                    "id": "LAB001",
                    "testName": "Complete Blood Count (CBC)",
                    "type": "Hematology",
                    "status": "Processing",
                    "comments": "Possible infection, further evaluation needed"
                },
                {
                    "id": "LAB002", // Fixed: Changed to a unique ID
                    "testName": "Complgggete Blood Count (CBC)",
                    "type": "Hematovvvlogy",
                    "status": "Processing",
                    "comments": "Possible infection, further evaluation needed"
                }
            ]
        },
        {
            "id": "RX002",
            "patientName": "Liam Johnson",
            "patientId": "PT2025002",
            "doctorName": "Dr. Olivia Carter",
            "labAttendee": "Sarah Lee",
            "date": "2025-03-09",
            "status": "Processed",
            "urgency": "Moderate",
            "labTests": [
                {
                    "id": "LAB003",
                    "testName": "Lipid Profile",
                    "type": "Biochemistry",
                    "status": "Processed",
                    "comments": "Dietary changes recommended"
                }
            ]
        }
    ]);


    // State for Filtering
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [dateFilter, setDateFilter] = useState(null);
    const [selectedPrescription, setSelectedPrescription] = useState(null);

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
    // Function to update prescription status
    const updatePrescriptionStatus = (id, newStatus) => {
        setPrescriptions(prevPrescriptions =>
            prevPrescriptions.map(prescription =>
                prescription.id === id ? { ...prescription, status: newStatus } : prescription
            )
        );
    };
    // Function to update individual lab test status
    const updateLabTestStatus = (prescriptionId, testId, newStatus) => {
        setPrescriptions(prevPrescriptions => {
            const updatedPrescriptions = prevPrescriptions.map(prescription => {
                if (prescription.id === prescriptionId) {
                    // Update the specific lab test by its unique ID
                    const updatedLabTests = prescription.labTests.map(test =>
                        test.id === testId ? { ...test, status: newStatus } : test
                    );
                    // Check if all tests are processed
                    const allProcessed = updatedLabTests.every(test => test.status === "Processed");
                    // Update prescription status if all tests are processed
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
    };

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
                    <div className="detail-section">
                        <User size={20} /> <span>Lab Attendee: {prescription.labAttendee}</span>
                    </div>
                </div>

                <div className="lab-tests-list">
                    <h3>Lab Tests</h3>
                    {prescription.labTests.map((test, index) => (
                        <div key={`${test.id}-${index}`} className="lab-test-item">
                            <h4>{test.testName} ({test.type})</h4>
                            <p><strong>Status:</strong> {test.status}</p>
                            <p><strong>Comments:</strong> {test.comments}</p>
                            {test.status === 'Processing' && (
                                <button
                                    className="process-btn"
                                    onClick={() => updateLabTestStatus(prescription.id, test.id, 'Processed')}
                                >
                                    Process
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
            <header className="dashboard-header">
                <h1>Lab Attendant Management System</h1>
            </header>

            <div className="dashboard-filters">
                <div className="search-container">
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

            {selectedPrescription && (
                <PrescriptionDetailModal
                    prescription={selectedPrescription}
                    onClose={() => setSelectedPrescription(null)}
                    updateLabTestStatus={updateLabTestStatus}
                />
            )}

        </div>
    );
};

export default LabAttendentDashboard;