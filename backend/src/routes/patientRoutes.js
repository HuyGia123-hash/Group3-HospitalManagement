import express from 'express';
import { getPatientProfile, updatePatientProfile, getAllPatients } from '../controllers/patientController.js';
import { getAllDoctors } from '../controllers/doctorController.js';
import {
    getAppointments,
    getAvailability,
    createAppointment,
    cancelAppointment,
    deleteAppointment
} from '../controllers/appointmentController.js';
import { getHistory } from '../controllers/historyController.js';
import { createReview } from '../controllers/reviewController.js';

const router = express.Router();


router.get('/', getAllPatients);
router.get('/profile/:email', getPatientProfile);
router.put('/update-profile', updatePatientProfile);






router.get('/doctors', getAllDoctors);


router.get('/appointments/availability', getAvailability);
router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);
router.put('/appointments/:id/cancel', cancelAppointment);
router.delete('/appointments/:id', deleteAppointment);


router.post('/reviews', createReview);


router.get('/history', getHistory);

export default router;
