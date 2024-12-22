import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Doctor_appointment.css';
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

const DoctorAppointmentDashboard = ({ isSidebarVisible }) => {
    const { email } = useAuth();
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [futureAppointments, setFutureAppointments] = useState([]);
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/auth/get-doctor-appointments', {
                    params: { doctorEmail: email },
                });

                const { pendingAppointments, futureAppointments } = response.data;

                // Calculate today's and tomorrow's dates
                const today = moment().startOf('day');
                const tomorrow = moment().add(1, 'day').startOf('day');
                const dayAfterTomorrow = moment().add(2, 'days').startOf('day');

                // Filter out appointments for today and tomorrow
                const filteredFutureAppointments = futureAppointments.filter((appt) => {
                    const appointmentDate = moment(appt.date);
                    return appointmentDate.isSameOrAfter(dayAfterTomorrow); // Include only appointments from the day after tomorrow onward
                });

                setPendingAppointments(pendingAppointments);
                setFutureAppointments(filteredFutureAppointments);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            }
        };

        if (email) {
            fetchAppointments();
        }
    }, [email]);


    // Validation errors state
    const [categorizedSlots, setCategorizedSlots] = useState({
        today: [],
        tomorrow: [],
        future: [],
    });
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
    useEffect(() => {
        if (email) {
            fetchCategorizedSlots();
        }
    }, [email]);

    useEffect(() => {
        const removeExpiredAppointmentsOnLoad = async () => {
            try {
                const response = await axios.delete('http://localhost:5000/api/auth/remove-past-appointments');
                if (response.status === 200) {
                    console.log(response.data.message);
                }
            } catch (error) {
                console.error("Error removing past appointments:", error);
            }
        };

        removeExpiredAppointmentsOnLoad();
    }, []); // Empty dependency array ensures this runs only on component mount

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

                // Fetch the updated categorized slots after saving
                fetchCategorizedSlots();
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


    const handleAccept = async (appointment) => {
        try {

            const response = await axios.put('http://localhost:5000/api/auth/update-appointment-status', {
                appointmentId: appointment._id,
                status: 'Confirmed',
            });

            if (response.status === 200) {
                // Remove from pending appointments
                alert(appointment.patientEmail)
                setPendingAppointments((prev) => prev.filter((a) => a._id !== appointment._id));

                // Add to future appointments
                setFutureAppointments((prev) => [...prev, { ...appointment, status: 'Confirmed' }]);
            }
        } catch (error) {
            console.error('Error accepting appointment:', error);
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
    useEffect(() => {
        if (futureAppointments.length > 0) {
            const appointmentEvents = futureAppointments.map((appt) => ({
                title: '', // Keep title empty for dots
                start: new Date(appt.date), // Start at the date of the appointment
                end: new Date(appt.date),   // End at the same date (all-day event)
                type: 'appointment',        // Custom type to identify these events
            }));

            setCalendarEvents((prevEvents) => {
                const filteredEvents = prevEvents.filter((event) => event.type !== 'appointment');
                return [...filteredEvents, ...appointmentEvents];
            });
        }
    }, [futureAppointments]);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/get-doctor-appointments', {
                params: { doctorEmail: email },
            });

            const { pendingAppointments, futureAppointments } = response.data;

            // Update the states for pending and future appointments
            setPendingAppointments(
                pendingAppointments.filter((appt) => appt.status === "Pending")
            );

            setFutureAppointments(
                futureAppointments.filter((appt) => appt.status === "Confirmed")
            );
        } catch (error) {
            console.error("Error fetching appointments:", error);
        }
    };

    const handleAppointmentAccept = async (appointment) => {
        try {
            const response = await axios.put('http://localhost:5000/api/auth/update-appointment-status', {
                appointmentId: appointment._id,
                status: 'Confirmed',
            });

            if (response.status === 200) {
                // Fetch updated pending and future appointments
                fetchAppointments();
                alert("Appointment accepted successfully!");
            } else {
                alert("Failed to accept appointment. Please try again.");
            }
        } catch (error) {
            console.error("Error accepting appointment:", error.response?.data || error.message);
            alert("Failed to accept appointment. Please try again.");
        }
    };

    const handleReject = async (appointment) => {
        try {
            const response = await axios.put('http://localhost:5000/api/auth/update-appointment-status', {
                appointmentId: appointment._id,
                status: 'Available',
            });

            if (response.status === 200) {
                // Fetch updated pending and future appointments
                fetchAppointments();
                alert("Appointment rejected successfully!");
            } else {
                alert("Failed to reject appointment. Please try again.");
            }
        } catch (error) {
            console.error("Error rejecting appointment:", error.response?.data || error.message);
            alert("Failed to reject appointment. Please try again.");
        }
    };

    // Initial fetch for appointments
    useEffect(() => {
        if (email) {
            fetchAppointments();
        }
    }, [email]);

    const fetchFutureAppointments = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/get-doctor-appointments', {
                params: { doctorEmail: email },
            });

            const { futureAppointments } = response.data;

            // Filter future appointments with status = Confirmed
            setFutureAppointments(
                futureAppointments.filter((appt) => appt.status === "Confirmed")
            );
        } catch (error) {
            console.error("Error fetching future appointments:", error);
        }
    };

    // Call `fetchFutureAppointments` initially to populate future appointments
    useEffect(() => {
        if (email) {
            fetchFutureAppointments();
        }
    }, [email]);

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
        <div className={`doctor-dashboard-advanced ${isSidebarVisible ? "" : "sidebar-hidden"}`}>
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <div
                                        style={{
                                            backgroundColor: '#FF69B4', // Pink dot color
                                            borderRadius: '50%',       // Make it circular
                                            height: '10px',            // Dot size
                                            width: '10px',
                                        }}
                                    ></div>
                                    <span
                                        style={{
                                            fontSize: '13px',
                                            color: '#000000',
                                        }}
                                    >
                                        Appointments
                                    </span>
                                </div>
                            </div>

                        ),

                    }}
                    eventPropGetter={(event) => {
                        if (event.type === 'appointment') {
                            return {
                                style: {
                                    backgroundColor: '#FF69B4', // Blue dot
                                    borderRadius: '50%',       // Make it a circle
                                    height: '10px',            // Adjust dot size
                                    width: '10px',
                                    position: 'relative',
                                    top: '-15px'
                                },
                            };
                        }
                        return {};
                    }}
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
                        {/* Check if any slots are available */}
                        {categorizedSlots.today.length === 0 &&
                            categorizedSlots.tomorrow.length === 0 &&
                            categorizedSlots.future.length === 0 ? (
                            <p className="empty-state">No available slots</p>
                        ) : (
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
                        )}
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
                                        pendingAppointments.map((appointment) => (
                                            <div key={appointment._id} className="appointment-card pending">
                                                <div className="appointment-details">
                                                    <p className="patient-name">{appointment.patientName}</p>
                                                    <p>
                                                        {moment(appointment.date).format('DD/MM/YYYY')} at {appointment.startTime}
                                                    </p>
                                                    <p className="appointment-reason">{appointment.reason}</p>
                                                </div>
                                                <div className="appointment-actions">
                                                    <button
                                                        className="action-button accept"
                                                        onClick={() => handleAppointmentAccept(appointment)}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        className="action-button reject"
                                                        onClick={() => handleReject(appointment)}
                                                    >
                                                        Reject
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
                                        <p className="empty-state">No future appointments</p>
                                    ) : (
                                        futureAppointments.map((appointment) => (
                                            <div key={appointment._id} className="appointment-card future">
                                                <div className="appointment-details">
                                                    <p className="patient-name">{appointment.patientName}</p>
                                                    <p>
                                                        {moment(appointment.date).format('DD/MM/YYYY')} at {appointment.startTime}
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