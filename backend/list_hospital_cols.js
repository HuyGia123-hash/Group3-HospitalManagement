
import mongoose from 'mongoose';

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/hospital');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections in 'hospital' DB:", collections.map(c => c.name));
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();
