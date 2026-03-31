import mongoose from 'mongoose';

const VitalSignsSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    patientName: { type: String },
    age: Number,
    weight: Number,
    temperature: Number,
    bloodPressure: String,
    heartRate: Number,
    respiratoryRate: Number,
    spO2: Number,
    note: String,
    recordedBy: String,
    createdAt: { type: Date, default: Date.now }
}, {
    collection: 'Vitalsign'
});

const VitalSigns = mongoose.model('VitalSigns', VitalSignsSchema);
export default VitalSigns;