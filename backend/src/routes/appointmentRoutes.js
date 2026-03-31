import express from 'express';
import {
    getAppointments,
    getAvailability,
    getDoctorSchedule,
    getAppointmentById,
    completeAppointment,
    cancelAppointment,
    deleteAppointment,
    createAppointment
} from '../controllers/appointmentController.js';

const router = express.Router();

router.get('/', getAppointments);
router.get('/availability', getAvailability);
router.get('/doctor-schedule', getDoctorSchedule);
router.get('/:id', getAppointmentById);
router.put('/complete', completeAppointment);
router.put('/:id/cancel', cancelAppointment);
router.delete('/:id', deleteAppointment);
router.post('/', createAppointment);

export default router;