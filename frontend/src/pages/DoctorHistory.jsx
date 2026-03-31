import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_BASE_URL = 'http://localhost:5000/api/doctors';

const DoctorHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchAllHistory = async (search = "") => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/history/all?searchTerm=${encodeURIComponent(search)}`);
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatFullDate = (dateStr) => {
        if (!dateStr) return "N/A";
        const d = new Date(dateStr);
        return d.toLocaleString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    useEffect(() => {
        fetchAllHistory();
    }, []);

    const filteredHistory = history.filter(h =>
        h.benh_nhan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.chan_doan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.bac_si.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto pb-10 px-4">
            <div className="mb-8 border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold text-slate-800">Consultation History</h1>
                <p className="text-slate-500 text-sm mt-1">Search through medical records, vital signs, and prescriptions.</p>
            </div>

            <div className="mb-6">
                <div className="relative max-w-2xl">
                    <input
                        type="text"
                        placeholder="Search by patient, diagnosis, or doctor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-10 bg-white border border-slate-300 rounded-md shadow-sm focus:border-blue-500 outline-none transition-all text-sm"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400 italic">Loading data...</div>
            ) : filteredHistory.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-slate-200 text-slate-400 italic">
                    No matching records found.
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-xs font-bold text-slate-600">
                                <th className="p-4 border-r border-slate-200 w-32">Date</th>
                                <th className="p-4 border-r border-slate-200 w-48">Patient</th>
                                <th className="p-4">Consultation Details & Results</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredHistory.map((record, idx) => (
                                <tr key={record._id || idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-xs text-slate-600 align-top border-r border-slate-200">{record.ngay}</td>
                                    <td className="p-4 text-sm font-bold text-slate-800 align-top border-r border-slate-200">{record.benh_nhan}</td>
                                    <td className="p-4 align-top">
                                        <div className="space-y-4">
                                            {}
                                            {record.vitals ? (
                                                <div className="border border-slate-100 rounded p-3 bg-slate-50/50">
                                                    <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-1">
                                                        <h4 className="text-[11px] font-bold text-blue-700 uppercase">1. Vital Signs</h4>
                                                        <span className="text-[10px] text-slate-400">Logged by: {record.vitals.recordedBy || "System"} - {formatFullDate(record.vitals.recordedAt || record.createdAt)}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                                        <div className="flex flex-col"><span className="text-slate-400 text-[10px]">Weight</span><span className="font-medium">{record.vitals.weight}kg</span></div>
                                                        <div className="flex flex-col"><span className="text-slate-400 text-[10px]">Temp</span><span className="font-medium">{record.vitals.temperature}°C</span></div>
                                                        <div className="flex flex-col"><span className="text-slate-400 text-[10px]">BP</span><span className="font-medium">{record.vitals.bloodPressure}</span></div>
                                                        <div className="flex flex-col"><span className="text-slate-400 text-[10px]">SpO2</span><span className="font-medium">{record.vitals.spO2}%</span></div>
                                                    </div>
                                                    {record.vitals.nurseNote && (
                                                        <p className="mt-2 text-[11px] text-slate-500 italic border-t border-slate-100 pt-1">Note: {record.vitals.nurseNote}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-slate-400 italic p-2 border border-dashed border-slate-200 rounded">No vital signs data</div>
                                            )}

                                            {}
                                            <div className="border border-slate-200 rounded p-3">
                                                <div className="flex justify-between items-center mb-2 border-b border-slate-200 pb-1">
                                                    <h4 className="text-[11px] font-bold text-slate-700 uppercase">2. Diagnosis Results</h4>
                                                    <span className="text-[10px] text-slate-400 font-bold">Dr. {record.bac_si}</span>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 mb-1">Symptoms/Reason</p>
                                                        <p className="text-xs text-slate-700 leading-relaxed">{record.symptoms || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 mb-1">Clinical Diagnosis</p>
                                                        <p className="text-xs font-bold text-slate-900 leading-relaxed">{record.chan_doan}</p>
                                                    </div>
                                                </div>

                                                {record.toa_thuoc && record.toa_thuoc.length > 0 && (
                                                    <div className="mt-3 pt-2 border-t border-slate-100">
                                                        <p className="text-[10px] font-bold text-slate-400 mb-1">Prescription Items:</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                                            {record.toa_thuoc.map((med, midx) => (
                                                                <div key={midx} className="text-xs flex justify-between border-b border-slate-50 last:border-0 py-0.5">
                                                                    <span className="font-medium text-slate-800">{med.tenThuoc}</span>
                                                                    <span className="text-slate-500 tabular-nums">M:{med.sang} - N:{med.trua} - A:{med.chieu} - E:{med.toi}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
};

export default DoctorHistory;
