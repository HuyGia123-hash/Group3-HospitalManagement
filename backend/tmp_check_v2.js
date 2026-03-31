import mongoose from 'mongoose';
import fs from 'fs';

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
}, { collection: 'users' });

const ReviewSchema = new mongoose.Schema({
    bac_si: String,
    doctorEmail: String,
    doctorName: String,
    rating: Number,
    comment: String,
    sao: Number,
    binh_luan: String
}, { collection: 'review' });

const User = mongoose.model('User', UserSchema);
const Review = mongoose.model('Review', ReviewSchema);

async function check() {
    let output = "";
    try {
        await mongoose.connect('mongodb://localhost:27017/hospital');
        output += "Connected to MongoDB\n";

        const doctor = await User.findOne({ email: 'doctor_nt1@gmail.com' });
        output += "Logged-in Doctor User: " + JSON.stringify(doctor, null, 2) + "\n";

        if (doctor) {
            output += `Searching for reviews with bac_si: "${doctor.name}" or doctorEmail: "doctor_nt1@gmail.com"\n`;
            const reviews = await Review.find({
                $or: [
                    { doctorEmail: 'doctor_nt1@gmail.com' },
                    { bac_si: doctor.name }
                ]
            });
            output += `Found ${reviews.length} reviews for this doctor.\n`;
            if (reviews.length > 0) {
                output += "Sample Review: " + JSON.stringify(reviews[0], null, 2) + "\n";
            }
        } else {
            output += "Doctor user doctor_nt1@gmail.com was not found in the users collection.\n";
            const allUsers = await User.find({ role: 'doctor' }).limit(5);
            output += "Sample Doctors in DB: " + JSON.stringify(allUsers, null, 2) + "\n";
        }

        fs.writeFileSync('diag_output.txt', output);
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('diag_output.txt', "Error: " + err.message);
        process.exit(1);
    }
}

check();
