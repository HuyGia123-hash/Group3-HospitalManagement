import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  historyId: { type: String },
  patientName: { type: String, required: true },
  date: { type: String, required: true },
  diagnosis: { type: String, required: true },
  doctorName: { type: String, required: true },
  vitals: {
    weight: Number,
    temperature: Number,
    bloodPressure: String,
    heartRate: Number,
    spO2: Number,
    nurseNote: String,
    recordedBy: String,
    recordedAt: Date
  },
  symptoms: String,
  prescription: [
    {
      medicineName: String,
      dosage: String,
      form: String,
      sang: Number,
      trua: Number,
      chieu: Number,
      toi: Number,
      days: Number,
      note: String
    }
  ]
}, {
  collection: 'History',
  timestamps: true
});

const History = mongoose.model('History', historySchema);
export default History;