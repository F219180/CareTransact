import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Doctor_appointment.css';
import {
    FaCalendarCheck,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaSave
} from 'react-icons/fa';

// Initialize localizer for react-big-calendar
const localizer = momentLocalizer(moment);

const DoctorAppointmentDashboard = () => {
    // State for appointments
    const [futureAppointments, setFutureAppointments] = useState([
        { id: 1, patientName: 'John Doe', date: '2024-02-15', time: '10:00 AM', reason: 'Routine Checkup' },
        { id: 2, patientName: 'Jane Smith', date: '2024-02-16', time: '02:30 PM', reason: 'Follow-up Consultation' }
    ]);

    const [pendingAppointments, setPendingAppointments] = useState([
        { id: 3, patientName: 'Alice Johnson', date: '2024-02-14', time: '11:00 AM', reason: 'Initial Consultation' },
        { id: 4, patientName: 'Bob Williams', date: '2024-02-17', time: '03:45 PM', reason: 'Specialist Referral' }
    ]);

    // Free slot state
    const [freeSlots, setFreeSlots] = useState([
        { id: 1, date: '2024-02-14', startTime: '10:00', endTime: '11:00' },
        { id: 2, date: '2024-02-16', startTime: '01:00', endTime: '02:00' },
    ]);

    // Calendar events state
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modal states
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

    // New slot state
    const [newSlot, setNewSlot] = useState({
        date: '',
        startTime: '',
        endTime: ''
    });

    // Convert appointments to calendar events
    useEffect(() => {
        const appointmentEvents = futureAppointments.map(appt => ({
            title: `${appt.patientName} - ${appt.reason}`,
            start: new Date(appt.date + ' ' + appt.time),
            end: moment(new Date(appt.date + ' ' + appt.time)).add(1, 'hour').toDate(),
        }));

        setCalendarEvents(appointmentEvents);
    }, [futureAppointments]);

    // Free slots on the calendar
    useEffect(() => {
        const freeSlotEvents = freeSlots.map(slot => ({
            title: 'Available Slot',
            start: new Date(slot.date + ' ' + slot.startTime),
            end: moment(new Date(slot.date + ' ' + slot.startTime)).add(1, 'hour').toDate(),
            allDay: false, // It's a time slot, not an all-day event
        }));

        setCalendarEvents(prevEvents => [...prevEvents, ...freeSlotEvents]);
    }, [freeSlots]);

    // Appointment management handlers
    const handleAppointmentAccept = (appointment) => {
        setPendingAppointments(pendingAppointments.filter(appt => appt.id !== appointment.id));
        setFutureAppointments([...futureAppointments, appointment]);
    };

    const handleAppointmentReject = (appointment) => {
        setPendingAppointments(pendingAppointments.filter(appt => appt.id !== appointment.id));
    };

    const handleAddFreeSlot = () => {
        if (newSlot.startTime >= newSlot.endTime) {
            alert('End time must be after start time.');
            return;
        }
    
        setFreeSlots([
            ...freeSlots,
            {
                id: freeSlots.length + 1,
                date: newSlot.date,
                startTime: newSlot.startTime,
                endTime: newSlot.endTime,
            }
        ]);
        setIsSlotModalOpen(false);
        setNewSlot({ date: '', startTime: '', endTime: '' });
    };
    
    // Calendar navigation handlers
    const handlePreviousMonth = () => {
        const newDate = moment(currentDate).subtract(1, 'month').toDate();
        setCurrentDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = moment(currentDate).add(1, 'month').toDate();
        setCurrentDate(newDate);
    };

    const monthYear = moment(currentDate).format('MMMM YYYY'); // Get the month and year

    return (
        <div className="doctor-dashboard-advanced">
            {/* Calendar Section */}
            <div className="calendar-section">
                <div className="month-year">
                    <h2>{monthYear}</h2>
                </div>
                <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    toolbar={true}
                    date={currentDate}
                    onNavigate={setCurrentDate}
                    components={{
                        toolbar: () => (
                            <div className="custom-toolbar">
                                <button onClick={handlePreviousMonth} className="previous-button">Previous</button>
                                <button onClick={handleNextMonth} className="next-button">Next</button>
                            </div>
                        ),
                    }}
                    eventPropGetter={(event) => ({
                        style: {
                            backgroundColor: event.allDay ? '#f00' : '#00f',
                            borderRadius: '50%', // Make the event a dot
                            padding: '5px', // Small dot size
                        }
                    })}
                />
            </div>

            {/* Dashboard Cards */}
            <div className="dashboard-grid-advanced">
                {/* Appointments Card */}
                <div
                    className="dashboard-card appointments-card"
                    onClick={() => setIsAppointmentModalOpen(true)}
                >
                    <div className="card-header">
                        <FaCalendarCheck className="card-icon" />
                        <h2>Appointments Management</h2>
                    </div>
                    <div className="card-content">
                        <div className="card-stats">
                            <p className="stat-label">Total Appointments</p>
                            <p className="stat-number">{futureAppointments.length}</p>
                        </div>
                    </div>
                </div>

                {/* Free Slots Management Card */}
                <div
                    className="dashboard-card slots-card"
                    onClick={() => setIsSlotModalOpen(true)}
                >
                    <div className="card-header">
                        <FaClock className="card-icon" />
                        <h2>Manage Free Slots</h2>
                    </div>
                    <div className="card-content">
                        <div className="card-stats">
                            <p className="stat-label">Available Slots</p>
                            <p className="stat-number">{freeSlots.length}</p>
                        </div>

                        {/* Add margin or padding between Available Slots and Parallel Available Slots */}
                        <div style={{ marginBottom: '20px' }}></div> {/* Adds space between sections */}

                        {/* Parallel Free Slot Sections */}
                        <div className="free-slot-sections">
                            {freeSlots.map((slot) => (
                                <div key={slot.id} className="slot-card">
                                    <p>{slot.date}</p>
                                    <p>{slot.startTime} - {slot.endTime}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


                {/* Appointments Modal */}
                {isAppointmentModalOpen && (
                    <div
                        className="appointment-modal-overlay"
                        onClick={() => setIsAppointmentModalOpen(false)}
                    >
                        <div
                            className="appointment-modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="modal-title">Appointment Management</h2>
                            <div className="modal-appointments-container">
                                {/* Pending Requests Section */}
                                <div className="modal-section pending-section">
                                    <h3>Pending Requests</h3>
                                    {pendingAppointments.length === 0 ? (
                                        <p className="empty-state">No pending appointments</p>
                                    ) : (
                                        pendingAppointments.map(appointment => (
                                            <div
                                                key={appointment.id}
                                                className="appointment-card pending"
                                            >
                                                <div className="appointment-details">
                                                    <p className="patient-name">{appointment.patientName}</p>
                                                    <p className="appointment-info">
                                                        {appointment.date} at {appointment.time}
                                                    </p>
                                                    <p className="appointment-reason">{appointment.reason}</p>
                                                </div>
                                                <div className="appointment-actions">
                                                    <button
                                                        onClick={() => handleAppointmentAccept(appointment)}
                                                        className="action-button accept"
                                                    >
                                                        <FaCheckCircle /> Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleAppointmentReject(appointment)}
                                                        className="action-button reject"
                                                    >
                                                        <FaTimesCircle /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Future Appointments Section */}
                                <div className="modal-section future-section">
                                    <h3>Future Appointments</h3>
                                    {futureAppointments.length === 0 ? (
                                        <p className="empty-state">No upcoming appointments</p>
                                    ) : (
                                        futureAppointments.map(appointment => (
                                            <div key={appointment.id} className="appointment-card future">
                                                <div className="appointment-details">
                                                    <p className="patient-name">{appointment.patientName}</p>
                                                    <p className="appointment-info">
                                                        {appointment.date} at {appointment.time}
                                                    </p>
                                                    <p className="appointment-reason">{appointment.reason}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Free Slot Modal */}
                {isSlotModalOpen && (
                    <div
                        className="slot-modal-overlay"
                        onClick={() => setIsSlotModalOpen(false)}
                    >
                        <div
                            className="slot-modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="modal-title">Add New Slot</h2>
                            <div className="form-group">
                                <label htmlFor="slot-date">Date</label>
                                <input
                                    type="date"
                                    id="slot-date"
                                    value={newSlot.date}
                                    onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="start-time">Start Time</label>
                                <input
                                    type="time"
                                    id="start-time"
                                    value={newSlot.startTime}
                                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="end-time">End Time</label>
                                <input
                                    type="time"
                                    id="end-time"
                                    value={newSlot.endTime}
                                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                                />
                            </div>
                            <button
                                className="save-button"
                                onClick={handleAddFreeSlot}
                            >
                                <FaSave /> Save Slot
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorAppointmentDashboard;
