import React from "react";
import { Link } from "react-router-dom";

const PatientHome = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome, <span className="text-sky-600">Patient</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Choose one of the options below to book or view your appointments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        <Link
          to="/patient/booking"
          className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all group"
        >
          <div className="p-3 rounded-xl bg-sky-100 text-sky-600 group-hover:bg-sky-200 transition-colors">
            <div className="w-7 h-7"></div>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-800">Book Appointment</h2>
            <p className="text-sm text-slate-500">Schedule a visit with a physician</p>
          </div>
          <div className="w-5 h-5 text-slate-300 transition-all group-hover:text-sky-500 group-hover:translate-x-1"></div>
        </Link>

        <Link
          to="/patient/appointments"
          className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all group"
        >
          <div className="p-3 rounded-xl bg-sky-100 text-sky-600 group-hover:bg-sky-200 transition-colors">
            <div className="w-7 h-7"></div>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-800">View Appointments</h2>
            <p className="text-sm text-slate-500">View your scheduled visits</p>
          </div>
          <div className="w-5 h-5 text-slate-300 transition-all group-hover:text-sky-500 group-hover:translate-x-1"></div>
        </Link>

        <Link
          to="/patient/history"
          className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group lg:col-span-2"
        >
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 transition-colors">
            <div className="w-7 h-7 flex items-center justify-center font-bold">📋</div>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-800">Medical History</h2>
            <p className="text-sm text-slate-500">Review clinical results, vitals, and prescriptions</p>
          </div>
          <div className="w-5 h-5 text-slate-300 transition-all group-hover:text-emerald-500 group-hover:translate-x-1"></div>
        </Link>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
          <span>⚠️</span> Important Visitation Notes
        </h3>
        <ul className="space-y-3 text-amber-900/80 text-sm">
          <li className="flex items-start gap-3">
            <span className="text-amber-500 mt-0.5">📌</span>
            <p><strong>Bring ID Card/Passport:</strong> A national ID card or photo identification is mandatory for check-in procedures.</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-500 mt-0.5">📂</span>
            <p><strong>Medical Documents:</strong> Please prepare your health insurance card, previous medical records, test results, and recent prescriptions.</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-500 mt-0.5">💰</span>
            <p><strong>Protect Personal Belongings:</strong> The hospital is a public area; please secure your valuables, money, and mobile phone carefully.</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PatientHome;
