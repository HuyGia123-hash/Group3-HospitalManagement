import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { canNurseRecordVitals } from '../utils/vitalsEligibility.js';

const pad2 = (n) => String(n).padStart(2, '0');
const toLocalDateString = (d) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const SLOT_DEFS = [
    { slot: '07:00 - 08:00', session: 'Morning' },
    { slot: '09:00 - 10:00', session: 'Morning' },
    { slot: '13:00 - 15:00', session: 'Afternoon' },
    { slot: '16:00 - 18:00', session: 'Afternoon' },
];

const DEADLINE = {
    'Morning': { hour: 11, minute: 30 },
    'Afternoon': { hour: 19, minute: 0 },
};

const sessionForSlot = (slot) => SLOT_DEFS.find((x) => x.slot === slot)?.session;

export const walkInBooking = async (req, res) => {
    try {
        const {
            name,
            gender,
            age,
            email,
            password,
            address,
            phone,
            cccd,
            date,
            timeSlot,
            doctorName,
        } = req.body || {};

        if (!name || !email || !password || !date || !timeSlot || !doctorName || !phone || !cccd) {
            return res.status(400).json({
                success: false,
                error: 'Required information is missing (name, email, password, date, timeSlot, doctorName, phone, cccd)',
            });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
            return res.status(400).json({ success: false, error: 'Invalid date format' });
        }

        const trimmedName = String(name).trim();
        const trimmedEmail = String(email).trim();
        const trimmedCccd = String(cccd).trim();
        const trimmedPhone = String(phone).trim();



        if (!/^[\p{L}\s]+$/u.test(trimmedName)) {
            return res.status(400).json({ success: false, error: 'Name must only contain letters (no numbers/special characters)' });
        }

        if (!/^\d{10}$/.test(trimmedPhone)) {
            return res.status(400).json({ success: false, error: 'Phone number must be exactly 10 digits' });
        }

        if (!/^\d{10}$/.test(trimmedCccd)) {
            return res.status(400).json({ success: false, error: 'ID Card must be exactly 10 digits' });
        }

        if (!/^[^\s@]+@gmail\.com$/i.test(trimmedEmail)) {
            return res.status(400).json({ success: false, error: 'Email must end with @gmail.com' });
        }

        const session = sessionForSlot(timeSlot);
        if (!session) {
            return res.status(400).json({ success: false, error: 'Invalid timeSlot' });
        }

        const todayStr = toLocalDateString(new Date());
        if (String(date) < todayStr) {
            return res.status(400).json({ success: false, error: 'Past dates are not allowed' });
        }

        const now = new Date();
        const isToday = date === todayStr;

        if (isToday) {
            const deadline = DEADLINE[session];
            const deadlineDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                deadline.hour,
                deadline.minute,
                0
            );

            if (now.getTime() >= deadlineDate.getTime()) {
                return res.status(400).json({
                    success: false,
                    error:
                        session === 'Morning'
                            ? 'Morning booking deadline (11:30) has passed. Please choose another slot.'
                            : 'Afternoon booking deadline (19:00) has passed. Please choose another slot.',
                });
            }
        }

        let patient = await User.findOne({ email });
        if (!patient) {
            patient = await User.create({
                user: `patient_${Date.now()}`,
                name: trimmedName,
                email: trimmedEmail,
                password,
                role: 'patient',
                gender,
                age,
                address,
                phone: trimmedPhone,
                cccd: trimmedCccd,
            });
        } else {
            patient = await User.findOneAndUpdate(
                { _id: patient._id },
                {
                    $set: {
                        name: trimmedName,
                        gender,
                        age,
                        address,
                        cccd: trimmedCccd,
                        phone: trimmedPhone,
                        password,
                    },
                },
                { new: true }
            );
        }

        const doctor = await User.findOne({ name: doctorName, role: 'doctor' }).lean();
        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Selected doctor not found',
            });
        }

        const existingScheduledForPatient = await Appointment.findOne({
            patientName: trimmedName,
            date,
            status: {
                $in: ['pending', 'approved', 'Scheduled', 'Approved', 'Pending'],
            },
        }).lean();

        if (existingScheduledForPatient) {
            return res.json({
                success: true,
                alreadyHasAppointment: true,
                appointment: existingScheduledForPatient,
                message: 'Patient already has a pending appointment, no need to create a new one.',
            });
        }


        const slotCount = await Appointment.countDocuments({
            date,
            timeSlot,
            status: { $ne: 'cancelled' },
        });
        if (slotCount >= 1) {
            return res.status(409).json({
                success: false,
                error: 'This time slot is already booked. Please choose another slot.',
            });
        }

        const walkInTs = Date.now();
        const created = await Appointment.create({
            patientName: trimmedName,
            patientEmail: trimmedEmail,
            patientPhone: trimmedPhone,
            doctorName,
            department: doctor.department,
            gender,
            age,
            address,
            cccd: trimmedCccd,
            date,
            timeSlot,
            session,
            appointmentSource: 'walk_in',
            nurseWalkInCreatedAt: walkInTs,
            status: 'approved',
            createdAt: Math.floor(Date.now() / 1000),
        });

        return res.status(201).json({ success: true, appointment: created });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const searchAppointments = async (req, res) => {
    try {
        const name = String(req.query.name || '').trim();
        if (!name) {
            return res.status(400).json({ success: false, error: 'Missing name query' });
        }

        const todayStr = toLocalDateString(new Date());
        const date = String(req.query.date || todayStr);

        const items = await Appointment.find({
            date,
            status: {
                $in: ['pending', 'approved', 'Scheduled', 'Approved', 'Pending'],
            },
            patientName: { $regex: name, $options: 'i' },
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        return res.json({ success: true, results: items });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const getRecentAppointments = async (req, res) => {
    try {
        const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
        const items = await Appointment.find({})
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        return res.json({ success: true, results: items });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const cancelAppointment = async (req, res) => {
    try {
        const id = String(req.params.id || '');
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }

        if (['completed', 'Completed'].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete a completed appointment',
            });
        }

        appointment.status = 'cancelled';
        appointment.cancelReason = 'Nurse cancelled from reception screen';
        await appointment.save();

        return res.json({ success: true, message: 'Appointment cancelled', appointment });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const getVitalsEligibility = async (req, res) => {
    try {
        const id = String(req.params.id || '');
        const apt = await Appointment.findById(id).lean();
        if (!apt) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }
        const r = canNurseRecordVitals(apt);
        return res.json({
            success: true,
            allowed: r.ok,
            code: r.code,
            message: r.message,
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};