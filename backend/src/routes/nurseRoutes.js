import express from 'express';
import { 
    walkInBooking, 
    searchAppointments, 
    getRecentAppointments, 
    cancelAppointment,
    getVitalsEligibility,
} from '../controllers/nurseController.js';

const router = express.Router();

router.post('/walk-in-booking', walkInBooking);
router.get('/appointments/search', searchAppointments);
router.get('/appointments/recent', getRecentAppointments);
router.get('/appointments/:id/vitals-eligibility', getVitalsEligibility);
router.delete('/appointments/:id', cancelAppointment);

export default router;
