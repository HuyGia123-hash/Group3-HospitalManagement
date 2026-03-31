import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const PatientViewAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cancelModal, setCancelModal] = useState({ show: false, appointmentId: null });
  const [cancelReason, setCancelReason] = useState("");

  const [reviewModal, setReviewModal] = useState({ show: false, appointment: null });
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });

  const patientName = localStorage.getItem("userName");

  const fetchAppointments = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/patients/appointments`, {
        params: { patientName }
      });
      setAppointments(res.data);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  }, [patientName]);

  useEffect(() => {
    if (patientName) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [patientName, fetchAppointments]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please enter a cancellation reason!");
      return;
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/patients/appointments/${cancelModal.appointmentId}/cancel`, {
        cancelReason
      });
      toast.success(res.data.message);
      setCancelModal({ show: false, appointmentId: null });
      setCancelReason("");
      fetchAppointments();
    } catch (error) {
      console.error("Cancellation Error:", error);
      toast.error("Cancellation failed. Please try again!");
    }
  };

  const handleReview = async () => {
    if (!reviewData.comment.trim()) {
      toast.error("Please enter your feedback!");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/patients/reviews', {
        appointmentId: reviewModal.appointment._id || reviewModal.appointment.id,
        patientName: patientName,
        doctorName: reviewModal.appointment.doctorName,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      toast.success("Thank you for your feedback!");
      setReviewModal({ show: false, appointment: null });
      setReviewData({ rating: 5, comment: "" });
    } catch (error) {
      console.error("Review Submission Error:", error);
      toast.error("Failed to submit review.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">View and manage all your clinical visits</p>
        </div>
        <Link
          to="/patient/booking"
          className="px-5 py-2.5 bg-sky-600 text-white rounded-xl font-medium text-sm hover:bg-sky-700 transition-colors shadow-lg shadow-sky-200"
        >
          Book New Appointment
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📅</span>
          </div>
          <h2 className="font-semibold text-slate-700 mb-2">No appointments found</h2>
          <p className="text-slate-500 text-sm mb-6">You have no scheduled appointments in the system.</p>
          <Link
            to="/patient/booking"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl font-medium text-sm hover:bg-sky-700 transition-colors"
          >
            Book Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const isCancelled = ['cancelled', 'Đã hủy'].includes(apt.status);
            const isCompleted = ['completed', 'Đã khám'].includes(apt.status);
            const isApproved = apt.status === 'approved' || apt.status === 'Đã duyệt';

            let statusBadge;
            if (isCancelled) {
              statusBadge = <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider">Cancelled</span>;
            } else if (isCompleted) {
              statusBadge = <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">Completed</span>;
            } else if (isApproved) {
              statusBadge = <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">Confirmed</span>;
            } else {
              statusBadge = <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
            }

            return (
              <div key={apt._id || apt.id} className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row gap-6 md:items-center shadow-sm hover:shadow-md transition-shadow">

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-slate-800">{apt.date}</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold tracking-wider">{apt.timeSlot}</span>
                    {statusBadge}
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                       Dr: <strong>{apt.doctorName}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                       Dept: <strong>{apt.department}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                       Patient: {apt.patientName}
                    </div>
                  </div>

                  {isCancelled && apt.cancelReason && (
                    <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                      <strong>Cancellation Reason: </strong> {apt.cancelReason}
                    </div>
                  )}
                </div>

                {!isCancelled && (
                  <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-col gap-2 md:items-end justify-center">
                    {isCompleted && (
                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        <Link
                          to="/patient/history"
                          className="px-4 py-2 text-center bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all text-sm shadow-sm"
                        >
                          View Results
                        </Link>
                        <button
                          onClick={() => setReviewModal({ show: true, appointment: apt })}
                          className="px-4 py-2 text-center bg-amber-50 text-amber-600 font-medium rounded-lg hover:bg-amber-500 hover:text-white transition-colors text-sm"
                        >
                          Rate Physician
                        </button>
                      </div>
                    )}
                    {!isCompleted && (
                      <button
                        onClick={() => setCancelModal({ show: true, appointmentId: apt._id || apt.id })}
                        className="px-4 py-2 w-full md:w-auto text-center bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-500 hover:text-white transition-colors text-sm"
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {cancelModal.show && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Cancellation</h3>
            <p className="text-slate-500 text-sm mb-5">Are you sure you want to cancel this appointment? Please provide a reason below.</p>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">Cancellation Reason (*)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Personal emergency, change of schedule..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none h-24"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelModal({ show: false, appointmentId: null })}
                className="px-5 py-2 hover:bg-slate-100 text-slate-600 font-medium rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleCancel}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-red-200"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewModal.show && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Rate Physician</h3>
            <p className="text-slate-500 text-sm mb-5">Please leave a review for Dr. <strong>{reviewModal.appointment?.doctorName}</strong>.</p>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">Star Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className={`text-2xl transition-colors ${reviewData.rating >= star ? 'text-amber-400' : 'text-slate-200'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">Your Review (*)</label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                placeholder="The doctor was very attentive and professional..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all resize-none h-24"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReviewModal({ show: false, appointment: null })}
                className="px-5 py-2 hover:bg-slate-100 text-slate-600 font-medium rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleReview}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-amber-200"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientViewAppointment;
