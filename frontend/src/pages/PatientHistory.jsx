import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const PatientHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [reviewingRecordId, setReviewingRecordId] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [reviewedIds, setReviewedIds] = useState(() => {
        try { return JSON.parse(localStorage.getItem("reviewedAppointments")) || []; }
        catch { return []; }
    });

    const patientName = localStorage.getItem("userName") || "";
    const userEmail = localStorage.getItem("userEmail") || "";

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/patients/history?patientName=${encodeURIComponent(patientName)}`);
                setHistory(res.data);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [patientName]);

    const handleOpenReview = (record) => {
        setSelectedDoc(record.doctorName || record.bac_si);
        setReviewingRecordId(record._id);
        setShowReviewModal(true);
        setRating(5);
        setComment("");
    };

    const handleSubmitReview = async () => {
        if (!comment.trim()) {
            toast.error("Please enter a comment.");
            return;
        }

        try {
            setSubmitting(true);
            await axios.post('http://localhost:5000/api/patients/reviews', {
                doctorName: selectedDoc,
                reviewerName: patientName,
                reviewerEmail: userEmail,
                rating: rating,
                comment: comment
            });

            if (reviewingRecordId) {
                const newReviewed = [...reviewedIds, reviewingRecordId];
                setReviewedIds(newReviewed);
                localStorage.setItem("reviewedAppointments", JSON.stringify(newReviewed));
            }

            toast.success("Thank you for your feedback!");
            setShowReviewModal(false);
        } catch (error) {
            console.error("Review Error:", error);
            toast.error("Could not submit review at this time.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading consultation history...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8 border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Personal Consultation History</h1>
                <p className="text-slate-500 text-sm mt-1">Detailed information about your past visits and treatments.</p>
            </div>

            {history.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-lg">
                    <p className="text-slate-400 italic">No consultation history records found.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {history.map((record, index) => (
                        <div key={record._id || index} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-200">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-slate-700">DATE: {record.date || record.ngay}</span>
                                    <span className="h-4 w-px bg-slate-300"></span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">Dr: {record.doctorName || record.bac_si}</span>
                                        {reviewedIds.includes(record._id) ? (
                                            <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-bold uppercase cursor-not-allowed">
                                                Reviewed
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleOpenReview(record)}
                                                className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700 transition-colors font-bold uppercase"
                                            >
                                                Rate & Review
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 border border-slate-200 rounded">ID: {record._id?.substring(record._id.length - 8).toUpperCase()}</span>
                            </div>

                            <div className="p-5">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1 border-r border-slate-100 pr-4">
                                        <h4 className="text-[11px] font-bold text-blue-600 uppercase mb-3 border-b border-blue-50 pb-1">1. Vital Signs (Nurse)</h4>
                                        {record.vitals ? (
                                            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                                                <div className="flex flex-col"><span className="text-slate-400 text-[10px]">Temperature</span><span className="font-semibold">{record.vitals.temperature}°C</span></div>
                                                <div className="flex flex-col"><span className="text-slate-400 text-[10px]">Blood Pressure</span><span className="font-semibold">{record.vitals.bloodPressure}</span></div>
                                                <div className="flex flex-col"><span className="text-slate-400 text-[10px]">Heart Rate</span><span className="font-semibold">{record.vitals.heartRate} bpm</span></div>
                                                <div className="flex flex-col"><span className="text-slate-400 text-[10px]">Weight</span><span className="font-semibold">{record.vitals.weight} kg</span></div>
                                                <div className="flex flex-col col-span-2"><span className="text-slate-400 text-[10px]">SpO2</span><span className="font-semibold">{record.vitals.spO2}%</span></div>
                                                {record.vitals.nurseNote && (
                                                    <div className="col-span-2 mt-1">
                                                        <span className="text-slate-400 text-[10px]">Note:</span>
                                                        <p className="italic text-slate-600 leading-tight">"{record.vitals.nurseNote}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-slate-400 italic">No nurse vitals recorded.</p>
                                        )}
                                    </div>

                                    <div className="lg:col-span-2 space-y-5">
                                        <div>
                                            <h4 className="text-[11px] font-bold text-slate-700 uppercase mb-2 border-b border-slate-100 pb-1">2. Physician Diagnosis</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Symptoms:</p>
                                                    <p className="text-xs text-slate-700 leading-relaxed">{record.symptoms || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Diagnosis:</p>
                                                    <p className="text-xs font-bold text-slate-900 leading-relaxed">{record.diagnosis || record.chan_doan}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {(record.prescription || record.toa_thuoc) && (record.prescription || record.toa_thuoc).length > 0 && (
                                            <div>
                                                <h4 className="text-[11px] font-bold text-slate-700 uppercase mb-2 border-b border-slate-100 pb-1">3. Issued Prescription</h4>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-xs border border-slate-200">
                                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                                                            <tr>
                                                                <th className="px-3 py-2 border-r border-slate-200">Medicine Name</th>
                                                                <th className="px-3 py-2 border-r border-slate-200 text-center">Dosage (M-N-A-E)</th>
                                                                <th className="px-3 py-2 border-r border-slate-200 text-center">Days</th>
                                                                <th className="px-3 py-2">Notes</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {(record.prescription || record.toa_thuoc).map((med, midx) => (
                                                                <tr key={midx} className="hover:bg-slate-50/50">
                                                                    <td className="px-3 py-2 font-bold text-slate-800 border-r border-slate-200">{med.medicineName || med.tenThuoc}</td>
                                                                    <td className="px-3 py-2 text-center border-r border-slate-200 font-mono text-[10px]">
                                                                        {med.morning || med.sang} - {med.noon || med.trua} - {med.afternoon || med.chieu} - {med.evening || med.toi}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-center border-r border-slate-200">{med.days}</td>
                                                                    <td className="px-3 py-2 text-slate-500 italic text-[11px]">{med.note || med.ghiChu || "-"}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showReviewModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800">Rate Physician</h2>
                            <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-4">You are rating Dr.: <span className="font-bold text-slate-800">{selectedDoc}</span></p>

                            <div className="mb-6">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-3">Satisfaction Level (1-5 stars):</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => setRating(num)}
                                            className="focus:outline-none transition-transform hover:scale-110 active:scale-90"
                                            title={`${num} Stars`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`w-10 h-10 transition-colors ${rating >= num ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200'}`}
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Your Review:</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded focus:border-blue-500 outline-none text-sm min-h-[100px] shadow-sm resize-none"
                                    placeholder="Share your clinical experience here..."
                                ></textarea>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex-1 py-2 border border-slate-300 rounded font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={submitting}
                                    className={`flex-1 py-2 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {submitting ? "Submitting..." : "Submit Review"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientHistory;
