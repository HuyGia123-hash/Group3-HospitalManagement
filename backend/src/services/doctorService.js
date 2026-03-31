import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Medicine from '../models/Medicine.js';
import Prescription from '../models/Prescription.js';
import VitalSigns from '../models/VitalSigns.js';
import Review from '../models/Review.js';
import History from '../models/History.js';
import mongoose from 'mongoose';

const doctorService = {
    getAllDoctors: async () => {
        return await User.find({ role: 'doctor' }, 'name department experience email user');
    },

    getDoctorProfile: async (email) => {
        return await User.findOne({ email, role: 'doctor' });
    },

    updateDoctorProfile: async (email, updateData) => {
        return await User.findOneAndUpdate({ email, role: 'doctor' }, updateData, { new: true });
    },

    getDoctorSchedule: async (doctorName) => {
        const cleanName = String(doctorName).trim().replace(/^BS\.\s*/i, '');
        const nameRegex = new RegExp(`${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

        const appointments = await Appointment.find({
            doctorName: nameRegex
        }).lean();

        return appointments.map(apt => {
            const appointmentDate = new Date(apt.date);
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            let status = apt.status || "Waiting";

            if (status === "Waiting" || status === "In Progress" || status === "pending") {
                if (appointmentDate < now) {
                    status = "Cancelled";
                } else if (appointmentDate.getTime() === now.getTime()) {
                    const [hour] = (apt.timeSlot || "00:00").split(':').map(Number);
                    const currentHour = new Date().getHours();
                    if (hour < 12 && currentHour >= 12) status = "Cancelled";
                    if (hour >= 13 && currentHour >= 21) status = "Cancelled";
                }
            }

            if (status === "Waiting" && appointmentDate.getTime() === now.getTime()) {
                status = "In Progress";
            }

            return { ...apt, displayStatus: status };
        });
    },

    getAppointmentById: async (id) => {
        return await Appointment.findById(id);
    },

    searchMedicines: async (query) => {
        let medicines;
        if (!query || query.trim() === "") {
            medicines = await Medicine.find({})
                .select('medicineName dosage form price defaultNote suggestedDosage')
                .limit(10)
                .lean();
        } else {
            const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            medicines = await Medicine.find({
                medicineName: { $regex: safeQuery, $options: 'i' }
            })
                .select('medicineName dosage form price defaultNote suggestedDosage')
                .limit(10)
                .lean();
        }
        return medicines;
    },

    savePrescription: async (data) => {
        const newPrescription = new Prescription(data);
        return await newPrescription.save();
    },

    addMedicine: async (medicineData) => {
        const { medicineName, price, dosage, form } = medicineData;
        const docToInsert = {
            medicineName, price, dosage, form,
            defaultNote: "",
            suggestedDosage: { morning: 0, noon: 0, afternoon: 0, evening: 0 },
            isMedicine: true
        };
        const result = await mongoose.connection.db.collection('Prescription').insertOne(docToInsert);
        return { ...docToInsert, _id: result.insertedId };
    },

    getPatientHistory: async (patientName) => {
        return await Prescription.find({ patientName: new RegExp(patientName, 'i') }).sort({ createdAt: -1 });
    },

    getVitalsByAppointment: async (appointmentId) => {
        return await VitalSigns.find({ appointmentId })
            .sort({ createdAt: -1 })
            .limit(1)
            .lean();
    },

    completeAppointment: async (id) => {
        return await Appointment.findByIdAndUpdate(id, {
            $set: { status: 'Completed', completedAt: new Date() }
        }, { new: true });
    },

    getDoctorReviews: async (doctorEmail) => {
        const user = await User.findOne({ email: doctorEmail });
        let query = { doctorEmail };
        if (user) {
            const nameRegex = new RegExp(`^${user.name.trim()}$`, 'i');
            query = { $or: [{ doctorEmail }, { bac_si: nameRegex }] };
        }
        const reviews = await Review.find(query).sort({ createdAt: -1 });
        return reviews.map(r => ({
            ...r._doc,
            rating: r.rating || 0,
            comment: r.comment || "No comment provided",
            reviewerName: "Anonymous Patient"
        }));
    },

    replyToReview: async (id, reply) => {
        return await Review.findByIdAndUpdate(id, { reply, repliedAt: new Date() }, { new: true });
    },

    getFullHistory: async (searchTerm) => {
        let query = {};
        if (searchTerm) {
            const regex = new RegExp(searchTerm, 'i');
            query = { $or: [{ patientName: regex }, { diagnosis: regex }, { doctorName: regex }] };
        }
        return await History.find(query).sort({ date: -1 });
    }
};

export default doctorService;
