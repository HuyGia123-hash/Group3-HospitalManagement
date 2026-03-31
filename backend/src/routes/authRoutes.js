import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import { getAllDoctors } from '../controllers/doctorController.js';

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && user.password === password) {
            res.json({
                message: "Login successful",
                user: { name: user.name, role: user.role, email: user.email }
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/profile/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.put('/update-profile', async (req, res) => {
    try {
        const { email, ...updateData } = req.body;
        const user = await User.findOneAndUpdate({ email }, updateData, { new: true });
        if (user) {
            res.json({ message: "Update successful!", user });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error while updating profile" });
    }
});

router.get('/doctors', getAllDoctors);

export default router;
