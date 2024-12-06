const mongoose = require('mongoose');

// Doctor Schema (Profile information specific to doctors)
const doctorSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    specialization: { type: String, default: "N/A" }, // Added specialization field
    education: { type: String, default: "N/A" },
    services: { type: [String], default: [] },
    profilePicture: { type: String, default: "N/A" }, // URL for picture storage
});

// Patient Schema (Profile information specific to patients)
const patientSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // Compulsory field
    name: { type: String, default: "" },
    gender: { type: String, enum: ["Female", "Male", "Other", null], default: null }, // Allow null
    age: { type: Number, default: null },
    bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", null], default: null }, // Allow null
    cnic: { type: String, default: "" },
    contactNumber: { type: String, default: "" },
    dob: { type: Date, default: null },
    maritalStatus: { type: String, enum: ["Married", "Single", "Divorced", "Widowed", null], default: null }, // Allow null
    profilePicture: { type: String, default: "" }, // URL for storing profile picture
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
