import mongoose from 'mongoose';

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
    try {
        await mongoose.connect('mongodb://localhost:27017/hospital');
        console.log("Connected to MongoDB");

        const doctor = await User.findOne({ email: 'doctor_nt1@gmail.com' });
        console.log("Logged-in Doctor User:", JSON.stringify(doctor, null, 2));

        if (doctor) {
            console.log(`Searching for reviews with bac_si: "${doctor.name}" or doctorEmail: "doctor_nt1@gmail.com"`);
            const reviews = await Review.find({
                $or: [
                    { doctorEmail: 'doctor_nt1@gmail.com' },
                    { bac_si: doctor.name }
                ]
            });
            console.log(`Found ${reviews.length} reviews for this doctor.`);
            if (reviews.length > 0) {
                console.log("Sample Review:", JSON.stringify(reviews[0], null, 2));
            }
        } else {
            console.log("Doctor user doctor_nt1@gmail.com was not found in the users collection.");
            const allUsers = await User.find({ role: 'doctor' }).limit(5);
            console.log("Sample Doctors in DB:", JSON.stringify(allUsers, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();
