const express = require('express');
const router = express.Router();
const { Doctor, Patient, Appointment } = require('../models/user_models');


router.post('/add-appointment', async (req, res) => {
    try {
        const { doctorEmail, doctorName, specialization, date, time, duration } = req.body;

        // Create a new appointment
        const newAppointment = new Appointment({
            doctorEmail,
            doctorName,
            specialization,
            date,
            time,
            duration,
        });

        await newAppointment.save();
        res.status(201).json({ message: 'Appointment slot created successfully' });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//fetching appointment
router.get('/appointments/:doctorEmail', async (req, res) => {
    const { doctorEmail } = req.params;
    try {
        const appointments = await Appointment.find({ doctorEmail });
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//delete appointment
router.delete('/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Appointment.findByIdAndDelete(id);
        res.status(200).json({ message: 'Appointment slot deleted successfully' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});






// Add Patient Profile
router.post('/patients', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Create a new patient record with only the email field populated
        const patient = new Patient({ email });
        await patient.save();

        res.status(201).json({ message: 'Patient email saved successfully', patient });
    } catch (error) {
        console.error('Error saving patient email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Route to get patient details by email
router.get('/patient-details', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.status(200).json(patient);
    } catch (error) {
        console.error('Error fetching patient details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/update-patient', async (req, res) => {
    const { email, ...updatedFields } = req.body;

    try {
        const patient = await Patient.findOneAndUpdate(
            { email },
            updatedFields,
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
});



// Schedule Appointment
router.post('/appointments', async (req, res) => {
    try {
        const appointment = new Appointment(req.body);
        await appointment.save();
        res.status(201).json({ message: 'Appointment scheduled', appointment });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// Get All Appointments
router.get('/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add this to auth_router.js
router.post('/check-user-type', async (req, res) => {
    const { email } = req.body;
    try {
        // Check if email exists in doctors' collection
        const doctor = await Doctor.findOne({ email });
        if (doctor) {
            return res.status(200).json({ userType: 'doctor' });
        }

        // Check if email exists in patients' collection
        const patient = await Patient.findOne({ email });
        if (patient) {
            return res.status(200).json({ userType: 'patient' });
        }

        // If email not found in either collection
        res.status(404).json({ message: 'Email not found' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// auth_router.js
router.post('/doctor-details', async (req, res) => {
    const { email } = req.body;
    console.log('Received email:', email); // Debug log
    try {
        const doctor = await Doctor.findOne({ email });
        if (doctor) {
            console.log('Doctor found:', doctor);
            return res.status(200).json({ name: doctor.name, specialization: doctor.specialization });
        } else {
            console.log('Doctor not found');
            return res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error) {
        console.error('Error in /doctor-details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/doctor-profile', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
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
});




module.exports = router;


// Fetch doctor details
router.post('/get-doctor', async (req, res) => {
    const { email } = req.body;

    try {
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
        });
    } catch (error) {
        console.error('Error fetching doctor:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update doctor details
router.put('/update-doctor', async (req, res) => {
    const { email, name, specialization, education, services, profilePicture } = req.body;

    try {
        const updatedDoctor = await Doctor.findOneAndUpdate(
            { email },
            {
                name: name || "N/A",
                specialization: specialization || "N/A",
                education: education || "N/A",
                services: services || [],
                profilePicture: profilePicture || "N/A",
            },
            { new: true, upsert: true }
        );

        if (!updatedDoctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.status(200).json({ message: "Doctor profile updated successfully", doctor: updatedDoctor });
    } catch (error) {
        console.error("Error updating doctor profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get('/doctor-details', async (req, res) => {
    const { email } = req.query;

    try {
        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        res.status(200).json(doctor);
    } catch (error) {
        console.error("Error fetching doctor details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
