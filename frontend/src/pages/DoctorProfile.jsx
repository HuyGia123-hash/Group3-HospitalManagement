import React, { useState, useEffect } from "react";
import axios from 'axios';
const API_BASE_URL = 'http://localhost:5000/api/doctors';

const DoctorProfile = () => {
    const userEmail = localStorage.getItem("userEmail");
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!userEmail) return;
                const res = await axios.get(`${API_BASE_URL}/profile/${userEmail}`);
                setDoctor(res.data);
            } catch (error) {
                console.error("Lỗi lấy thông tin:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userEmail]);

    if (loading) return <div className="p-10 text-center text-slate-500">Loading profile...</div>;
    if (!doctor) return <div className="p-10 text-center text-red-500 font-bold italic">Doctor profile information not found.</div>;

    return (
        <div className="max-w-4xl mx-auto py-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Doctor Personal Profile</h1>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-8">
                <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="w-24 h-24 bg-sky-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                        {doctor.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">BS. {doctor.name}</h2>
                        <p className="text-sky-600 font-semibold">{doctor.department} | {doctor.role}</p>
                        <p className="text-slate-400 text-sm mt-1">ID: {doctor.cccd}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoRow label="Email" value={doctor.email} />
                    <InfoRow label="Gender" value={doctor.gender} />
                    <InfoRow label="Date of Birth" value={doctor.dob} />
                    <InfoRow label="Age" value={doctor.age + " years old"} />
                    <InfoRow label="Height" value={doctor.height_cm + " cm"} />
                    <InfoRow label="Weight" value={doctor.weight_kg + " kg"} />
                    <InfoRow label="Address" value={doctor.address} />
                    <InfoRow label="ID Number" value={doctor.cccd} />
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-3">Experience & Professional Summary</h3>
                    <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 space-y-4">
                        <div>
                            <span className="font-bold text-slate-500 block mb-1 uppercase text-[10px]">Work Experience:</span>
                            <p>{doctor.experience}</p>
                        </div>
                        <div>
                            <span className="font-bold text-slate-500 block mb-1 uppercase text-[10px]">Job Description:</span>
                            <p>{doctor.job_description}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center text-slate-400 text-xs italic">
                Doctor Information Management System - MED SYSTEM
            </div>
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <div className="flex border-b border-slate-50 py-3 last:border-0 hover:bg-slate-50/50 transition-colors px-2 rounded-lg">
        <span className="w-1/3 text-slate-500 font-medium text-sm">{label}:</span>
        <span className="w-2/3 text-slate-800 font-bold text-sm">{value || "N/A"}</span>
    </div>
);

export default DoctorProfile;
