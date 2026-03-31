import Review from '../models/Review.js';
import User from '../models/User.js';

export const getReviews = async (req, res) => {
    try {
        const { doctorEmail, doctorName } = req.query;
        let query = {};

        if (doctorEmail) {
            const user = await User.findOne({ email: doctorEmail });
            if (user) {
                const nameRegex = new RegExp(`^${user.name.trim()}$`, 'i');
                query = { $or: [{ doctorEmail }, { doctorName: nameRegex }] };
            } else {
                query = { doctorEmail };
            }
        } else if (doctorName) {
            const nameRegex = new RegExp(`^${doctorName.trim()}$`, 'i');
            query = { doctorName: nameRegex };
        }

        const reviews = await Review.find(query).sort({ createdAt: -1 });

        const mappedReviews = reviews.map(r => {
            const doc = r._doc || r;
            return {
                ...doc,
                rating: doc.rating || 0,
                comment: doc.comment || "No comment",
                doctorName: doc.doctorName || "Doctor",
                reviewerName: "Anonymous Patient",
                createdAt: doc.createdAt || new Date()
            };
        });

        res.json(mappedReviews);
    } catch (error) {
        console.error("Review API error:", error);
        res.status(500).json({ message: "Server error while fetching reviews" });
    }
};

export const createReview = async (req, res) => {
    try {
        const newReview = new Review({
            doctorEmail: req.body.doctorEmail,
            doctorName: req.body.doctorName,
            reviewerEmail: req.body.reviewerEmail,
            reviewerName: req.body.reviewerName,
            rating: req.body.rating,
            comment: req.body.comment
        });
        await newReview.save();
        res.status(201).json({ message: "Review submitted successfully", review: newReview });
    } catch (error) {
        res.status(500).json({ message: "Error saving review", error: error.message });
    }
};

export const replyReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;

        const updatedReview = await Review.findByIdAndUpdate(
            id,
            { reply, repliedAt: new Date() },
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ message: "Review not found" });
        }

        res.json({ message: "Reply submitted successfully", review: updatedReview });
    } catch (error) {
        res.status(500).json({ message: "Error replying to review", error: error.message });
    }
};
