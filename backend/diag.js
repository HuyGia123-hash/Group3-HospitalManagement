
import mongoose from 'mongoose';

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/hospital');
        console.log("Connected to hospital");
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
        
        const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }, { collection: 'users' }));
        const doctorCount = await User.countDocuments({ role: 'doctor' });
        console.log("Doctor count in 'users' collection:", doctorCount);
        
        const allUsers = await User.find({ role: 'doctor' }).limit(5);
        console.log("Sample doctors:", allUsers.map(u => u.email));
        
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();
