const express = require('express');
const router = express.Router();
const controllers = require('../controller/auth_controller');

// Patient Routes
router.post('/patients', controllers.addPatient);
router.get('/patient-details', controllers.getPatientDetails);
router.put('/update-patient', controllers.updatePatient);

// Doctor Routes
router.post('/get-doctor', controllers.getDoctorDetails);
router.get('/doctor-details', controllers.getDoctorDetails);
router.get('/doctor-profile', controllers.getDoctorProfile);
router.put('/update-doctor', controllers.updateDoctor);

//Auth Appointment
router.post('/save-appointment-slot', controllers.saveAppointmentSlot);
router.get('/get-available-slots', controllers.getAvailableSlots);
router.delete('/remove-expired-slots', controllers.removeExpiredSlots);
router.get('/get-categorized-slots', controllers.getCategorizedSlots);

// patient side appointment
router.get('/find-doctor-email', controllers.findDoctorEmail);
router.get('/get-data-ofslots', controllers.getAvailableDoctorAppointments);



// Auth Routes
router.post('/check-user-type', controllers.checkUserType);

module.exports = router;