import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Doctor_appointment.css';
import Sidebardoctor from "./sidebardoctor";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import {
    FaCalendarCheck,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaSave
} from 'react-icons/fa';
import axios from 'axios'; // Import axios
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook

// Initialize localizer for react-big-calendar
const localizer = momentLocalizer(moment);

const DoctorAppointmentDashboard = () => {
    const { email } = useAuth();
    // Validation errors state
    const [categorizedSlots, setCategorizedSlots] = useState({
        today: [],
        tomorrow: [],
        future: [],
    });
    useEffect(() => {
        const fetchCategorizedSlots = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/auth/get-categorized-slots', {
                    params: { doctorEmail: email },
                });

                const slots = response.data;
                setCategorizedSlots({
                    today: slots.today.sort((a, b) => new Date(a.date) - new Date(b.date)),
                    tomorrow: slots.tomorrow.sort((a, b) => new Date(a.date) - new Date(b.date)),
                    future: slots.future.sort((a, b) => new Date(a.date) - new Date(b.date)),
                });
            } catch (error) {
                console.error("Error fetching categorized slots:", error);
            }
        };

        if (email) {
            fetchCategorizedSlots();
        }
    }, [email]);
    const validateSlot = () => {
        const newErrors = {};
        const now = new Date();

        if (!newSlot.date) newErrors.date = "Date is required.";
        else if (new Date(newSlot.date) < now.setHours(0, 0, 0, 0)) {
            newErrors.date = "Cannot select a past date.";
        }
        if (!newSlot.startTime) newErrors.startTime = "Start time is required.";
        if (!newSlot.endTime) newErrors.endTime = "End time is required.";
        else if (newSlot.startTime >= newSlot.endTime) {
            newErrors.endTime = "End time must be after start time.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Free slots state
    const [freeSlots, setFreeSlots] = useState([]);
    const [errors, setErrors] = useState({
        date: "",
        startTime: "",
        endTime: "",
    });
    useEffect(() => {
        const fetchFreeSlots = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/auth/get-available-slots', {
                    params: { doctorEmail: email },
                });

                setFreeSlots(response.data); // Update state with fetched slots
            } catch (error) {
                console.error("Error fetching available slots:", error.response?.data || error.message);
                setFreeSlots([]); // Clear slots in case of an error
            }
        };

        if (email) {
            fetchFreeSlots();
        }
    }, [email]);


    const handleAddFreeSlot = () => {
        if (!validateSlot()) {
            return; // Stop if there are validation errors
        }

        const slot = {
            id: freeSlots.length + 1,
            date: newSlot.date,
            startTime: newSlot.startTime,
            endTime: newSlot.endTime,
        };

        setFreeSlots([...freeSlots, slot]);
        saveSlotToDatabase(slot); // Save slot to database
        setIsSlotModalOpen(false);
        setNewSlot({ date: '', startTime: '', endTime: '' });
        setErrors({}); // Clear errors after successful submission
    };

    // State for appointments
    const [futureAppointments, setFutureAppointments] = useState([
        { id: 1, patientName: 'John Doe', date: '2024-02-15', time: '10:00 AM', reason: 'Routine Checkup' },
        { id: 2, patientName: 'Jane Smith', date: '2024-02-16', time: '02:30 PM', reason: 'Follow-up Consultation' }

    ]);

    const [pendingAppointments, setPendingAppointments] = useState([
        { id: 3, patientName: 'Alice Johnson', date: '2024-02-14', time: '11:00 AM', reason: 'Initial Consultation' },
        { id: 4, patientName: 'Bob Williams', date: '2024-02-17', time: '03:45 PM', reason: 'Specialist Referral' },
        { id: 1, patientName: 'kamla safdar', date: '2024-02-17', time: '10:00 AM', reason: 'Routine Checkup' },
        { id: 2, patientName: 'Almas Aina', date: '2024-02-18', time: '02:30 PM', reason: 'Follow-up Consultation' }
    ]);


    useEffect(() => {
        if (!email) {
            console.error("Email is missing in AuthContext.");
        }
    }, [email]);

    const saveSlotToDatabase = async (slot) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/save-appointment-slot', {
                doctorEmail: email,
                date: slot.date,
                startTime: slot.startTime,
                endTime: slot.endTime,
            });

            if (response.status === 201) {
                alert("Slot saved successfully!");
            } else {
                alert(`Failed to save the slot. Status code: ${response.status}`);
            }
        } catch (error) {
            if (error.response) {
                alert(`Failed to save the slot. Error: ${error.response.data.error}`);
            } else {
                alert(`Failed to save the slot. Error: ${error.message}`);
            }
        }
    };



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
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarVisible(prevState => !prevState); // Use previous state
    };
    useEffect(() => {
        const appointmentEvents = futureAppointments.map(appt => ({
            title: `${appt.patientName} - ${appt.reason}`,
            start: new Date(`${appt.date} ${appt.time}`),
            end: moment(new Date(`${appt.date} ${appt.time}`)).add(1, 'hour').toDate(),
            type: 'appointment'
        }));

        setCalendarEvents(prevEvents => {
            const filteredEvents = prevEvents.filter(event => event.type !== 'appointment');
            return [...filteredEvents, ...appointmentEvents];
        });
    }, [futureAppointments]);
    // Convert appointments to calendar events
    // Free slots on the calendar
    useEffect(() => {
        const freeSlotEvents = freeSlots.map(slot => ({
            title: 'Appointment',
            start: new Date(slot.date + ' ' + slot.startTime),
            end: moment(new Date(slot.date + ' ' + slot.startTime)).add(1, 'hour').toDate(),
            type: 'freeSlot'
        }));

        setCalendarEvents(prevEvents => {
            const filteredEvents = prevEvents.filter(event => event.type !== 'freeSlot');
            return [...filteredEvents, ...freeSlotEvents];
        });
    }, [freeSlots]);

    // Appointment management handlers
    const handleAppointmentAccept = (appointment) => {
        setPendingAppointments(pendingAppointments.filter(appt => appt.id !== appointment.id));

        // Add accepted appointment to future appointments
        const acceptedAppointment = { ...appointment, isAccepted: true };
        setFutureAppointments(prevAppointments => [...prevAppointments, acceptedAppointment]);

        // Add the accepted appointment to the calendar
        const newCalendarEvent = {
            title: `${appointment.patientName} - ${appointment.reason}`,
            start: new Date(`${appointment.date} ${appointment.time}`),
            end: moment(new Date(`${appointment.date} ${appointment.time}`)).add(1, 'hour').toDate(),
            type: 'appointment'
        };
        setCalendarEvents(prevEvents => [...prevEvents, newCalendarEvent]);
    };



    const handleAppointmentReject = (appointment) => {
        setPendingAppointments(pendingAppointments.filter(appt => appt.id !== appointment.id));
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
        <div className={`doctor-dashboard-advanced ${isSidebarVisible ? 'sidebar-visible' : 'sidebar-hidden'}`}>
            <Sidebardoctor toggleSidebar={toggleSidebar} isSidebarVisible={isSidebarVisible} />
            {/* Calendar Section */}
            <div className='calendar-section'>
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
                                <button onClick={handlePreviousMonth} className="previous-button">
                                    <FaChevronLeft size={20} />
                                </button>
                                <button onClick={handleNextMonth} className="next-button">
                                    <FaChevronRight size={20} />
                                </button>
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

            <div className=' dashboard-grid-advanced'>
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
                {/* Free Slots Management Card */}
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
                        {/* Categorized Slots */}
                        <div>
                            {/* Today's Slots */}
                            {categorizedSlots.today.length > 0 && (
                                <div>
                                    <h3>Today's Slots</h3>
                                    <div>
                                        {categorizedSlots.today.map(slot => (
                                            <div key={slot._id} className="slot-card">
                                                <p>
                                                    {new Date(slot.date).toLocaleDateString('en-GB')}
                                                    ({slot.startTime} - {slot.endTime})
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tomorrow's Slots */}
                            {categorizedSlots.tomorrow.length > 0 && (
                                <div>
                                    <h3>Tomorrow's Slots</h3>
                                    <div>
                                        {categorizedSlots.tomorrow.map(slot => (
                                            <div key={slot._id} className="slot-card">
                                                <p>
                                                    {new Date(slot.date).toLocaleDateString('en-GB')}
                                                    ({slot.startTime} - {slot.endTime})
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Future Slots */}
                            {categorizedSlots.future.length > 0 && (
                                <div>
                                    <h3>Future Slots</h3>
                                    <div>
                                        {categorizedSlots.future.map(slot => (
                                            <div key={slot._id} className="slot-card">
                                                <p>
                                                    {new Date(slot.date).toLocaleDateString('en-GB')}
                                                    ({slot.startTime} - {slot.endTime})
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                                {errors.date && <p className="error-message">{errors.date}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="start-time">Start Time</label>
                                <input
                                    type="time"
                                    id="start-time"
                                    value={newSlot.startTime}
                                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                />
                                {errors.startTime && <p className="error-message">{errors.startTime}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="end-time">End Time</label>
                                <input
                                    type="time"
                                    id="end-time"
                                    value={newSlot.endTime}
                                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                                />
                                {errors.endTime && <p className="error-message">{errors.endTime}</p>}
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