const mongoose = require('mongoose');

// Doctor Schema (Profile information specific to doctors)
const doctorSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    experienceYears: { type: Number, required: true },
    contactNumber: { type: String },
    profilePicture: { type: String }, // URL for picture storage
});

// Patient Schema (Profile information specific to patients)
const patientSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String },
    diseaseType: { type: String },
    emergencyContact: { type: String }
});

// Appointment Schema (Details about appointments)
const appointmentSchema = new mongoose.Schema({
    doctorEmail: { type: String, required: true },
    doctorName: { type: String, required: true },
    specialization: { type: String, required: true },
    patientEmail: { type: String },
    patientName: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // Format: HH:mm
    duration: { type: Number, required: true }, // In minutes
    status: { type: String, default: 'Free Slot' },
});

// Exporting Models
const Doctor = mongoose.model('Doctor', doctorSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = { Doctor, Patient, Appointment };
