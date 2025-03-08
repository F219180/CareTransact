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

//doctor confirming appointment
router.get('/get-doctor-appointments', controllers.getDoctorAppointments);
router.put('/update-appointment-status', controllers.updateAppointmentStatus);



//Auth Appointment
router.post('/save-appointment-slot', controllers.saveAppointmentSlot);
router.get('/get-available-slots', controllers.getAvailableSlots);
router.delete('/remove-expired-slots', controllers.removeExpiredSlots);
router.get('/get-categorized-slots', controllers.getCategorizedSlots);
router.delete('/remove-past-appointments', controllers.removePastAppointments);


// patient side appointment
router.get('/find-doctor-email', controllers.findDoctorEmail);
router.get('/get-data-ofslots', controllers.getAvailableDoctorAppointments);
router.post('/book-appointment', controllers.bookAppointment);
router.get('/get-patient-appointments', controllers.getPatientAppointments);
router.get('/get-future-appointments', controllers.getFutureAppointments);
router.post('/cancel-appointment', controllers.cancelAppointment);
router.post('/reschedule-appointment', controllers.rescheduleAppointment);

router.get('/get-future-pending-and-confirm', controllers.getFuturePendingAndConfirmAppointments);


// Auth Routes     login
router.post('/check-user-type', controllers.checkUserType);



// Prescription

router.post("/prescriptions/create", controllers.savePrescription);
router.get("/prescriptions/check", controllers.checkPrescription);
router.post("/lab-tests/create", controllers.createLabTests);
router.post("/pharmacy-requests/create", controllers.createPharmacyRequest);






router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = router;