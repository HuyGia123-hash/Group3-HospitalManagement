import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();
import Medicine from '../models/Medicine.js';
import Prescription from '../models/Prescription.js';

router.get('/search', async (req, res) => {
    try {
        const query = req.query.name;

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

        res.status(200).json(medicines);
    } catch (err) {
        console.error("Medicine search logic error:", err);
        res.status(500).json({ message: "System error while accessing medicine repository" });
    }
});

router.post('/save-prescription', async (req, res) => {
    try {
        const newPrescription = new Prescription(req.body);
        const savedData = await newPrescription.save();
        res.status(201).json({
            success: true,
            message: "Prescription saved successfully!",
            data: savedData
        });
    } catch (err) {
        console.error("Error saving prescription:", err);
        res.status(500).json({
            success: false,
            message: "System error: Could not save prescription."
        });
    }
});

router.post('/add', async (req, res) => {
    console.log(">>> REQUEST: Thêm thuốc mới:", req.body);
    try {
        const { medicineName, price, dosage, form } = req.body;
        if (!medicineName || !price) {
            return res.status(400).json({ success: false, message: "Medicine name and price are required" });
        }

        const docToInsert = {
            medicineName,
            price,
            dosage,
            form,
            defaultNote: "",
            suggestedDosage: { morning: 0, noon: 0, afternoon: 0, evening: 0 },
            isMedicine: true 
        };


        const result = await mongoose.connection.db.collection('Prescription').insertOne(docToInsert);

        res.status(201).json({
            success: true,
            message: "New medicine added successfully!",
            medicine: { ...docToInsert, _id: result.insertedId }
        });
    } catch (err) {
        console.error("Error adding new medicine (Direct DB):", err);
        res.status(500).json({
            success: false,
            message: "System error: " + (err.message || "Could not add new medicine.")
        });
    }
});

router.get('/history/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        const history = await Prescription.find({ patientId }).sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (err) {
        console.error("Error fetching medical history:", err);
        res.status(500).json({ message: "System error while fetching medical history." });
    }
});

export default router;
