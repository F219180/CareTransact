const { Doctor, Patient, Appointment } = require('../models/user_models');

// Patient Controllers
const addPatient = async (req, res) => {
    try {
        const { email } = req.body;
        const patient = new Patient({ email });
        await patient.save();
        res.status(201).json({ message: 'Patient email saved successfully', patient });
    } catch (error) {
        console.error('Error saving patient email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getPatientDetails = async (req, res) => {
    try {
        const { email } = req.query;
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.status(200).json(patient);
    } catch (error) {
        console.error('Error fetching patient details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updatePatient = async (req, res) => {
    try {
        const { email, ...updatedFields } = req.body;
        const patient = await Patient.findOneAndUpdate({ email }, updatedFields, { new: true });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.status(200).json({ message: 'Patient details updated', patient });
    } catch (error) {
        console.error('Error updating patient details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Doctor Controllers
const getDoctorDetails = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        res.status(200).json({
            name: doctor.name || '',
            specialization: doctor.specialization || '',
            education: doctor.education || '',
            services: doctor.services || [],
            profilePicture: doctor.profilePicture || null,
            gender: doctor.gender || 'Male',
            consultationFee: doctor.consultationFee || 0,
            yearOfExperience: doctor.yearOfExperience || 0, // Added yearOfExperience
        });
    } catch (error) {
        console.error('Error fetching doctor details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getDoctorProfile = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        res.status(200).json({
            name: doctor.name || 'N/A',
            specialization: doctor.specialization || 'N/A',
            contactNumber: doctor.contactNumber || 'N/A',
            profilePicture: doctor.profilePicture || null
        });
    } catch (error) {
        console.error('Error fetching doctor details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateDoctor = async (req, res) => {
    try {
        const { email, ...updatedFields } = req.body;
        const updatedDoctor = await Doctor.findOneAndUpdate({ email }, updatedFields, { new: true, upsert: true });

        if (!updatedDoctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.status(200).json({ message: 'Doctor profile updated successfully', doctor: updatedDoctor });
    } catch (error) {
        console.error('Error updating doctor profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


//Appointment Controller
const saveAppointmentSlot = async (req, res) => {
    try {
        const { doctorEmail, date, startTime, endTime } = req.body;

        // Validate required fields
        if (!doctorEmail || !date || !startTime || !endTime) {
            return res.status(400).json({ error: "Doctor email, date, start time, and end time are required." });
        }

        // Fetch doctor's details from the database
        const doctor = await Doctor.findOne({ email: doctorEmail });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found." });
        }

        const { name: doctorName, consultationFee } = doctor;

        // Create and save the appointment
        const newAppointment = new Appointment({
            doctorEmail,
            doctorName,
            date,
            startTime,
            endTime,
            consultationFee,
            status: "Available", // Status is available for now
        });

        await newAppointment.save();

        res.status(201).json({
            message: "Appointment slot saved successfully.",
            appointment: newAppointment,
        });
    } catch (error) {
        console.error("Error saving appointment slot:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const getAvailableSlots = async (req, res) => {
    try {
        const { doctorEmail } = req.query;

        const query = doctorEmail ? { doctorEmail, status: "Available" } : { status: "Available" };
        const availableSlots = await Appointment.find(query);

        if (!availableSlots || availableSlots.length === 0) {
            return res.status(404).json({ error: "No available slots found." });
        }

        res.status(200).json(availableSlots);
    } catch (error) {
        console.error("Error fetching available slots:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};


const removeExpiredSlots = async () => {
    try {
        const now = new Date();
        await Appointment.deleteMany({
            $or: [
                { date: { $lt: now } },
                { date: now, endTime: { $lte: now.toTimeString().slice(0, 5) } },
            ],
        });
        console.log("Expired slots removed successfully.");
    } catch (error) {
        console.error("Error removing expired slots:", error);
    }
};


const getCategorizedSlots = async (req, res) => {
    try {
        const { doctorEmail } = req.query;
        if (!doctorEmail) {
            return res.status(400).json({ error: "Doctor email is required." });
        }

        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const slots = await Appointment.find({ doctorEmail, status: "Available" });

        const categorizedSlots = {
            today: slots.filter(slot =>
                new Date(slot.date).toDateString() === today.toDateString()),
            tomorrow: slots.filter(slot =>
                new Date(slot.date).toDateString() === tomorrow.toDateString()),
            future: slots.filter(slot =>
                new Date(slot.date) > tomorrow),
        };

        res.status(200).json(categorizedSlots);
    } catch (error) {
        console.error("Error fetching categorized slots:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

//Patient Appointment selection

const findDoctorEmail = async (req, res) => {
    try {
        const { name, specialization, gender, yearOfExperience } = req.query;
        const doctor = await Doctor.findOne({
            name,
            specialization,
            gender,
            yearOfExperience,
        });
        if (doctor) {
            return res.json({ email: doctor.email });
        }
        return res.status(404).json({ error: "Doctor not found" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch doctor email" });
    }
};


const getAvailableDoctorAppointments = async (req, res) => {
    try {
        const { doctorEmail } = req.query;

        if (!doctorEmail) {
            return res.status(400).json({ error: "Doctor email is required." });
        }

        const appointments = await Appointment.find({ doctorEmail, status: "Available" });

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ error: "No available appointments found for this doctor." });
        }

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching doctor's available appointments:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const bookAppointment = async (req, res) => {
    try {
        const { doctorEmail, date, startTime, patientEmail, patientName } = req.body;

        // Validate required fields
        if (!doctorEmail || !date || !startTime || !patientEmail || !patientName) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // Find the appointment slot
        const appointment = await Appointment.findOneAndUpdate(
            { doctorEmail, date, startTime, status: "Available" },
            {
                patientEmail,
                patientName,
                status: "Pending",
            },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ error: "Slot not available for booking." });
        }

        res.status(200).json({ message: "Appointment booked successfully.", appointment });
    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const getPatientAppointments = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: "Patient email is required." });
        }

        // Fetch appointments with status Pending or Confirmed
        const appointments = await Appointment.find({
            patientEmail: email,
            status: { $in: ["Pending", "Confirmed"] },
        });

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: "No appointments found for this patient." });
        }

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching patient appointments:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const getFutureAppointments = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: "Patient email is required." });
        }

        const today = new Date();

        // Fetch appointments with future dates
        const appointments = await Appointment.find({
            patientEmail: email,
            date: { $gte: today },
        });

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: "No future appointments found." });
        }

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching future appointments:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return res.status(400).json({ error: "Appointment ID is required." });
        }

        // Find the appointment by its ID
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found." });
        }

        const appointmentDate = new Date(appointment.date);
        const currentDate = new Date();

        const timeDifference = (appointmentDate - currentDate) / (1000 * 60 * 60); // Difference in hours

        // Check if the appointment is within 24 hours
        if (timeDifference < 24) {
            return res.status(400).json({
                error: "Appointments cannot be canceled within 24 hours of the scheduled time.",
            });
        }

        // Update the appointment status and clear patient details
        appointment.status = "Available";
        appointment.patientEmail = null;
        appointment.patientName = null;

        // Save the updated appointment
        await appointment.save();

        res.status(200).json({ message: "Appointment successfully canceled." });
    } catch (error) {
        console.error("Error canceling appointment:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};



const rescheduleAppointment = async (req, res) => {
    try {
        const { currentAppointmentId } = req.body;

        if (!currentAppointmentId) {
            return res.status(400).json({ error: "Appointment ID is required for rescheduling." });
        }

        const currentAppointment = await Appointment.findById(currentAppointmentId);

        if (!currentAppointment) {
            return res.status(404).json({ error: "Appointment not found." });
        }

        const currentDate = new Date();
        const appointmentDate = new Date(currentAppointment.date);
        const timeDifference = (appointmentDate - currentDate) / (1000 * 60 * 60); // Difference in hours

        if (timeDifference < 24) {
            return res.status(400).json({
                error: "Appointments cannot be rescheduled within 24 hours of the scheduled time.",
            });
        }

        // Update the current appointment slot
        currentAppointment.status = "Available";
        currentAppointment.patientEmail = null;
        currentAppointment.patientName = null;

        await currentAppointment.save();

        res.status(200).json({
            message: "Your appointment has been successfully rescheduled. You can now book a new slot.",
        });
    } catch (error) {
        console.error("Error rescheduling appointment:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};






const checkUserType = async (req, res) => {
    try {
        const { email } = req.body;
        const doctor = await Doctor.findOne({ email });
        if (doctor) {
            return res.status(200).json({ userType: 'doctor' });
        }
        const patient = await Patient.findOne({ email });
        if (patient) {
            return res.status(200).json({ userType: 'patient' });
        }
        res.status(404).json({ message: 'Email not found' });
    } catch (error) {
        console.error('Error checking user type:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    addPatient,
    getPatientDetails,
    updatePatient,
    getDoctorDetails,
    getDoctorProfile,
    updateDoctor,
    saveAppointmentSlot,
    getAvailableSlots,
    removeExpiredSlots,
    getCategorizedSlots,
    findDoctorEmail,
    getAvailableDoctorAppointments,
    bookAppointment,
    getPatientAppointments,
    getFutureAppointments,
    cancelAppointment,
    rescheduleAppointment,
    checkUserType
};
