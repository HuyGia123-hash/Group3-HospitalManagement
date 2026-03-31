import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import medicineRoutes from './src/routes/medicineRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import vitalRoutes from './src/routes/vitalRoutes.js';
import nurseRoutes from './src/routes/nurseRoutes.js';
import appointmentRoutes from './src/routes/appointmentRoutes.js';
import historyRoutes from './src/routes/historyRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import doctorRoutes from './src/routes/doctorRoutes.js';
import patientRoutes from './src/routes/patientRoutes.js';
import startAutoCancelTask from './src/utils/tu_dong_huy_lich.js';

const app = express();

startAutoCancelTask();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[SERVER REQUEST] ${req.method} ${req.originalUrl}`);
    next();
});

mongoose.connect('mongodb://localhost:27017/hospital')
  .then(() => console.log("Đã kết nối MongoDB thành công: database hospital"))
  .catch(err => console.error("Lỗi kết nối MongoDB:", err));

app.use('/api/medicines', medicineRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vitals', vitalRoutes);
app.use('/api/nurse', nurseRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server đang chạy tại port ${PORT}`));