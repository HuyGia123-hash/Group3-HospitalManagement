import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
const API_BASE_URL = 'http://localhost:5000/api/doctors';
import { toast } from "react-toastify";

const DoctorReview = () => {
    const userEmail = localStorage.getItem("userEmail");
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState({});

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/reviews?doctorEmail=${encodeURIComponent(userEmail)}`);
            setReviews(res.data);
        } catch (error) {
            console.error("Lỗi lấy đánh giá:", error);
        } finally {
            setLoading(false);
        }
    }, [userEmail]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleReply = async (reviewId) => {
        const text = replyText[reviewId];
        if (!text || !text.trim()) {
            toast.error("Vui lòng nhập nội dung phản hồi.");
            return;
        }

        try {
            await axios.put(`${API_BASE_URL}/reviews/${reviewId}/reply`, { reply: text });
            toast.success("Reply sent successfully!");
            setReplyText({ ...replyText, [reviewId]: "" });
            fetchReviews();
        } catch (error) {
            console.error("Lỗi phản hồi:", error);
            toast.error("Không thể gửi phản hồi.");
        }
    };

    const handleTextChange = (id, value) => {
        setReplyText({
            ...replyText,
            [id]: value
        });
    };

    return (
        <div className="max-w-4xl mx-auto py-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Patient Reviews</h1>

            {loading ? (
                <div className="text-center py-10 text-slate-500 italic">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-10 bg-white border border-slate-200 rounded-xl text-slate-400">
                    No patient reviews yet.
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((rev) => (
                        <div key={rev._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Anonymous Patient</h3>
                                    <div className="flex items-center gap-1 text-amber-500 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i}>{i < rev.rating ? "★" : "☆"}</span>
                                        ))}
                                        <span className="text-xs text-slate-400 ml-2 font-medium">
                                            {new Date(rev.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-600 bg-slate-50 p-4 rounded-xl italic mb-6">
                                "{rev.comment}"
                            </p>

                            {rev.reply ? (
                                <div className="border-t border-slate-100 pt-4">
                                    <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                                        <p className="text-[10px] uppercase font-black text-sky-600 mb-2 tracking-widest">Your Response:</p>
                                        <p className="text-sm text-slate-700 font-medium">{rev.reply}</p>
                                        <p className="text-[10px] text-slate-400 mt-2 italic">
                                            {new Date(rev.repliedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-t border-slate-100 pt-4">
                                    <label className="text-[10px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Reply to Patient:</label>
                                    <div className="flex gap-3">
                                        <textarea
                                            value={replyText[rev._id] || ""}
                                            onChange={(e) => handleTextChange(rev._id, e.target.value)}
                                            placeholder="Enter your gratitude or answers here..."
                                            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-100 transition-all resize-none"
                                            rows="2"
                                        ></textarea>
                                        <button
                                            onClick={() => handleReply(rev._id)}
                                            className="bg-sky-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-sky-700 transition-colors self-end"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorReview;
