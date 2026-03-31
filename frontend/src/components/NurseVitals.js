import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NurseVitals = () => {
    const [vitals, setVitals] = useState({
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        weight: '',
        spO2: ''
    });

    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/vitals/history');
            setHistory(res.data);
        } catch (err) {
            console.error("Không thể lấy lịch sử:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVitals(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/vitals/save', vitals);
            if (response.data.success) {
                toast.info('Đã lưu chỉ số sinh tồn!');
                setVitals({
                    temperature: '',
                    bloodPressure: '',
                    heartRate: '',
                    weight: '',
                    spO2: ''
                });
                fetchHistory();
            }
        } catch (error) {
            toast.error('Lỗi: Không thể lưu dữ liệu!');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white shadow-2xl rounded-3xl p-8 border border-red-50">
                <h2 className="text-2xl font-black text-red-600 mb-6 flex items-center gap-3">
                    <span className="bg-red-100 p-2 rounded-full hidden"></span>
                    LẤY DẤU SINH HIỆU
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nhiệt độ (°C)</label>
                        <input name="temperature" type="number" step="0.1" value={vitals.temperature} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-300" placeholder="36.5" required />
                    </div>

                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Huyết áp (mmHg)</label>
                        <input name="bloodPressure" value={vitals.bloodPressure} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-300" placeholder="120/80" required />
                    </div>

                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Mạch (lần/phút)</label>
                        <input name="heartRate" type="number" value={vitals.heartRate} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-300" placeholder="80" />
                    </div>

                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Cân nặng (kg)</label>
                        <input name="weight" type="number" value={vitals.weight} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-300" placeholder="60" />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">SpO2 (%)</label>
                        <input name="spO2" type="number" value={vitals.spO2} onChange={handleChange} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-300" placeholder="98" />
                    </div>

                    <button type="submit" className="md:col-span-2 mt-4 bg-red-600 text-white font-black py-5 rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-200 transform active:scale-95 text-lg">
                        LƯU CHỈ SỐ
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                <h3 className="font-bold text-gray-500 mb-4 uppercase text-sm tracking-widest">Lịch sử đo gần nhất</h3>
                <div className="space-y-3">
                    {history.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border-l-4 border-red-400">
                            <div>
                                <div className="font-bold text-gray-800">Lần đo #{history.length - index}</div>
                                <div className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</div>
                            </div>
                            <div className="flex gap-4 text-sm font-bold">
                                <span className="text-red-500">{item.temperature}°C</span>
                                <span className="text-blue-500">{item.bloodPressure} mmHg</span>
                                <span className="text-gray-600">{item.weight}kg</span>
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && <p className="text-center text-gray-400 py-4">Chưa có dữ liệu.</p>}
                </div>
            </div>
        </div>
    );
};

export default NurseVitals;