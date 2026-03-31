
import mongoose from 'mongoose';

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/hospital');
        const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }, { collection: 'User' }));
        const count = await User.countDocuments();
        console.log("Total docs in 'User' collection:", count);
        
        const Vital = mongoose.model('VitalSigns', new mongoose.Schema({}, { collection: 'VitalSigns' }));
        const vCount = await Vital.countDocuments();
        console.log("Total docs in 'VitalSigns' collection:", vCount);
        
        const allUsers = await User.find({ role: 'doctor' }).limit(5);
        console.log("Doctors found:", allUsers.map(u => u.email));
        
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();
