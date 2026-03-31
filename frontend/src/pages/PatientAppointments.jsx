import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const patientName = localStorage.getItem("userName");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/appointments?patientName=${encodeURIComponent(patientName)}`);
        setAppointments(res.data);
      } catch (err) {
        console.error("Error loading appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    if (patientName) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [patientName]);

  if (loading) {
    return <div className="text-center py-20 text-slate-400 italic">Loading appointments...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">My Appointments</h1>
        <p className="text-slate-500 text-sm mt-1">View and manage your scheduled visits</p>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 rounded bg-slate-200"></div>
          </div>
          <h2 className="font-semibold text-slate-700 mb-2">No appointments found</h2>
          <p className="text-slate-500 text-sm mb-6">
            You can book a visit via the <strong>Book Appointment</strong> section.
          </p>
          <Link
            to="/patient/booking"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl font-medium text-sm hover:bg-sky-700 transition-colors"
          >
            Book Now
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {appointments.map((apt, idx) => (
            <li
              key={idx}
              className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-wrap items-center gap-4 justify-between"
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-sky-600">📅</span>
                  <span>{apt.date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-sky-600">⏰</span>
                  <span>{apt.timeSlot}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-sky-600">🏥</span>
                  <span>{apt.department}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className="text-sky-600">👤</span>
                  <span>Dr. {apt.doctorName}</span>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100">
                {apt.status === 'pending' ? 'Waiting' : apt.status}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientAppointments;
