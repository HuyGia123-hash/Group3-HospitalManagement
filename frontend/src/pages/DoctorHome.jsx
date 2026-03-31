import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
const API_BASE_URL = 'http://localhost:5000/api/doctors';

const DoctorHome = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState("today");
    const [customDate, setCustomDate] = useState(new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const [activeTab, setActiveTab] = useState("active");
    const [doctorName] = useState(localStorage.getItem("userName") || "");

    const [selectedPatient, setSelectedPatient] = useState("");
    const [patientHistory, setPatientHistory] = useState([]);
    const [historyModal, setHistoryModal] = useState(false);

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/schedule?doctorName=${encodeURIComponent(doctorName)}`);
            setAppointments(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load schedule.");
        } finally {
            setLoading(false);
        }
    }, [doctorName]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const fetchPatientHistory = async (patientName) => {
        try {
            setSelectedPatient(patientName);
            const res = await axios.get(`${API_BASE_URL}/patient-history?patientName=${encodeURIComponent(patientName)}`);
            setPatientHistory(res.data);
            setHistoryModal(true);
        } catch (error) {
            console.error("History Error:", error);
            toast.error("Failed to retrieve patient history.");
        }
    };

    const formatFullDate = (dateStr) => {
        if (!dateStr) return "N/A";
        const d = new Date(dateStr);
        return d.toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
    
    const filtered = appointments.filter(apt => {
        if (filterDate === "today") {
            if (apt.date !== todayStr) return false;
        } else if (filterDate === "custom") {
            if (apt.date !== customDate) return false;
        }
        
        const status = apt.displayStatus || apt.status;
        const isHistory = ['Đã khám', 'Đã hủy', 'completed', 'cancelled'].includes(status);
        
        if (activeTab === "active") {
            if (status !== "Khám bệnh") return false;
        } else {
            if (!isHistory) return false;
        }
        
        return true;
    });

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Consultation Schedule</h1>
                    <p className="text-slate-500 text-sm mt-1">Welcome Dr. <span className="text-sky-600 font-bold">{doctorName}</span>. Manage your patient list below.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button 
                            onClick={() => setFilterDate("today")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterDate === 'today' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Today
                        </button>
                        <button 
                            onClick={() => setFilterDate("all")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterDate === 'all' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            All
                        </button>
                    </div>
                    
                    <div className={`flex items-center gap-2 p-1 rounded-xl border transition-all ${filterDate === 'custom' ? 'bg-sky-50 border-sky-200' : 'bg-slate-100 border-slate-200'}`}>
                        <input 
                            type="date" 
                            className="bg-transparent text-xs font-bold text-slate-700 outline-none px-2 py-1"
                            value={customDate}
                            onChange={(e) => {
                                setCustomDate(e.target.value);
                                setFilterDate("custom");
                            }}
                        />
                    </div>

                    <button
                        onClick={fetchDashboard}
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
                        title="Làm mới"
                    >
                        Làm mới
                    </button>
                </div>
            </div>

            <div className="flex gap-1 mb-6 border-b border-slate-200">
                <button 
                    onClick={() => setActiveTab("active")}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'active' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Waiting List
                </button>
                <button 
                    onClick={() => setActiveTab("history")}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'history' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    History (Completed/Cancelled)
                </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm mb-8">
                <h3 className="text-lg font-bold text-amber-800 mb-2 flex items-center gap-2">
                    Hệ thống quản lý lịch thông minh
                </h3>
                <ul className="list-disc pl-5 text-amber-900/80 text-sm space-y-1">
                    <li>Lịch Sáng: Tự động hủy bệnh nhân không đến khám lúc <strong>12:00</strong>.</li>
                    <li>Lịch Chiều: Tự động hủy bệnh nhân không đến khám lúc <strong>21:00</strong>.</li>
                </ul>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500 italic">Đang tải lịch khám...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center">
                    <span className="text-4xl mb-4 opacity-20">📋</span>
                    <p className="text-slate-400 italic">Không có bệnh nhân nào trong danh sách này.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b-2 border-slate-100">
                            <tr className="text-xs uppercase text-slate-500 font-bold">
                                <th className="p-4">Date</th>
                                <th className="p-4">Time Slot</th>
                                <th className="p-4">Patient</th>
                                <th className="p-4">Records</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((apt, idx) => {
                                let badgeColor = "bg-slate-100 text-slate-600";
                                let buttonColor = "bg-slate-200 text-slate-400 cursor-not-allowed";
                                let canExamine = false;

                                let status = apt.displayStatus || apt.status;

                                if (apt.date > todayStr && (status === "Chưa thể khám được" || status === "pending" || !status)) {
                                    status = "Khám bệnh";
                                }

                                if (status === "Cancelled") {
                                    badgeColor = "bg-red-100 text-red-600";
                                    buttonColor = "bg-red-500 text-white cursor-not-allowed";
                                } else if (status === "Completed") {
                                    badgeColor = "bg-emerald-100 text-emerald-600 font-black";
                                    buttonColor = "bg-emerald-700 text-white cursor-not-allowed";
                                } else if (status === "In Progress") {
                                    badgeColor = "bg-sky-100 text-sky-600";
                                    buttonColor = "bg-sky-600 text-white hover:bg-sky-700 shadow-lg active:scale-95 transition-all";
                                    canExamine = true;
                                } else if (status === "Not Available") {
                                    badgeColor = "bg-slate-100 text-slate-400";
                                    buttonColor = "bg-slate-200 text-slate-400 cursor-not-allowed";
                                }

                                return (
                                    <tr key={apt._id || idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-bold text-slate-700">{apt.date}</td>
                                        <td className="p-4 text-sm text-slate-600">
                                            [{apt.timeSlot && parseInt(apt.timeSlot.split(':')[0]) < 12 ? 'Sáng' : 'Chiều'}]
                                            <br />
                                            {apt.timeSlot}
                                        </td>
                                        <td className="p-4 text-sm font-semibold text-slate-800">{apt.patientName}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => fetchPatientHistory(apt.patientName)}
                                                className="text-xs font-bold text-sky-600 hover:scale-105 transition-transform flex items-center gap-1 bg-sky-50 px-2 py-1 rounded-lg border border-sky-100"
                                            >
                                                Xem bệnh án
                                            </button>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${badgeColor}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                disabled={!canExamine}
                                                onClick={() => canExamine && navigate(`/doctor/examine/${apt._id || apt.id}`)}
                                                className={`px-8 py-2 font-black rounded-xl text-xs uppercase tracking-tighter shadow-sm transition-all ${buttonColor}`}
                                            >
                                                {status === "Khám bệnh" ? "Khám bệnh" : status === "Đã khám" ? "Đã khám" : status === "Đã hủy" ? "Đã hủy" : "Chưa thể khám"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            {historyModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Lịch sử khám bệnh</h3>
                                <p className="text-sm text-slate-500">Bệnh nhân: <span className="font-bold text-sky-600">{selectedPatient}</span></p>
                            </div>
                            <button onClick={() => setHistoryModal(false)} className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {patientHistory.length === 0 ? (
                                <p className="text-center py-10 text-slate-400 italic">Chưa có dữ liệu lịch sử khám bệnh.</p>
                            ) : (
                                patientHistory.map((record, idx) => (
                                    <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                                            <span className="font-bold text-slate-700">Ngày: {record.ngay}</span>
                                            <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-lg font-bold">BS: {record.bac_si}</span>
                                        </div>
                                        <div className="p-4 space-y-6">
                                            {record.vitals ? (
                                                <div className="bg-sky-50/20 p-5 rounded-3xl border border-sky-100/50">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-1">Sinh hiệu (Y tá)</h4>
                                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Ngày ghi: {formatFullDate(record.vitals.recordedAt || record.createdAt)}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[8px] font-black text-slate-400 uppercase block">Người ghi:</span>
                                                            <span className="text-[10px] font-black text-slate-700">{record.vitals.recordedBy || "Y tá"}</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                        <div className="p-2.5 bg-white rounded-2xl border border-sky-50 shadow-sm">
                                                            <span className="text-[8px] text-slate-400 font-black uppercase block mb-0.5">Nhiệt độ</span>
                                                            <p className="text-xs font-black text-slate-700">{record.vitals.temperature || "--"} °C</p>
                                                        </div>
                                                        <div className="p-2.5 bg-white rounded-2xl border border-sky-50 shadow-sm">
                                                            <span className="text-[8px] text-slate-400 font-black uppercase block mb-0.5">Huyết áp</span>
                                                            <p className="text-xs font-black text-slate-700">{record.vitals.bloodPressure || "--"}</p>
                                                        </div>
                                                        <div className="p-2.5 bg-white rounded-2xl border border-sky-50 shadow-sm">
                                                            <span className="text-[8px] text-slate-400 font-black uppercase block mb-0.5">Mạch</span>
                                                            <p className="text-xs font-black text-slate-700">{record.vitals.heartRate || "--"} bpm</p>
                                                        </div>
                                                        <div className="p-2.5 bg-white rounded-2xl border border-sky-50 shadow-sm">
                                                            <span className="text-[8px] text-slate-400 font-black uppercase block mb-0.5">Cân nặng</span>
                                                            <p className="text-xs font-black text-slate-700">{record.vitals.weight || "--"} kg</p>
                                                        </div>
                                                        <div className="p-2.5 bg-sky-50/50 rounded-2xl border border-sky-100 shadow-sm">
                                                            <span className="text-[8px] text-sky-400 font-black uppercase block mb-0.5">SpO2</span>
                                                            <p className="text-xs font-black text-sky-600">{record.vitals.spO2 || "--"} %</p>
                                                        </div>
                                                    </div>

                                                    {record.vitals.nurseNote && (
                                                        <div className="bg-white/50 p-2.5 rounded-2xl border border-sky-50 mt-4">
                                                            <span className="text-[8px] font-black text-slate-300 uppercase block mb-0.5">Ghi chú y tá:</span>
                                                            <p className="text-[10px] text-slate-500 italic">"{record.vitals.nurseNote}"</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 text-center">
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Không có dữ liệu y tá</p>
                                                </div>
                                            )}
                                            <div className="bg-emerald-50/10 p-5 rounded-3xl border border-emerald-100/50">
                                                <div className="flex justify-between items-start mb-5">
                                                    <div>
                                                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Kết quả khám bệnh (Bác sĩ)</h4>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Hoàn tất: {formatFullDate(record.createdAt)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase block">Bác sĩ khám:</span>
                                                        <span className="text-[10px] font-black text-slate-800">BS. {record.bac_si}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase block px-1">Triệu chứng:</span>
                                                        <p className="text-xs text-slate-700 bg-white p-3 rounded-2xl border border-slate-100 italic min-h-[50px]">"{record.symptoms || "N/A"}"</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] font-black text-emerald-600 uppercase block px-1">Chẩn đoán:</span>
                                                        <p className="text-xs text-slate-800 font-black bg-white p-3 rounded-2xl border border-emerald-100 min-h-[50px]">{record.chan_doan}</p>
                                                    </div>
                                                </div>

                                                {record.toa_thuoc && record.toa_thuoc.length > 0 && (
                                                    <div className="mt-4">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase block mb-2 px-1">Toa thuốc dặn dò:</span>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {record.toa_thuoc.map((med, midx) => (
                                                                <div key={midx} className="flex items-center justify-between p-3 bg-white border border-slate-50 rounded-2xl shadow-sm hover:border-emerald-100 transition-colors">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-black">
                                                                            {midx + 1}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-black text-slate-800">{med.tenThuoc}</p>
                                                                            <p className="text-[9px] text-slate-400 uppercase font-black">{med.sang}-{med.trua}-{med.chieu}-{med.toi} · {med.days} ngày</p>
                                                                        </div>
                                                                    </div>
                                                                    {med.ghiChu && (
                                                                        <div className="text-right max-w-[150px]">
                                                                            <p className="text-[9px] text-slate-400 italic">"{med.ghiChu}"</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorHome;
