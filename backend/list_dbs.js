
import mongoose from 'mongoose';

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/admin');
        const admin = mongoose.connection.useDb('admin');
        const dbs = await admin.db.admin().listDatabases();
        console.log("Databases:", dbs.databases.map(db => db.name));
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();
