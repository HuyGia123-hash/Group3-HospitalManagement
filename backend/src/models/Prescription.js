import mongoose from 'mongoose';

const PrescriptionSchema = new mongoose.Schema({
    patientId: String,
    patientName: String,
    doctorId: String,
    nurseSigns: {
        weight: Number,
        temperature: Number,
        bloodPressure: String,
        heartRate: Number,
        spO2: Number,
        note: String
    },
    symptoms: String,     
    diagnosis: String,   
    medicines: [         
        {
            medicineName: String,
            dosage: String,
            form: String,
            sang: Number,
            trua: Number,
            chieu: Number,
            toi: Number,
            days: Number,
            note: String,
            totalPrice: Number
        }
    ],
    totalOrderPrice: Number, 
    followUpDate: Date,
    createdAt: { type: Date, default: Date.now }
});

const Prescription = mongoose.model('Prescription', PrescriptionSchema);
export default Prescription;