import express from 'express';
import { 
    getAllDoctors, 
    getDoctorProfile, 
    updateDoctorProfile,
    getDoctorSchedule,
    getAppointmentById,
    searchMedicines,
    savePrescription,
    addMedicine,
    getPatientHistory,
    getVitalsByAppointment,
    completeAppointment,
    getDoctorReviews,
    replyToReview,
    getFullHistory
} from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getAllDoctors);
router.get('/profile/:email', getDoctorProfile);
router.put('/update-profile', updateDoctorProfile);
router.get('/schedule', getDoctorSchedule);
router.get('/appointment/:id', getAppointmentById);
router.get('/medicines/search', searchMedicines);
router.post('/prescription/save', savePrescription);
router.post('/medicines/add', addMedicine);
router.get('/patient-history', getPatientHistory);
router.get('/vitals/appointment/:appointmentId', getVitalsByAppointment);
router.put('/appointment/complete', completeAppointment);

router.get('/reviews', getDoctorReviews);
router.put('/reviews/:id/reply', replyToReview);
router.get('/history/all', getFullHistory);

export default router;
