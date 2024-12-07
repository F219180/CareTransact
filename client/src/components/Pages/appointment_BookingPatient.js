import React, { useState } from "react";
import "./appointment_BookingPatient.css";
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

const AppointmentBookingPatient = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [activeView, setActiveView] = useState(null);
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

  const doctors = [
    {
      id: 1,
      name: "Dr. Emily Johnson",
      specialty: "Cardiology",
      experience: "15 years",
      rating: 4.8,
      consultationFee: 500,
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      availableSlots: [
        { date: "2024-07-15", slots: ["09:00 AM", "10:30 AM", "02:00 PM"] },
        { date: "2024-07-16", slots: ["11:00 AM", "03:30 PM", "04:45 PM"] }
      ]
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Orthopedics",
      experience: "12 years",
      rating: 4.6,
      consultationFee: 450,
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      availableSlots: [
        { date: "2024-07-15", slots: ["10:15 AM", "01:45 PM", "03:30 PM"] },
        { date: "2024-07-16", slots: ["09:30 AM", "02:00 PM", "05:00 PM"] }
      ]
    }
  ];

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
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
        return (
          <div className="card-container">
            <div className="card book-appointment-card">
              <div className="card-header">
                <h2>Book New Appointment</h2>
              </div>
              <div className="card-body">
                <div className="doctors-grid">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className={`doctor-card ${
                        selectedDoctor?.id === doctor.id ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setSelectedDate(null);
                        setSelectedSlot(null);
                      }}
                    >
                      <div className="doctor-header">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="doctor-image"
                        />
                        <div className="doctor-info">
                          <h3>{doctor.name}</h3>
                          <p>{doctor.specialty}</p>
                        </div>
                      </div>
                      <div className="doctor-details">
                        <div className="detail-item">
                          <span>Experience:</span>
                          <strong>{doctor.experience}</strong>
                        </div>
                        <div className="detail-item">
                          <span>Consultation Fee:</span>
                          <strong>₹{doctor.consultationFee}</strong>
                        </div>
                        <div className="detail-item">
                          <span>Rating:</span>
                          <strong>{doctor.rating}/5</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedDoctor && (
                  <div className="booking-details">
                    <div className="dates-grid">
                      {selectedDoctor.availableSlots.map((slot) => (
                        <div
                          key={slot.date}
                          className={`date-card ${selectedDate === slot.date ? "selected" : ""}`}
                          onClick={() => {
                            setSelectedDate(slot.date);
                            setSelectedSlot(null);
                          }}
                        >
                          {slot.date}
                        </div>
                      ))}
                    </div>

                    {selectedDate && (
                      <div className="slots-grid">
                        {selectedDoctor.availableSlots
                          .find((slot) => slot.date === selectedDate)
                          .slots.map((slot) => (
                            <div
                              key={slot}
                              className={`slot-card ${selectedSlot === slot ? "selected" : ""}`}
                              onClick={() => setSelectedSlot(slot)}
                            >
                              {slot}
                            </div>
                          ))}
                      </div>
                    )}

                    {selectedSlot && (
                      <button
                        className="book-appointment-btn"
                        onClick={handleBooking}
                      >
                        Book Appointment
                      </button>
                    )}
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
                <p>Select Future Appointments or Book a New Appointment from the sidebar.</p>
                <div className="quick-actions">
                  <button
                    className="quick-action-btn"
                    onClick={() => setActiveView("futureAppointments")}
                  >
                    View Future Appointments
                  </button>
                  <button
                    className="quick-action-btn"
                    onClick={() => setActiveView("bookAppointment")}
                  >
                    Book New Appointment
                  </button>
                </div>
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

        <div className="content">{renderContent()}</div>

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