    import mongoose from 'mongoose';

    const UserSchema = new mongoose.Schema({
        user: String,
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, default: "123456" },
        role: { type: String, required: true },
        department: String,
        experience: String,
        job_description: String,
        height_cm: Number,
        weight_kg: Number,
        age: Number,
        gender: String,
        dob: String,
        address: String,
        phone: String,
        cccd: String,
        counter: String
    }, {
        collection: 'users'
    });

    const User = mongoose.model('User', UserSchema);
export default User;