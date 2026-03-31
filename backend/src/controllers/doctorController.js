import doctorService from '../services/doctorService.js';
import mongoose from 'mongoose';

export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await doctorService.getAllDoctors();
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Error fetching doctor list", error: error.message });
    }
};

export const getDoctorProfile = async (req, res) => {
    try {
        const user = await doctorService.getDoctorProfile(req.params.email);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "Doctor not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const updateDoctorProfile = async (req, res) => {
    try {
        const { email, ...updateData } = req.body;
        const user = await doctorService.updateDoctorProfile(email, updateData);
        if (user) {
            res.json({ message: "Update successful!", user });
        } else {
            res.status(404).json({ message: "Doctor not found for update" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error during doctor profile update", error: error.message });
    }
};

export const getDoctorSchedule = async (req, res) => {
    try {
        const { doctorName } = req.query;
        if (!doctorName) return res.status(400).json({ message: "Doctor name is required" });
        const appointments = await doctorService.getDoctorSchedule(doctorName);
        res.json(appointments);
    } catch (error) {
        console.error("Error fetching doctor schedule:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAppointmentById = async (req, res) => {
    try {
        const appointment = await doctorService.getAppointmentById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: "Error fetching appointment details", error: error.message });
    }
};

export const searchMedicines = async (req, res) => {
    try {
        const medicines = await doctorService.searchMedicines(req.query.name);
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ message: "Error accessing medicine repository" });
    }
};

export const savePrescription = async (req, res) => {
    try {
        const savedData = await doctorService.savePrescription(req.body);
        res.status(201).json({
            success: true,
            message: "Prescription saved successfully!",
            data: savedData
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Could not save prescription." });
    }
};

export const addMedicine = async (req, res) => {
    try {
        const { medicineName, price } = req.body;
        if (!medicineName || !price) {
            return res.status(400).json({ success: false, message: "Medicine name and price are required" });
        }
        const medicine = await doctorService.addMedicine(req.body);
        res.status(201).json({
            success: true,
            message: "New medicine added successfully!",
            medicine
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "System error: " + (err.message || "Could not add new medicine.") });
    }
};

export const getPatientHistory = async (req, res) => {
    try {
        const history = await doctorService.getPatientHistory(req.query.patientName);
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: "System error fetching consultation history." });
    }
};

export const getVitalsByAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
        const vitals = await doctorService.getVitalsByAppointment(appointmentId);
        res.json(vitals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const completeAppointment = async (req, res) => {
    try {
        const { id } = req.body;
        const updated = await doctorService.completeAppointment(id);
        if (!updated) return res.status(404).json({ message: "Appointment not found" });
        res.json({ success: true, message: "Consultation completed!", appointment: updated });
    } catch (err) {
        res.status(500).json({ message: "Error updating appointment status", error: err.message });
    }
};

export const getDoctorReviews = async (req, res) => {
    try {
        if (!req.query.doctorEmail) return res.status(400).json({ message: "Doctor email is required" });
        const reviews = await doctorService.getDoctorReviews(req.query.doctorEmail);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching reviews" });
    }
};

export const replyToReview = async (req, res) => {
    try {
        const updated = await doctorService.replyToReview(req.params.id, req.body.reply);
        if (!updated) return res.status(404).json({ message: "Review not found" });
        res.json({ success: true, review: updated });
    } catch (error) {
        res.status(500).json({ message: "Error replying to review" });
    }
};

export const getFullHistory = async (req, res) => {
    try {
        const histories = await doctorService.getFullHistory(req.query.searchTerm);
        res.json(histories);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching history records" });
    }
};
