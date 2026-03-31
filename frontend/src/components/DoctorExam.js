import { toast } from 'react-toastify';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const DoctorExam = () => {
    const [symptoms, setSymptoms] = useState('');
    const [diagnosis, setDiagnosis] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedMed, setSelectedMed] = useState(null);
    const [searchStatus, setSearchStatus] = useState('idle');
    const [dosage, setDosage] = useState({ sang: 0, trua: 0, chieu: 0, toi: 0 });
    const [days, setDays] = useState(1);
    const [medicines, setMedicines] = useState([]);

    const searchRef = useRef(null);

    useEffect(() => {
        const fetchMedicines = async () => {
            if (searchTerm.trim().length < 1) {
                setSuggestions([]);
                setSearchStatus('idle');
                return;
            }

            if (selectedMed && searchTerm === selectedMed.tenThuoc) return;

            setSearchStatus('loading');
            try {
                const res = await axios.get(`http://localhost:5000/api/medicines/search?name=${encodeURIComponent(searchTerm)}`);
                setSuggestions(res.data);
                setSearchStatus(res.data.length === 0 ? 'empty' : 'success');
            } catch (error) {
                console.error('Lỗi kết nối:', error);
                setSearchStatus('error');
            }
        };

        const timer = setTimeout(fetchMedicines, 200);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedMed]);

    const handleSelectMedicine = (med) => {
        setSelectedMed(med);
        setSearchTerm(med.tenThuoc);
        setSuggestions([]);
        setSearchStatus('idle');

        setDosage({
            sang: med.phatDoGoiY?.sang || 0,
            trua: med.phatDoGoiY?.trua || 0,
            chieu: med.phatDoGoiY?.chieu || 0,
            toi: med.phatDoGoiY?.toi || 0
        });
        setDays(1);
    };

    const handleAddMedicine = () => {
        if (!selectedMed) return toast.error('Vui lòng chọn thuốc!');
        const dailyTotal = Object.values(dosage).reduce((a, b) => a + b, 0);
        if (dailyTotal <= 0) return toast.error('Liều dùng không được để trống!');

        const newEntry = {
            ...selectedMed,
            ...dosage,
            days,
            totalPrice: dailyTotal * days * (selectedMed.gia || 0)
        };

        setMedicines([...medicines, newEntry]);
        setSelectedMed(null);
        setSearchTerm('');
        setDosage({ sang: 0, trua: 0, chieu: 0, toi: 0 });
    };

    const savePrescription = async () => {
        if (!symptoms || !diagnosis || medicines.length === 0) {
            return toast.error('Vui lòng nhập đầy đủ thông tin khám!');
        }

        const payload = {
            symptoms,
            diagnosis,
            medicines,
            totalOrderPrice: medicines.reduce((sum, m) => sum + m.totalPrice, 0),
            createdAt: new Date()
        };

        try {
            await axios.post('http://localhost:5000/api/medicines/save-prescription', payload);
            toast.info('Lưu đơn thuốc thành công!');
            setMedicines([]);
            setSymptoms('');
            setDiagnosis('');
        } catch (error) {
            toast.error('Lỗi khi lưu đơn thuốc.');
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 bg-slate-50 min-h-screen font-sans">
            <h2 className="text-3xl font-black mb-8 text-center text-blue-700 border-b-4 border-blue-200 pb-4 uppercase">
                Hệ thống kê đơn thuốc điện tử
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Triệu chứng lâm sàng</label>
                    <textarea
                        className="w-full border-none bg-gray-50 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none h-24 transition-all"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Ví dụ: Ho khan, sốt nhẹ về chiều..."
                    />
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Kết luận chẩn đoán</label>
                    <textarea
                        className="w-full border-none bg-gray-50 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none h-24 transition-all"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Ví dụ: Viêm họng cấp tính..."
                    />
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-blue-100 relative" ref={searchRef}>
                <label className="block font-bold text-blue-900 mb-3 flex items-center">
                    <span className="bg-blue-600 text-white p-1 rounded mr-2 text-xs">STEP 2</span>
                    Tìm kiếm thuốc (Gõ tên thuốc cần tìm)
                </label>

                <div className="relative">
                    <input
                        type="text"
                        className="w-full border-2 border-blue-50 p-4 rounded-xl focus:border-blue-500 outline-none text-lg shadow-inner transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Gõ 'pa' để tìm Paracetamol..."
                    />

                    {searchStatus !== 'idle' && (
                        <div className="absolute left-0 right-0 z-50 w-full bg-white border-2 border-blue-400 shadow-2xl rounded-xl mt-2 max-h-72 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {searchStatus === 'loading' && <div className="p-4 text-center text-blue-500 font-medium">Đang tìm trong kho thuốc...</div>}

                            {searchStatus === 'success' && (
                                <ul className="divide-y divide-gray-100">
                                    {suggestions.map((med) => (
                                        <li
                                            key={med._id}
                                            className="p-4 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-all group"
                                            onClick={() => handleSelectMedicine(med)}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-bold text-lg text-blue-800 group-hover:text-blue-600">{med.tenThuoc}</span>
                                                <span className="text-sm text-gray-500">{med.lieuLuong} | {med.dang} | Giá: {med.gia?.toLocaleString()}đ</span>
                                            </div>
                                            <button className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">
                                                CHỌN
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {searchStatus === 'empty' && (
                                <div className="p-8 text-center">
                                    <p className="text-gray-400 italic">Không tìm thấy thuốc nào khớp với "{searchTerm}"</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {selectedMed && (
                    <div className="mt-8 bg-blue-50 p-6 rounded-2xl border-2 border-blue-200 animate-in zoom-in duration-300">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-2xl font-black text-blue-900 leading-tight">{selectedMed.tenThuoc}</h3>
                                <p className="text-blue-600 font-medium">{selectedMed.ghiChuMacDinh}</p>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-lg border border-blue-200 shadow-sm text-right">
                                <span className="text-xs text-gray-400 block uppercase font-bold">Đơn giá</span>
                                <span className="text-xl font-black text-blue-700">{selectedMed.gia?.toLocaleString()}đ</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {['sang', 'trua', 'chieu', 'toi'].map(buoi => (
                                <div key={buoi} className="bg-white p-3 rounded-xl border border-blue-100">
                                    <label className="block text-[10px] font-black text-blue-400 uppercase mb-2 text-center tracking-tighter">{buoi}</label>
                                    <input
                                        type="number"
                                        className="w-full text-2xl p-1 rounded-md outline-none text-center font-black text-gray-700 focus:text-blue-600"
                                        value={dosage[buoi]}
                                        onChange={(e) => setDosage({ ...dosage, [buoi]: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            ))}
                            <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200">
                                <label className="block text-[10px] font-black text-blue-100 uppercase mb-2 text-center">Số ngày</label>
                                <input
                                    type="number"
                                    className="w-full text-2xl p-1 bg-transparent outline-none text-center font-black text-white"
                                    value={days}
                                    onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleAddMedicine}
                            className="w-full mt-6 bg-blue-800 text-white font-black py-4 rounded-xl hover:bg-blue-900 shadow-xl transform active:scale-[0.98] transition-all flex justify-center items-center gap-2"
                        >
                            <span className="text-xl hidden"></span> THÊM VÀO ĐƠN THUỐC
                        </button>
                    </div>
                )}
            </div>

            {medicines.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border border-gray-200 animate-in slide-in-from-bottom-4">
                    <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
                        <span className="font-bold uppercase tracking-widest text-sm">Chi tiết đơn thuốc</span>
                        <span className="text-xs opacity-60">{medicines.length} loại thuốc</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 border-b">
                                <tr>
                                    <th className="p-4 text-left">Tên Thuốc</th>
                                    <th className="p-4 text-center">Sáng - Trưa - Chiều - Tối</th>
                                    <th className="p-4 text-center">Ngày</th>
                                    <th className="p-4 text-right">Thành tiền</th>
                                    <th className="p-4 text-center">#</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {medicines.map((med, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4 font-bold text-gray-800">
                                            {med.tenThuoc}
                                            <span className="block text-[10px] text-gray-400 font-normal italic">{med.lieuLuong}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="inline-flex gap-1">
                                                {[med.sang, med.trua, med.chieu, med.toi].map((v, i) => (
                                                    <span key={i} className={`w-6 h-6 rounded flex items-center justify-center font-bold ${v > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-300'}`}>
                                                        {v}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center font-medium text-gray-600">{med.days}</td>
                                        <td className="p-4 text-right font-black text-blue-900">{med.totalPrice.toLocaleString()}đ</td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => setMedicines(medicines.filter((_, i) => i !== idx))}
                                                className="w-8 h-8 rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-all font-bold"
                                            >
                                                X
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 bg-blue-900 text-white flex justify-between items-center">
                        <span className="text-lg font-bold">TỔNG CỘNG ĐƠN GIÁ:</span>
                        <span className="text-3xl font-black">
                            {medicines.reduce((sum, m) => sum + m.totalPrice, 0).toLocaleString()}đ
                        </span>
                    </div>
                </div>
            )}

            <div className="text-center pb-20">
                <button
                    onClick={savePrescription}
                    className="group relative bg-green-500 text-white px-16 py-6 rounded-full font-black text-2xl hover:bg-green-600 shadow-[0_10px_30px_rgba(34,197,94,0.4)] transition-all hover:-translate-y-1 active:translate-y-0.5"
                >
                    XÁC NHẬN & XUẤT ĐƠN
                </button>
                <p className="mt-4 text-gray-400 text-sm italic">Hệ thống sẽ tự động lưu vào cơ sở dữ liệu sau khi nhấn xác nhận</p>
            </div>
        </div>
    );
};

export default DoctorExam;