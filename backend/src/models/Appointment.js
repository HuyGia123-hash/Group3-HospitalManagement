import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    id: String,
    patientId: Number,
    patientName: String,
    patientEmail: String,
    patientPhone: String,
    gender: String,
    age: Number,
    address: String,
    cccd: String,
    doctorId: Number,
    doctorName: String,
    department: String,
    date: String,
    session: { type: String },
    timeSlot: String,
    status: { type: String, default: 'Pending' },
    
    appointmentSource: { type: String, enum: ['patient', 'walk_in'], default: 'patient' },
    
    nurseWalkInCreatedAt: { type: Number },
    
    nurseApprovedAt: { type: Number },
    cancelReason: { type: String, default: '' },
    note: { type: String, default: '' },
    receptionistId: Number,
    receptionistName: String,
    completedAt: Date,
    lastVitalSignsId: { type: mongoose.Schema.Types.ObjectId, ref: 'VitalSigns' },
    createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) }
}, { collection: 'Patient' });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
