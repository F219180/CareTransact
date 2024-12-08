import React, { useState, useEffect } from "react";
import "./appointment_BookingPatient.css";
import axios from "axios";
import defaultimg from "../../assets/images/image.jpg"
import SidebarPatient from "./sidebarPatient";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import {
    Calendar,
    Clock,
    User,
    Stethoscope,
    InfoIcon,
    XCircle
} from "lucide-react";
let globalAppointments = [];


const AppointmentBookingPatient = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGender, setSelectedGender] = useState("");
    const [selectedSpecialization, setSelectedSpecialization] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [activeView, setActiveView] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedDoctorEmails, setSelectedDoctorEmails] = useState([]);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/auth/get-available-slots");
                const availableAppointments = response.data;

                const emails = availableAppointments.map((appointment) => appointment.doctorEmail);
                setSelectedDoctorEmails([...new Set(emails)]); // Ensure unique emails
                setAppointments(availableAppointments);
            } catch (error) {
                console.error("Error fetching appointments:", error.response?.data || error.message);
                toast.error("Failed to fetch appointments.");
            }
        };


        fetchAppointments();
    }, []);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const promises = selectedDoctorEmails.map((email) =>
                    axios.get(`http://localhost:5000/api/auth/doctor-details`, {
                        params: { email },
                    })
                );

                const responses = await Promise.all(promises);
                const doctorData = responses.map((res) => res.data);
                setDoctors(doctorData);
            } catch (error) {
                console.error("Error fetching doctors:", error);
                toast.error("Failed to load doctor data.");
            }
        };

        if (selectedDoctorEmails.length > 0) {
            fetchDoctors();
        }
    }, [selectedDoctorEmails]);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const [futureAppointments, setFutureAppointments] = useState([
        {
            id: uuidv4(),
            doctorName: "Dr. Emily Johnson",
            specialty: "Cardiology",
            date: "2024-07-15",
            time: "10:30 AM",
            status: "Confirmed",
            location: "Central Hospital, Main Branch",
            consultationFee: 500,
            notes: "Follow-up cardiac check-up"
        },
        {
            id: uuidv4(),
            doctorName: "Dr. Michael Chen",
            specialty: "Orthopedics",
            date: "2024-08-02",
            time: "02:45 PM",
            status: "Pending",
            location: "City Medical Center, Wing B",
            consultationFee: 450,
            notes: "Knee pain consultation"
        }
    ]);

    const handleDoctorClick = async (doctor) => {
        try {
            // Step 1: Fetch doctor's email using the find-doctor-email endpoint
            const emailResponse = await axios.get("http://localhost:5000/api/auth/find-doctor-email", {
                params: {
                    name: doctor.name,
                    specialization: doctor.specialization,
                    gender: doctor.gender,
                    yearOfExperience: doctor.yearOfExperience,
                },
            });

            const email = emailResponse.data.email; // Resolve email
            if (!email) {
                toast.error(`Email not found for ${doctor.name}`);
                return;
            }

            // Step 2: Fetch available slots using resolved email
            const response = await axios.get("http://localhost:5000/api/auth/get-data-ofslots", {
                params: { doctorEmail: email }, // Use resolved email
            });

            const availableSlots = response.data;

            if (availableSlots && availableSlots.length > 0) {
                toast.success(`Available slots found for ${doctor.name}`);
                globalAppointments = availableSlots; // Update the global variable
                setAppointments(globalAppointments); // Update the state for UI
                setShowPopup(true); // Show the popup

                // Alert to show available slots
                const slotDetails = availableSlots
                    .map(slot => `Date: ${new Date(slot.date).toLocaleDateString()}, Time: ${slot.startTime} - ${slot.endTime}`)
                    .join('\n');
            } else {
                toast.info(`No available slots for ${doctor.name}`);
                globalAppointments = []; // Clear the global variable if no slots
                setAppointments([]); // Clear the state for UI
            }
        } catch (error) {
            console.error("Error handling doctor click:", error.response?.data || error.message);
            toast.error("Failed to fetch details for the selected doctor.");
        }
    };






    const handleBooking = () => {
        if (!selectedDate || !selectedSlot) {
            toast.error("Please select both a date and a time slot.");
            return;
        }

        const newAppointment = {
            id: uuidv4(),
            doctorName: selectedDoctor.name,
            specialty: selectedDoctor.specialty,
            date: selectedDate,
            time: selectedSlot,
            status: "Pending",
            location: "Hospital Main Branch",
            consultationFee: selectedDoctor.consultationFee,
            notes: "New appointment"
        };

        setFutureAppointments((prevAppointments) => [
            ...prevAppointments,
            newAppointment,
        ]);

        toast.success(`Appointment booked with ${selectedDoctor.name} on ${selectedDate} at ${selectedSlot}`);
        setActiveView("futureAppointments");
    };

    const renderContent = () => {
        switch (activeView) {
            case "futureAppointments":
                return (
                    <div className="card-container">
                        <div className="card future-appointments-card">
                            <div className="card-header">
                                <h2>Future Appointments</h2>
                            </div>
                            <div className="card-body">
                                <div className="appointments-grid">
                                    {futureAppointments.map((appointment) => (
                                        <div
                                            key={appointment.id}
                                            className="appointment-card"
                                            onClick={() => setSelectedAppointment(appointment)}
                                        >
                                            <div className="appointment-header">
                                                <h3>{appointment.doctorName}</h3>
                                                <span className={`status ${appointment.status.toLowerCase()}`}>
                                                    {appointment.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "bookAppointment":
                const filteredDoctors = doctors.filter((doctor) => {
                    const matchesName = searchQuery
                        ? doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
                        : true;
                    const matchesGender = selectedGender
                        ? doctor.gender === selectedGender
                        : true;
                    const matchesSpecialization = selectedSpecialization
                        ? doctor.specialization.toLowerCase() === selectedSpecialization.toLowerCase()
                        : true;

                    return matchesName && matchesGender && matchesSpecialization;
                });

                return (
                    <div className="card-container">
                        <div className="card book-appointment-card">
                            <div className="card-header">
                                <h2>Book New Appointment</h2>
                            </div>
                            <div className="card-body">
                                {/* Search and Filter Section */}
                                <div className="filter-container">
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="filter-input"
                                    />
                                    <select
                                        value={selectedGender}
                                        onChange={(e) => setSelectedGender(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">All Genders</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    <select
                                        value={selectedSpecialization}
                                        onChange={(e) => setSelectedSpecialization(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">All Specializations</option>
                                        {Array.from(
                                            new Set(doctors.map((doc) => doc.specialization))
                                        ).map((specialization) => (
                                            <option key={specialization} value={specialization}>
                                                {specialization}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Doctors Grid */}
                                <div className="doctors-grid">
                                    {filteredDoctors.map((doctor) => (
                                        <div
                                            key={doctor._id}
                                            className="doctor-card"
                                            onClick={() => handleDoctorClick(doctor)} // Attach the click handler
                                        >
                                            <div className="doctor-header">
                                                <img
                                                    src={doctor.profilePicture || defaultimg}
                                                    alt={doctor.name || "Doctor Image"}
                                                    className="doctor-image"
                                                />
                                                <div className="doctor-info">
                                                    <h3>{doctor.name}</h3>
                                                    <p>{doctor.specialization}</p>
                                                </div>
                                            </div>
                                            <div className="doctor-details">
                                                <div className="detail-item">
                                                    <span>Experience:</span>
                                                    <strong>{doctor.yearOfExperience} years</strong>
                                                </div>
                                                <div className="detail-item">
                                                    <span>Consultation Fee:</span>
                                                    <strong>₹{doctor.consultationFee}</strong>
                                                </div>
                                                {doctor.services && doctor.services.length > 0 && (
                                                    <div className="detail-item">
                                                        <span>Services:</span>
                                                        <strong>{doctor.services.join(", ")}</strong>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {selectedDoctor && appointments.length > 0 && (
                                    <div className="appointment-slots">
                                        <h3>Available Slots for {selectedDoctor.name}</h3>
                                        <ul>
                                            {appointments.map((slot, index) => (
                                                <li key={`${slot.date}-${slot.startTime}-${index}`}>
                                                    <strong>Date:</strong> {new Date(slot.date).toLocaleDateString()} <br />
                                                    <strong>Time:</strong> {slot.startTime} - {slot.endTime}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="card-container">
                        <div className="card welcome-card">
                            <div className="card-header">
                                <h1>Appointment Management</h1>
                            </div>
                            <div className="card-body">
                                <p>View Future Appointments or Book a New Appointment</p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={`doc-home-container ${isSidebarVisible ? "sidebar-visible" : "sidebar-hidden"}`}>
            <SidebarPatient isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

            <div className="main-content">
                <div className="action-buttons">
                    <button
                        className={`action-btn ${activeView === "futureAppointments" ? "active" : ""}`}
                        onClick={() => setActiveView("futureAppointments")}
                    >
                        Future Appointments
                    </button>
                    <button
                        className={`action-btn ${activeView === "bookAppointment" ? "active" : ""}`}
                        onClick={() => setActiveView("bookAppointment")}
                    >
                        Book Appointment
                    </button>
                </div>

                {activeView === "bookAppointment" ? (
                    <div className="card-container">
                        <div className="card book-appointment-card">
                            <div className="card-header">
                                <h2>Book New Appointment</h2>
                            </div>
                            <div className="card-body">
                                {/* Search and Filter Section */}
                                <div className="filter-container">
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="filter-input"
                                    />
                                    <select
                                        value={selectedGender}
                                        onChange={(e) => setSelectedGender(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">All Genders</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    <select
                                        value={selectedSpecialization}
                                        onChange={(e) => setSelectedSpecialization(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">All Specializations</option>
                                        {Array.from(
                                            new Set(doctors.map((doc) => doc.specialization))
                                        ).map((specialization) => (
                                            <option key={specialization} value={specialization}>
                                                {specialization}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Doctors Grid */}
                                <div className="doctors-grid" >
                                    {doctors
                                        .filter((doctor) => {
                                            const matchesName = searchQuery
                                                ? doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
                                                : true;
                                            const matchesGender = selectedGender
                                                ? doctor.gender === selectedGender
                                                : true;
                                            const matchesSpecialization = selectedSpecialization
                                                ? doctor.specialization.toLowerCase() === selectedSpecialization.toLowerCase()
                                                : true;

                                            return matchesName && matchesGender && matchesSpecialization;
                                        })
                                        .map((doctor) => (
                                            <div
                                                key={doctor._id}
                                                className="doctor-card"
                                                onClick={() => handleDoctorClick(doctor)}
                                            >
                                                <div className="doctor-header">
                                                    <img
                                                        src={doctor.profilePicture || defaultimg}
                                                        alt={doctor.name || "Doctor Image"}
                                                        className="doctor-image"
                                                    />
                                                    <div className="doctor-info">
                                                        <h3>{doctor.name}</h3>
                                                        <p>{doctor.specialization}</p>
                                                    </div>
                                                </div>
                                                <div className="doctor-details">
                                                    <div className="detail-item">
                                                        <span>Experience:</span>
                                                        <strong>{doctor.yearOfExperience} years</strong>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span>Consultation Fee:</span>
                                                        <strong>₹{doctor.consultationFee}</strong>
                                                    </div>
                                                    {doctor.services && doctor.services.length > 0 && (
                                                        <div className="detail-item">
                                                            <span>Services:</span>
                                                            <strong>{doctor.services.join(', ')}</strong>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="content">{renderContent()}</div>
                )}
                {showPopup && (
                    <div className="popup-overlay">
                        <div className="popup-card">
                            <button className="close-button" onClick={() => setShowPopup(false)}>×</button>
                            <h2>Available Slots</h2>
                            <ul className="appointment-list">
                                {appointments.map((slot, index) => (
                                    <li
                                        key={index}
                                        className={`appointment-item ${selectedSlot === index ? "selected" : ""}`}
                                        onClick={() => setSelectedSlot(index)}
                                    >
                                        Date: {new Date(slot.date).toLocaleDateString()}, Time: {slot.startTime} - {slot.endTime}
                                    </li>
                                ))}
                            </ul>
                            <button
                                className="book-appointment-btn"
                                disabled={selectedSlot === null}
                            // onClick={() => handleBookAppointment(appointments[selectedSlot])}
                            >
                                Book Appointment
                            </button>
                        </div>
                    </div>
                )}



                {/* Enhanced Appointment Details Modal */}
                {selectedAppointment && (
                    <div className="appointment-modal-overlay">
                        <div className="appointment-modal">
                            <button
                                className="modal-close-btn"
                                onClick={() => setSelectedAppointment(null)}
                            >
                                <XCircle size={24} />
                            </button>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h2>Appointment Details</h2>
                                    <span className={`status ${selectedAppointment.status.toLowerCase()}`}>
                                        {selectedAppointment.status}
                                    </span>
                                </div>
                                <div className="modal-body">
                                    <div className="modal-detail">
                                        <User className="modal-icon" />
                                        <div>
                                            <h3>{selectedAppointment.doctorName}</h3>
                                            <p>{selectedAppointment.specialty}</p>
                                        </div>
                                    </div>
                                    <div className="modal-detail">
                                        <Calendar className="modal-icon" />
                                        <div>
                                            <h3>Date</h3>
                                            <p>{selectedAppointment.date}</p>
                                        </div>
                                    </div>
                                    <div className="modal-detail">
                                        <Clock className="modal-icon" />
                                        <div>
                                            <h3>Time</h3>
                                            <p>{selectedAppointment.time}</p>
                                        </div>
                                    </div>
                                    <div className="modal-detail">
                                        <Stethoscope className="modal-icon" />
                                        <div>
                                            <h3>Location</h3>
                                            <p>{selectedAppointment.location}</p>
                                        </div>
                                    </div>
                                    <div className="modal-detail">
                                        <InfoIcon className="modal-icon" />
                                        <div>
                                            <h3>Notes</h3>
                                            <p>{selectedAppointment.notes}</p>
                                        </div>
                                    </div>
                                    <div className="modal-additional-info">
                                        <div className="additional-info-item">
                                            <span>Consultation Fee:</span>
                                            <strong>₹{selectedAppointment.consultationFee}</strong>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button className="modal-action-btn">Reschedule</button>
                                    <button className="modal-action-btn danger">Cancel Appointment</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentBookingPatient;