import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  doctorEmail: { type: String },
  doctorName: { type: String, required: true },
  reviewerEmail: { type: String },
  reviewerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  reply: { type: String },
  repliedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'review' });

const Review = mongoose.model('Review', reviewSchema);
export default Review;