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

import './pharma.css';

const PharmacistDashboard = () => {
    // Initial Prescriptions Data with medication processed status
    const [prescriptions, setPrescriptions] = useState([
        {
            id: 'RX001',
            patientName: 'Emily Johnson',
            patientId: 'PT2024001',
            doctorName: 'Dr. Sarah Williams',
            date: '2024-03-05',
            status: 'Pending',
            urgency: 'High',
            medications: [
                {
                    id: 'MED001',
                    name: 'Amoxicillin',
                    dosage: '500mg',
                    instructions: '3 times daily',
                    frequency: 'TID',
                    processed: false
                },
                {
                    id: 'MED002',
                    name: 'Ibuprofen',
                    dosage: '200mg',
                    instructions: 'As needed for pain',
                    frequency: 'PRN',
                    processed: false
                }
            ]
        },
        {
            id: 'RX002',
            patientName: 'Michael Chen',
            patientId: 'PT2024002',
            doctorName: 'Dr. Robert Lee',
            date: '2024-03-04',
            status: 'Approved',
            urgency: 'Medium',
            medications: [
                {
                    id: 'MED003',
                    name: 'Metformin',
                    dosage: '850mg',
                    instructions: 'Once daily with meals',
                    frequency: 'QD',
                    processed: true
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
        { value: 'Pending', label: 'Pending' },
        { value: 'Approved', label: 'Approved' }
    ];

    // Custom styles for react-select
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#3B82F6' : provided.borderColor,
            boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : provided.boxShadow,
            '&:hover': {
                borderColor: '#3B82F6'
            }
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#3B82F6' : provided.backgroundColor,
            color: state.isSelected ? 'white' : provided.color,
            '&:hover': {
                backgroundColor: state.isSelected ? '#3B82F6' : '#E5E7EB'
            }
        })
    };

    // Function to process individual medication
    const processMedication = (prescriptionId, medicationId) => {
        setPrescriptions(prevPrescriptions =>
            prevPrescriptions.map(prescription => {
                if (prescription.id === prescriptionId) {
                    // Update the medication's processed status
                    const updatedMedications = prescription.medications.map(med =>
                        med.id === medicationId ? { ...med, processed: true } : med
                    );
                    // Check if all medications are processed
                    const allProcessed = updatedMedications.every(med => med.processed);
                    // Update prescription status if all medications are processed
                    return {
                        ...prescription,
                        medications: updatedMedications,
                        status: allProcessed ? 'Approved' : prescription.status
                    };
                }
                return prescription;
            })
        );
        // If we're viewing the prescription details, update the selected prescription too
        if (selectedPrescription && selectedPrescription.id === prescriptionId) {
            setSelectedPrescription(prevSelected => {
                if (!prevSelected) return null;
                const updatedMedications = prevSelected.medications.map(med =>
                    med.id === medicationId ? { ...med, processed: true } : med
                );
                const allProcessed = updatedMedications.every(med => med.processed);
                return {
                    ...prevSelected,
                    medications: updatedMedications,
                    status: allProcessed ? 'Approved' : prevSelected.status
                };
            });
        }
    };

    // Prescription Detail Modal Component
    const PrescriptionDetailModal = ({ prescription, onClose }) => (
        <div className="prescription-modal">
            <div className="prescription-modal-content">
                <h2>Prescription Details</h2>
                <div className="prescription-details">
                    <div className="detail-section">
                        <User size={20} /> <span>Patient: {prescription.patientName}</span>
                    </div>
                    <div className="detail-section">
                        <Calendar size={20} /> <span>Date: {prescription.date}</span>
                    </div>
                    <div className="detail-section">
                        <FileText size={20} /> <span>Doctor: {prescription.doctorName}</span>
                    </div>
                    <div className="medications-list">
                        <h3>Medications</h3>
                        {prescription.medications.map(med => (
                            <div key={med.id} className="medication-item">
                                <span>{med.name}</span>
                                <span>{med.dosage}</span>
                                <span>{med.instructions}</span>
                                {prescription.status === 'Pending' && !med.processed && (
                                    <button
                                        className="process-med-btn"
                                        onClick={() => processMedication(prescription.id, med.id)}
                                    >
                                        Process
                                    </button>
                                )}
                                {med.processed && (
                                    <span className="processed-indicator">
                                        <CheckCircle size={16} /> Processed
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal-actions">
                    <button onClick={onClose} className="close-modal-btn">Close</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="pharmacist-dashboard">
            <header className="dashboard-header">
                <h1>Pharmacist Management System</h1>
                <div className="header-actions">
                </div>
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
                    styles={customSelectStyles}
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
                                <td>
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
                />
            )}
        </div>
    );
};

export default PharmacistDashboard;