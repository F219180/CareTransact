const mongoose = require('mongoose');

// Doctor Schema (Profile information specific to doctors)
const doctorSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    specialization: { type: String, default: "N/A" },
    education: { type: String, default: "N/A" },
    services: { type: [String], default: [] },
    profilePicture: { type: String, default: "N/A" },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" }, // Added gender
    consultationFee: { type: Number, default: 0 } // Added consultation fee
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
    doctorName: { type: String },
    specialization: { type: String },
    patientEmail: { type: String }, // Ensure patient email is mandatory
    patientName: { type: String }, // Ensure patient name is mandatory
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // Format: HH:mm (start time of appointment)
    endTime: { type: String, required: true }, // Format: HH:mm (end time of appointment)
    status: {
        type: String,
        enum: ['Pending', 'Available', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Pending'
    }, // Enum for appointment status// Added location field
    consultationFee: { type: Number, default: 0 }, // Added consultation fee field
});

// Exporting Models
const Doctor = mongoose.model('Doctor', doctorSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = { Doctor, Patient, Appointment };
