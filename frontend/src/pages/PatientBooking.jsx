import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const PatientBooking = () => {
  const [formData, setFormData] = useState({ date: "", department: "", doctorName: "", timeSlot: "" });
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [bookedSlots, setBookedSlots] = useState({});
  const [debugInfo, setDebugInfo] = useState(null);
  const [myBookedSlots, setMyBookedSlots] = useState({});
  const [showDoctorInfo, setShowDoctorInfo] = useState(false);

  const patientName = localStorage.getItem("userName") || "Anonymous Patient";
  const userEmail = localStorage.getItem("userEmail") || "";

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/patients/doctors");
        setDoctors(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (formData.date && formData.doctorName) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/patients/appointments/availability?date=${encodeURIComponent(formData.date)}&doctorName=${encodeURIComponent(formData.doctorName)}&t=${Date.now()}`
          );
          setBookedSlots(res.data.bookedCounts || {});
          setDebugInfo(res.data.debug || null);
        } catch (error) {
          console.error(error);
        }
      } else {
        setBookedSlots({});
      }
    };
    fetchAvailability();
  }, [formData.date, formData.doctorName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "department") {
      setFormData({ ...formData, [name]: value, doctorName: "", timeSlot: "" });
      setBookedSlots({});
    } else if (name === "doctorName" || name === "date") {
      setFormData({ ...formData, [name]: value, timeSlot: "" });
      setBookedSlots({});
      setDebugInfo(null);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTimeSlot = (time, isFull) => {
    if (isFull) {
      toast.error("This time slot is fully booked.");
      return;
    }
    setFormData({ ...formData, timeSlot: time });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.department || !formData.doctorName || !formData.timeSlot) {
      toast.error("Please fill in all information!");
      return;
    }

    setLoading(true);
    try {
      const startHour = parseInt(String(formData.timeSlot || '').split(':')[0], 10);
      const session = Number.isNaN(startHour) ? 'Morning' : startHour < 12 ? 'Morning' : 'Afternoon';
      const newApt = { ...formData, patientName, patientEmail: userEmail, session };
      await axios.post("http://localhost:5000/api/patients/appointments", newApt);
      
      setMyBookedSlots((prev) => ({
        ...prev,
        [`${formData.date}_${formData.doctorName}`]: [...(prev[`${formData.date}_${formData.doctorName}`] || []), formData.timeSlot],
      }));

      toast.success("Booking successful!");
      setFormData({ date: "", department: "", doctorName: "", timeSlot: "" });

      if (formData.date && formData.doctorName) {
        const res = await axios.get(
          `http://localhost:5000/api/patients/appointments/availability?date=${encodeURIComponent(formData.date)}&doctorName=${encodeURIComponent(formData.doctorName)}&t=${Date.now()}`
        );
        setBookedSlots(res.data.bookedCounts || {});
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed!");
    } finally {
      setLoading(false);
    }
  };

  const uniqueDepartments = [...new Set(doctors.map((d) => d.department).filter(Boolean))];
  const filteredDoctors = formData.department ? doctors.filter(d => d.department === formData.department) : doctors;
  const todayString = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-lg mx-auto pb-12">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Book Appointment</h1>
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Appointment Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} min={todayString} className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-sky-500" required />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Department</label>
            <select name="department" value={formData.department} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-sky-500 bg-white" required>
              <option value="">Select Department</option>
              {uniqueDepartments.map((dept, idx) => <option key={idx} value={dept}>{dept}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Physician</label>
            <select name="doctorName" value={formData.doctorName} onChange={handleChange} disabled={!formData.department} className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-sky-500 bg-white disabled:bg-slate-100 disabled:text-slate-400" required>
              <option value="">Select Physician</option>
              {filteredDoctors.map((doc, idx) => <option key={idx} value={doc.name}>Dr. {doc.name}</option>)}
            </select>
            {formData.doctorName && (() => {
              const doc = doctors.find(d => d.name === formData.doctorName);
              if (!doc) return null;
              return (
                <div className="mt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowDoctorInfo(!showDoctorInfo)} 
                    className="text-sky-600 text-sm font-semibold hover:underline mb-2"
                  >
                    {showDoctorInfo ? "Hide physician info" : "View physician info"}
                  </button>
                  {showDoctorInfo && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                      <p className="font-bold text-slate-800 text-sm mb-1">👨‍⚕️ Dr. {doc.name}</p>
                      <p>Department: <span className="font-semibold text-slate-700">{doc.department}</span></p>
                      <p>Experience: <span className="font-semibold text-slate-700">{doc.experience || "No data available"}</span></p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Time Slot</label>
            <div className="grid grid-cols-2 gap-3">
              {["07:00 - 08:00", "09:00 - 10:00", "13:00 - 15:00", "16:00 - 18:00"].map(time => {
                const count = bookedSlots[time] || 0;
                const isFull = count >= 1;
                

                const now = new Date();
                const currentTime = now.getHours() * 60 + now.getMinutes();
                const [startTime, endTime] = time.split(" - ");
                const [endHour, endMinute] = endTime.split(":").map(Number);
                const slotEndTimeInMinutes = endHour * 60 + endMinute;
                
                const isPassed = formData.date === todayString && currentTime > slotEndTimeInMinutes;
                
                const iBookedThis = (myBookedSlots[`${formData.date}_${formData.doctorName}`] || []).includes(time);
                

                const isDisabled = isPassed || isFull || iBookedThis;

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => !isDisabled && handleTimeSlot(time, isFull)}
                    disabled={isDisabled}
                    className={`p-2.5 rounded-lg border text-sm font-medium transition-colors ${isDisabled
                      ? "border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed"
                      : formData.timeSlot === time
                        ? "border-sky-500 bg-sky-50 text-sky-700"
                        : "border-slate-200 text-slate-700 hover:border-sky-300"
                      }`}
                  >
                    {time} {isPassed ? "(Passed)" : iBookedThis ? "(Your booking)" : isFull ? "(Full)" : ""}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-sky-600 disabled:bg-slate-400 text-white rounded-lg font-semibold mt-4 hover:bg-sky-700 transition-colors">
            {loading ? "Processing..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientBooking;
