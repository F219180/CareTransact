const { Doctor, Patient, Appointment, Admin, Claim, Prescription, LabAttendee, Pharmacist, LabTest, Medicine, InsuranceCompany } = require('../models/user_models');
const mongoose = require('mongoose');


// Patient Controllers
const addPatient = async (req, res) => {
    try {
        const { email, insuranceCompanyName } = req.body;
        // Ensure required fields are provided (adjust according to your schema)
        const patient = new Patient({
            email,
            insuranceProvider: insuranceCompanyName,
            name: "Default Name", // Temporary value; collect this in the form if required
            password: "tempPassword" // Temporary value; adjust as per your auth flow
        });
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
        const { email, insuranceProvider, ...updatedFields } = req.body;

        // Update patient details, including insurance provider
        const patient = await Patient.findOneAndUpdate(
            { email },
            { ...updatedFields, insuranceProvider },  // ✅ Now updating insurance provider
            { new: true }
        );

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.status(200).json({ message: 'Patient details updated', patient });
    } catch (error) {
        console.error('Error updating patient details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// auth_controller.js
const getInsuranceCompanies = async (req, res) => {
    try {
        const companies = await InsuranceCompany.find({}, 'name');
        res.status(200).json(companies);
    } catch (error) {
        console.error('Error fetching insurance companies:', error);
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

        // Convert time to comparable format
        const start = new Date(`${date}T${startTime}:00`);
        const end = new Date(`${date}T${endTime}:00`);

        // Check for overlapping slots
        const overlappingSlot = await Appointment.findOne({
            doctorEmail,
            date,
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlaps
                { startTime: { $eq: startTime }, endTime: { $eq: endTime } }, // Exact match
            ],
        });

        if (overlappingSlot) {
            return res.status(400).json({ error: "This time slot overlaps with an existing appointment." });
        }

        // Create and save the appointment
        const newAppointment = new Appointment({
            doctorEmail,
            doctorName: doctor.name,
            date,
            startTime,
            endTime,
            consultationFee: doctor.consultationFee,
            status: "Available",
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


const removePastAppointments = async (req, res) => {
    try {
        const now = new Date(); // Current date and time
        await Appointment.deleteMany({
            $or: [
                { date: { $lt: now } }, // Past dates
                { date: now, endTime: { $lte: now.toTimeString().slice(0, 5) } }, // Same date but past time
            ],
        });

        res.status(200).json({ message: "Past appointments removed successfully." });
    } catch (error) {
        console.error("Error removing past appointments:", error);
        res.status(500).json({ error: "Internal server error." });
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

        // Check if the user is an Admin
        const admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(200).json({ userType: 'admin' });
        }

        // Check if the user is a Doctor
        const doctor = await Doctor.findOne({ email });
        if (doctor) {
            return res.status(200).json({ userType: 'doctor' });
        }

        // Check if the user is a Patient
        const patient = await Patient.findOne({ email });
        if (patient) {
            return res.status(200).json({ userType: 'patient' });
        }

        // Check if the user is a Pharmacist
        const pharmacist = await Pharmacist.findOne({ email });
        if (pharmacist) {
            return res.status(200).json({ userType: 'pharmacist' });
        }

        // Check if the user is a Lab Attendee
        const labAttendee = await LabAttendee.findOne({ email });
        if (labAttendee) {
            return res.status(200).json({ userType: 'labAttendee' });
        }

        // Check if the user is an Insurance Company
        const insuranceCompany = await InsuranceCompany.findOne({ email });
        if (insuranceCompany) {
            return res.status(200).json({ userType: 'insuranceCompany' });
        }

        res.status(404).json({ message: 'Email not found' });
    } catch (error) {
        console.error('Error checking user type:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};





const fetchFuturePendingAndConfirm = async () => {
    try {
        const response = await axios.get("http://localhost:5000/api/auth/get-future-pending-and-confirm", {
            params: { email },
        });

        setAppointments(response.data); // Update state with the fetched appointments
    } catch (error) {
        console.error("Error fetching future appointments:", error.response?.data || error.message);
        toast.error("Failed to fetch future appointments.");
    }
};




//doctor confirming the appointment
const getDoctorAppointments = async (req, res) => {
    try {
        const { doctorEmail } = req.query;

        if (!doctorEmail) {
            return res.status(400).json({ error: "Doctor email is required." });
        }

        // Fetch pending appointments
        const pendingAppointments = await Appointment.find({
            doctorEmail,
            status: "Pending",
        });

        // Fetch confirmed appointments
        const futureAppointments = await Appointment.find({
            doctorEmail,
            status: "Confirmed",
        });

        res.status(200).json({
            pendingAppointments,
            futureAppointments,
        });
    } catch (error) {
        console.error("Error fetching doctor's appointments:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
const updateAppointmentStatus = async (req, res) => {
    try {
        console.log("Request received for updating appointment status:", req.body);

        const { appointmentId, status } = req.body;

        if (!appointmentId || !status) {
            return res.status(400).json({ error: 'Appointment ID and status are required.' });
        }

        const updateFields = { status };

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            updateFields,
            { new: true } // Return the updated document
        );

        if (!updatedAppointment) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        console.log("Updated Appointment:", updatedAppointment);

        res.status(200).json({
            message: 'Appointment updated successfully.',
            appointment: updatedAppointment,
        });
    } catch (error) {
        console.error("Error updating appointment status:", error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const getFuturePendingAndConfirmAppointments = async (req, res) => {
    try {
        console.log("Request Params:", req.query); // Debug
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: "Patient email is required." });
        }

        const today = new Date();

        // Fetch appointments
        const appointments = await Appointment.find({
            patientEmail: email,
            date: { $gte: today },
            status: { $in: ["Pending", "Confirmed"] },
        });

        console.log("Fetched Appointments:", appointments); // Debug

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: "No future appointments found." });
        }

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching future appointments:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};


// prescription

const savePrescription = async (req, res) => {
    try {
        const {
            patientEmail,
            patientAge,
            patientGender,
            doctorEmail,
            diagnosis,
            symptoms,
            medications,
            labTests,
            advice,
            followUpDate
        } = req.body;


        // Validate required fields
        if (!patientEmail || !patientAge || !patientGender || !diagnosis) {
            return res.status(400).json({ message: "All required fields must be filled." });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(patientEmail)) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        // Check if patient exists in the database
        const patient = await Patient.findOne({ email: patientEmail });
        if (!patient) {
            return res.status(404).json({ message: "Patient not found in the database." });
        }

        // Verify if patient age and gender match
        if (patient.age !== parseInt(patientAge) || patient.gender !== patientGender) {
            return res.status(400).json({ message: "Patient details do not match the records." });
        }

        // Create a new prescription
        const newPrescription = new Prescription({
            patientEmail,
            patientAge,
            patientGender,
            doctorEmail,
            diagnosis,
            symptoms,
            medicines: medications,
            labTests: labTests,
            advice,
            followUpDate,
            dateIssued: new Date()
        });

        await newPrescription.save();

        // Create insurance claim
        const doctor = await Doctor.findOne({ email: doctorEmail });

        if (!doctor || !patient) {
            return res.status(404).json({ message: "Doctor or Patient not found" });
        }

        const newClaim = new Claim({
            prescriptionId: newPrescription._id,
            doctorEmail: doctor.email,
            doctorName: doctor.name,
            doctorFee: doctor.consultationFee,
            doctorSpecialization: doctor.specialization,
            patientEmail: patient.email,
            patientName: patient.name,
            patientAge: patient.age,
            patientGender: patient.gender,
            patientBloodGroup: patient.bloodGroup,
            patientContactNumber: patient.contactNumber,
            totalAmount: doctor.consultationFee,
            claimStatus: 'Pending',
            consultancyDate: new Date(),
            insuranceCompanyName: patient.insuranceProvider,
            insuranceCardFront: patient.insuranceCardFront,
            insuranceCardBack: patient.insuranceCardBack,
            medicines: [],
            labTests: []
        });

        await newClaim.save();

        res.status(201).json({
            message: "Prescription saved successfully!",
            prescription: newPrescription,
            claim: newClaim
        });

    } catch (error) {
        console.error("Error saving prescription:", error);
        res.status(500).json({ message: "Failed to save prescription." });
    }

};

const checkPrescription_before = async (req, res) => {
    const { doctorEmail, patientEmail, date } = req.query;

    try {
        const prescription = await Prescription.findOne({
            doctorEmail,
            patientEmail,
            dateIssued: {
                $gte: new Date(new Date(date).setHours(0, 0, 0, 0)), // Start of the day (00:00:00.000)
                $lt: new Date(new Date(date).setHours(23, 59, 59, 999)) // End of the day (23:59:59.999)
            }
        });

        res.status(200).json({ exists: !!prescription });
    } catch (error) {
        console.error("Error checking prescription:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



const checkPrescription = async (req, res) => {
    const { doctorEmail, patientEmail, date } = req.query;

    try {
        const prescription = await Prescription.findOne({
            doctorEmail,
            patientEmail,
            dateIssued: {
                $gte: new Date(new Date(date).setHours(0, 0, 0, 0)), // Start of the day (00:00:00.000)
                $lt: new Date(new Date(date).setHours(23, 59, 59, 999)) // End of the day (23:59:59.999)
            }
        });

        if (!prescription) {
            alert("Plaese save the Prescription first!!")
            return res.status(404).json({ exists: false });
        }

        res.status(200).json({ exists: true, prescriptionId: prescription._id });
    } catch (error) {
        console.error("Error checking prescription:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const createLabTests = async (req, res) => {
    const { prescriptionId, labTests } = req.body;

    try {
        const savedLabTests = await LabTest.create({
            prescriptionId,
            labTests
        });

        res.status(201).json({ message: "Lab tests saved successfully!", data: savedLabTests });
    } catch (error) {
        console.error("Error saving lab tests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const checkLabTests = async (req, res) => {
    const { prescriptionId } = req.query;

    try {
        const labTests = await LabTest.findOne({ prescriptionId });

        if (labTests) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error("Error checking lab tests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const createPharmacyRequest = async (req, res) => {
    try {
        const {
            prescriptionId,
            doctorEmail,
            doctorName,
            patientEmail,
            patientAge,
            patientGender,
            diagnosis,
            medications,
            advice,
            date
        } = req.body;

        // Validate required fields
        if (!prescriptionId || !doctorEmail || !patientEmail || !medications.length) {
            return res.status(400).json({ message: "Prescription ID, doctor email, patient email, and at least one medication are required." });
        }

        // Check if the prescription exists
        const prescription = await Prescription.findById(prescriptionId);
        if (!prescription) {
            return res.status(404).json({ message: "Prescription not found. Please save the prescription first." });
        }

        // Create and save the pharmacy request
        const newPharmacyRequest = new Medicine({
            prescriptionId,
            medicines: medications.map(med => ({
                medicineName: med.name,
                dosage: med.dosage,
                duration: med.duration,
                status: "Pending" // Default status
            }))
        });

        await newPharmacyRequest.save();

        res.status(201).json({ message: "Pharmacy request created successfully!", data: newPharmacyRequest });
    } catch (error) {
        console.error("Error creating pharmacy request:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const checkMedicines = async (req, res) => {
    const { prescriptionId } = req.query;

    try {
        const medicines = await Medicine.findOne({ prescriptionId });

        if (medicines) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error("Error checking medicines:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};






//////////   pharmacist
const getPharmacistMedicines = async (req, res) => {
    try {
        // Fetch all medicines and populate the prescriptionId field
        const medicines = await Medicine.find().populate('prescriptionId');

        if (!medicines.length) {
            return res.status(404).json({ message: 'No medicines found' });
        }

        // Extract unique prescription IDs
        const prescriptionIds = [...new Set(medicines.map(med => med.prescriptionId?._id.toString()))];

        // Fetch prescriptions with populated doctor and patient emails
        const prescriptions = await Prescription.find({ _id: { $in: prescriptionIds } });

        if (!prescriptions.length) {
            return res.status(404).json({ message: 'No prescriptions found for these medicines' });
        }

        // Extract unique doctor and patient emails
        const doctorEmails = [...new Set(prescriptions.map(pres => pres.doctorEmail))];
        const patientEmails = [...new Set(prescriptions.map(pres => pres.patientEmail))];

        // Fetch doctor details
        const doctors = await Doctor.find({ email: { $in: doctorEmails } });
        const doctorMap = doctors.reduce((acc, doctor) => {
            acc[doctor.email] = { name: doctor.name, specialization: doctor.specialization };
            return acc;
        }, {});

        // Fetch patient details
        const patients = await Patient.find({ email: { $in: patientEmails } });
        const patientMap = patients.reduce((acc, patient) => {
            acc[patient.email] = { name: patient.name, age: patient.age, gender: patient.gender };
            return acc;
        }, {});

        // Construct response data
        const result = medicines.map(med => {
            const prescription = prescriptions.find(pres => pres._id.toString() === med.prescriptionId?._id.toString());
            if (!prescription) return null; // Skip if no prescription found

            return {
                _id: med._id, // Add medicine ID
                prescriptionId: prescription._id,
                doctor: doctorMap[prescription.doctorEmail] || { name: "Unknown", specialization: "Unknown" },
                patient: patientMap[prescription.patientEmail] || { name: "Unknown", age: "N/A", gender: "N/A" },
                medicines: med.medicines.map(medItem => ({  // ✅ Correctly fetch medicines
                    id: medItem._id,
                    name: medItem.medicineName,
                    dosage: medItem.dosage,
                    duration: medItem.duration,
                    status: medItem.status
                }))
            };
        }).filter(record => record !== null); // Remove any null entries

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching medicines for pharmacist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


//////////////////////  lab attendant

const getLabAttendeeTests = async (req, res) => {
    try {
        console.log("✅ API HIT: /api/auth/lab-attendee-tests"); // 🔍 Log to confirm API call

        // Fetch all lab tests
        const labTests = await LabTest.find().populate('prescriptionId');
        console.log("🔍 Fetched lab tests:", labTests); // Debugging log

        if (!labTests.length) {
            console.log("⚠️ No lab tests found in DB.");
            return res.status(404).json({ message: 'No lab tests found' });
        }

        // Fetch prescriptions
        const prescriptionIds = [...new Set(labTests.map(test => test.prescriptionId?._id.toString()))];
        console.log("🔍 Prescription IDs:", prescriptionIds);

        const prescriptions = await Prescription.find({ _id: { $in: prescriptionIds } });
        console.log("🔍 Fetched prescriptions:", prescriptions);

        if (!prescriptions.length) {
            console.log("⚠️ No prescriptions found for lab tests.");
            return res.status(404).json({ message: 'No prescriptions found' });
        }

        res.status(200).json(labTests); // ✅ If successful, send response
    } catch (error) {
        console.error("❌ ERROR in getLabAttendeeTests:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const updateLabTestStatus = async (req, res) => {
    try {
        const { prescriptionId, testId, newStatus } = req.body;

        if (!prescriptionId || !testId || !newStatus) {
            return res.status(400).json({ error: "PrescriptionId, testId, and newStatus are required." });
        }

        // Find the lab test entry for this prescription
        const labTest = await LabTest.findOne({ prescriptionId });

        if (!labTest) {
            return res.status(404).json({ error: "Lab test not found." });
        }

        // Find the specific test within the labTests array
        const testIndex = labTest.labTests.findIndex(test => test._id.toString() === testId);

        if (testIndex === -1) {
            return res.status(404).json({ error: "Specific test not found." });
        }

        // Update the status of the specific test
        labTest.labTests[testIndex].status = newStatus;
        labTest.updatedAt = Date.now();

        await labTest.save();

        res.status(200).json({
            message: "Lab test status updated successfully.",
            labTest,
            allProcessed: labTest.labTests.every(test => test.status === "Completed")
        });
    } catch (error) {
        console.error('Error updating lab test status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getLabTestsByPrescriptionId = async (req, res) => {
    try {
        const { prescriptionId } = req.query;

        if (!prescriptionId) {
            return res.status(400).json({ error: "Prescription ID is required." });
        }

        // Find the lab test for this prescription
        const labTest = await LabTest.findOne({ prescriptionId }).populate('prescriptionId');

        if (!labTest) {
            return res.status(404).json({ error: "No lab tests found for this prescription." });
        }

        // Get prescription details
        const prescription = labTest.prescriptionId;

        // Get doctor and patient details
        const doctor = await Doctor.findOne({ email: prescription.doctorEmail });
        const patient = await Patient.findOne({ email: prescription.patientEmail });

        const result = {
            id: labTest._id.toString(),
            prescriptionId: prescription._id.toString(),
            patientName: patient?.name || "Unknown Patient",
            patientId: patient?._id.toString() || "Unknown",
            doctorName: doctor?.name || "Unknown Doctor",
            labAttendee: "Assigned Lab Attendee", // Consider adding this to your schema
            date: prescription.dateIssued.toISOString().split('T')[0],
            status: labTest.labTests.every(test => test.status === "Completed") ? "Processed" : "Processing",
            urgency: prescription.urgency || "Normal", // Consider adding this to your schema
            labTests: labTest.labTests.map(test => ({
                id: test._id.toString(),
                testName: test.testName,
                type: "Lab Test", // Consider adding this to your schema if you need test types
                status: test.status,
                comments: test.comments || ""
            }))
        };

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching lab tests by prescription ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getPatientName = async (req, res) => {
    try {
        const { email } = req.query;
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.status(200).json({
            name: patient.name || email, // Return the patient's name or email if name is not available
            email: patient.email,
            age: patient.age,
            gender: patient.gender
        });
    } catch (error) {
        console.error('Error fetching patient details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



/////////  claim

const getClaimByPrescriptionId = async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        const claim = await Claim.findOne({ prescriptionId })
            .populate('prescriptionId')
            .exec();

        if (!claim) {
            return res.status(404).json({ message: "Claim not found" });
        }

        res.status(200).json(claim);
    } catch (error) {
        console.error("Error fetching claim:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    addPatient,
    getPatientDetails,
    updatePatient,
    getInsuranceCompanies,
    getDoctorDetails,
    getDoctorProfile,
    updateDoctor,
    saveAppointmentSlot,
    getAvailableSlots,
    removeExpiredSlots,
    removePastAppointments,
    getCategorizedSlots,
    findDoctorEmail,
    getAvailableDoctorAppointments,
    bookAppointment,
    getPatientAppointments,
    getFutureAppointments,
    cancelAppointment,
    rescheduleAppointment,
    checkUserType,
    getDoctorAppointments,
    updateAppointmentStatus,
    getFuturePendingAndConfirmAppointments,
    savePrescription,
    checkPrescription_before,
    checkPrescription,
    createLabTests,
    checkLabTests,
    createPharmacyRequest,
    checkMedicines,
    getPharmacistMedicines,
    getLabAttendeeTests,
    updateLabTestStatus,
    getLabTestsByPrescriptionId,
    getPatientName,
    getClaimByPrescriptionId
};
