import User from '../models/User.js';

export const getAllPatients = async (req, res) => {
    try {
        const patients = await User.find({ role: 'patient' }, '-password');
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: "Error fetching patient list", error: error.message });
    }
};

export const getPatientProfile = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email, role: 'patient' });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "Patient not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updatePatientProfile = async (req, res) => {
    try {
        const { email, ...updateData } = req.body;
        const user = await User.findOneAndUpdate({ email, role: 'patient' }, updateData, { new: true });
        if (user) {
            res.json({ message: "Profile updated successfully!", user });
        } else {
            res.status(404).json({ message: "Patient not found for update" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error while updating patient profile", error: error.message });
    }
};
