import mongoose from 'mongoose';

const MedicineSchema = new mongoose.Schema({
    medicineName: { type: String, required: true },
    dosage: String,
    form: String,
    price: { type: Number, default: 0 },
    defaultNote: String,
    suggestedDosage: {
        morning: { type: Number, default: 0 },
        noon: { type: Number, default: 0 },
        afternoon: { type: Number, default: 0 },
        evening: { type: Number, default: 0 }
    }
}, {  
    collection: 'Prescription' 
});

const Medicine = mongoose.model('Medicine', MedicineSchema);
export default Medicine;