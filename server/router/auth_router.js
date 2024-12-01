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




// Add Doctor Profile
router.post('/doctors', async (req, res) => {
    try {
        const doctor = new Doctor(req.body);
        await doctor.save();
        res.status(201).json({ message: 'Doctor profile created', doctor });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add Patient Profile
router.post('/patients', async (req, res) => {
    try {
        const patient = new Patient(req.body);
        await patient.save();
        res.status(201).json({ message: 'Patient profile created', patient });
    } catch (error) {
        res.status(400).json({ error: error.message });
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

// Get All Doctors
router.get('/doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Patients
router.get('/patients', async (req, res) => {
    try {
        const patients = await Patient.find();
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ error: error.message });
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



module.exports = router;
