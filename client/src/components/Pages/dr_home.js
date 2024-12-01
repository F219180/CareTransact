import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container, Grid, Paper, Typography, Box, Button, Card, Chip,
    Avatar, Tabs, Tab, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, FormControl, InputLabel, Select, MenuItem, TextField, Table,
    TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';

const DocHome = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [openSlotDialog, setOpenSlotDialog] = useState(false);
    const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedTime, setSelectedTime] = useState(dayjs());
    const [duration, setDuration] = useState(30); // Default duration
    const [doctorDetails, setDoctorDetails] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]); // Patient records
    const [claims, setClaims] = useState([]); // Claims data
    const { email } = useAuth();

    useEffect(() => {
        if (email) {
            fetchDoctorDetails(email);
            fetchAppointments(email);
            fetchPatientRecords(email);
            fetchClaims(email);
        } else {
            console.error('No email available in AuthContext');
        }
    }, [email]);

    const fetchDoctorDetails = async (email) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/doctor-details', { email });
            if (response.status === 200) {
                setDoctorDetails({
                    name: response.data.name,
                    specialization: response.data.specialization,
                });
            } else {
                console.error('Doctor not found');
            }
        } catch (error) {
            console.error('Error fetching doctor details:', error);
        }
    };

    const fetchAppointments = async (doctorEmail) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/auth/appointments/${doctorEmail}`);
            if (response.status === 200) {
                const currentDate = dayjs().startOf('day');
                const validAppointments = [];

                for (let appointment of response.data) {
                    const appointmentDate = dayjs(appointment.date).startOf('day');

                    if (appointmentDate.isBefore(currentDate)) {
                        // Remove previous day slots from the database
                        await axios.delete(`http://localhost:5000/api/auth/appointments/${appointment._id}`);
                    } else {
                        validAppointments.push({
                            ...appointment,
                            formattedDate: appointmentDate.format('YYYY-MM-DD'),
                        });
                    }
                }

                setAppointments(validAppointments);
            } else {
                console.error('No appointments found');
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const fetchPatientRecords = async (doctorEmail) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/auth/patients/${doctorEmail}`);
            if (response.status === 200) {
                setPatients(response.data);
            } else {
                console.error('No patient records found');
            }
        } catch (error) {
            console.error('Error fetching patient records:', error);
        }
    };

    const fetchClaims = async (doctorEmail) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/auth/claims/${doctorEmail}`);
            if (response.status === 200) {
                setClaims(response.data);
            } else {
                console.error('No claims data found');
            }
        } catch (error) {
            console.error('Error fetching claims data:', error);
        }
    };

    const handleAddSlot = async () => {
        const selectedDateTime = dayjs(`${selectedDate.format('YYYY-MM-DD')}T${selectedTime.format('HH:mm')}`);
        const now = dayjs();

        if (selectedDateTime.isBefore(now)) {
            alert('You cannot select a past date or time for the slot.');
            return;
        }

        try {
            const newSlot = {
                doctorEmail: email,
                doctorName: doctorDetails.name,
                specialization: doctorDetails.specialization,
                date: selectedDate.format('YYYY-MM-DD'),
                time: selectedTime.format('HH:mm'),
                duration,
                status: 'Free Slot',
            };

            const response = await axios.post('http://localhost:5000/api/auth/add-appointment', newSlot);

            if (response.status === 201) {
                setAppointments((prevAppointments) => [
                    ...prevAppointments,
                    { ...newSlot, formattedDate: newSlot.date },
                ]);
            } else {
                console.error('Error adding slot');
            }
        } catch (error) {
            console.error('Error in handleAddSlot:', error);
        } finally {
            setOpenSlotDialog(false);
        }
    };

    const handleRemoveSlot = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/auth/appointments/${id}`);
            setAppointments((prevAppointments) =>
                prevAppointments.filter((slot) => slot._id !== id)
            );
        } catch (error) {
            console.error('Error removing slot:', error);
        }
    };

    const groupedAppointments = appointments.reduce((acc, appointment) => {
        const date = appointment.formattedDate;
        if (!acc[date]) acc[date] = [];
        acc[date].push(appointment);
        return acc;
    }, {});

    const SlotManagement = () => {
        const today = dayjs().format('YYYY-MM-DD');
        const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

        const otherDates = Object.keys(groupedAppointments)
            .filter((date) => date !== today && date !== tomorrow)
            .sort((a, b) => new Date(a) - new Date(b));

        const sortedDates = [today, tomorrow, ...otherDates];

        return (
            <Card sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6">Appointment Slots</Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenSlotDialog(true)}
                    >
                        Add Slots
                    </Button>
                </Box>
                <Grid container spacing={2}>
                    {sortedDates.map((date) => (
                        <Grid item xs={12} key={date}>
                            <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                                <Typography variant="subtitle1">
                                    {date === today
                                        ? "Today's Slots"
                                        : date === tomorrow
                                            ? "Tomorrow's Slots"
                                            : dayjs(date).format('DD MMM, YYYY')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                    {groupedAppointments[date]?.map((appointment) => (
                                        <Box
                                            key={appointment._id}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                backgroundColor:
                                                    appointment.status === 'Free Slot' ? '#1976d2' : '#ffebee',
                                                color: appointment.status === 'Free Slot' ? 'white' : '#d32f2f',
                                                padding: '8px 12px',
                                                borderRadius: '16px',
                                                gap: 1,
                                            }}
                                        >
                                            <Typography variant="body2">
                                                {appointment.time}{' '}
                                                {parseInt(appointment.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                                            </Typography>
                                            {appointment.status === 'Free Slot' && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveSlot(appointment._id)}
                                                    sx={{
                                                        color: 'white',
                                                        padding: 0,
                                                        marginLeft: 1,
                                                        '&:hover': {
                                                            color: '#ffffff',
                                                            fontWeight: 'bolder',
                                                            transform: 'scale(1.1)',
                                                        },
                                                    }}
                                                >
                                                    <Close fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Card>
        );
    };

    const PatientRecords = () => (
        <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Patient Records</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Patient Name</TableCell>
                        <TableCell>Last Visit</TableCell>
                        <TableCell>Diagnosis</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {patients.map((patient) => (
                        <TableRow key={patient._id}>
                            <TableCell>{patient.name}</TableCell>
                            <TableCell>{dayjs(patient.lastVisit).format('DD MMM, YYYY')}</TableCell>
                            <TableCell>{patient.diagnosis}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );

    const ClaimsAndPayments = () => (
        <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Claims & Payments</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Claim ID</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {claims.map((claim) => (
                        <TableRow key={claim._id}>
                            <TableCell>{claim.claimId}</TableCell>
                            <TableCell>${claim.amount}</TableCell>
                            <TableCell>{claim.status}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );

    const DoctorHeader = () => (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
                color: 'white',
                borderRadius: '15px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
        >
            <Grid container alignItems="center" spacing={3}>
                <Grid item>
                    <Avatar
                        sx={{
                            width: 100,
                            height: 100,
                            border: '4px solid white',
                        }}
                        src="/doctor-avatar.jpg"
                    />
                </Grid>
                <Grid item>
                    <Typography variant="h4" fontWeight="bold">
                        {doctorDetails ? `Dr. ${doctorDetails.name}` : 'Loading...'}
                    </Typography>
                    <Typography variant="subtitle1">
                        {doctorDetails ? doctorDetails.specialization : ''}
                    </Typography>
                    {doctorDetails && (
                        <Chip
                            label="Available"
                            color="success"
                            sx={{ mt: 1, backgroundColor: 'rgba(255,255,255,0.9)' }}
                        />
                    )}
                </Grid>
            </Grid>
        </Box>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <DoctorHeader />
            <Box sx={{ mb: 3 }}>
                <Tabs value={selectedTab} onChange={(event, newValue) => setSelectedTab(newValue)}>
                    <Tab label="Appointments" />
                    <Tab label="Patient Records" />
                    <Tab label="Claims & Payments" />
                </Tabs>
            </Box>
            {selectedTab === 0 && <SlotManagement />}
            {selectedTab === 1 && <PatientRecords />}
            {selectedTab === 2 && <ClaimsAndPayments />}

            {/* Add Slot Dialog */}
            <Dialog open={openSlotDialog} onClose={() => setOpenSlotDialog(false)}>
                <DialogTitle>Add Available Slots</DialogTitle>
                <DialogContent sx={{ minWidth: 400 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <DatePicker
                                label="Select Date"
                                value={selectedDate}
                                onChange={(newValue) => setSelectedDate(newValue)}
                            />
                            <TimePicker
                                label="Start Time"
                                value={selectedTime}
                                onChange={(newValue) => setSelectedTime(newValue)}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Duration</InputLabel>
                                <Select
                                    value={duration}
                                    onChange={(event) => setDuration(event.target.value)}
                                >
                                    <MenuItem value={30}>30 minutes</MenuItem>
                                    <MenuItem value={60}>1 hour</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSlotDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddSlot}>
                        Add Slots
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Write Prescription Dialog */}
            <Dialog
                open={openPrescriptionDialog}
                onClose={() => setOpenPrescriptionDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Write Prescription</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField label="Patient Name" fullWidth disabled value="John Doe" />
                        <TextField label="Diagnosis" fullWidth multiline rows={2} />
                        <TextField label="Medications" fullWidth multiline rows={3} />
                        <TextField label="Instructions" fullWidth multiline rows={2} />
                        <TextField
                            label="Follow-up Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPrescriptionDialog(false)}>Cancel</Button>
                    <Button variant="contained">Save Prescription</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DocHome;
