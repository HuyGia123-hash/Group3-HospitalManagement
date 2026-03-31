import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const PatientProfile = () => {
  const [patient, setPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/patients/profile/${email}`);
        setPatient(res.data);
        setFormData(res.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    if (email) fetchProfile();
  }, [email]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put("http://localhost:5000/api/patients/update-profile", formData);
      setPatient(res.data.user);
      setIsEditing(false);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Update failed!");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-500">Loading profile information...</div>;
  if (!patient) return <div className="p-10 text-center font-bold text-red-500">Patient profile not found.</div>;

  const InfoItem = ({ icon, label, value, name, editable = true }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-transparent hover:border-sky-100 hover:bg-white transition-all">
      <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-sky-600 shadow-sm">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{label}</p>
        {isEditing && editable ? (
          <input
            type="text"
            name={name}
            value={formData[name] || ""}
            onChange={handleInputChange}
            className="w-full font-semibold text-slate-700 bg-white border-b-2 border-sky-300 focus:outline-none py-1"
          />
        ) : (
          <p className="font-semibold text-slate-700">{value || "Not updated"}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Personal Profile</h1>
          <p className="text-slate-500 mt-1">Manage and update your medical information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 shadow-lg shadow-sky-200 transition-all text-sm"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all text-sm"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="mb-4 p-4 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-center animate-bounce">
          {message}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-10 text-center bg-gradient-to-b from-sky-50 to-white border-b border-slate-100">
          <div className="w-24 h-24 rounded-full bg-white shadow-xl text-sky-600 flex items-center justify-center mx-auto mb-6 text-4xl font-black border-4 border-sky-100">
            {patient.name?.charAt(0)}
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{patient.name}</h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold mt-3 uppercase tracking-widest">
            {patient.role}
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Full Name" value={patient.name} name="name" icon={<span className="text-xl"></span>} />
          <InfoItem label="Gender" value={patient.gender} name="gender" icon={<span className="text-xl"></span>} />
          <InfoItem label="Date of Birth" value={patient.dob} name="dob" icon={<span className="text-xl"></span>} />
          <InfoItem label="Age" value={patient.age} name="age" icon={<span className="text-xl"></span>} />
          <InfoItem label="Email" value={patient.email} name="email" editable={false} icon={<span className="text-xl"></span>} />
          <InfoItem label="Phone Number" value={patient.phone} name="phone" icon={<span className="text-xl"></span>} />
          <InfoItem label="ID Card / Passport" value={patient.cccd} name="cccd" icon={<span className="text-xl"></span>} />

          <div className="md:col-span-2">
            <InfoItem label="Contact Address" value={patient.address} name="address" icon={<span className="text-xl"></span>} />
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-sm text-slate-500 font-medium">Account active and verified</p>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;

