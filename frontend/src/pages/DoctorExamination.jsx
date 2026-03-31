import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_BASE_URL = 'http://localhost:5000/api/doctors';

const DoctorExamination = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const doctorName = localStorage.getItem("userName");

    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedMed, setSelectedMed] = useState(null);
    const [dosage, setDosage] = useState({ morning: 0, noon: 0, afternoon: 0, evening: 0 });
    const [days, setDays] = useState(1);
    const [symptoms, setSymptoms] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [medicines, setMedicines] = useState([]);
    const [nurseSigns, setNurseSigns] = useState(null);
    const [followUpDate, setFollowUpDate] = useState('');
    const [showFollowUp, setShowFollowUp] = useState(false);

    const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);
    const [newMedForm, setNewMedForm] = useState({ medicineName: '', price: 0, dosage: '', form: 'Pill' });

    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchAppointmentData = async () => {
            try {
                setLoading(true);
                const aptRes = await axios.get(`${API_BASE_URL}/appointment/${id}`);
                setAppointment(aptRes.data);

                const vitalsRes = await axios.get(`${API_BASE_URL}/vitals/appointment/${id}`);
                if (vitalsRes.data && vitalsRes.data.length > 0) {
                    setNurseSigns(vitalsRes.data[0]);
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                const errorMsg = err.response?.data?.message || err.message || "Consultation record not found!";
                toast.error(errorMsg);
                navigate('/doctor');
            } finally {
                setLoading(false);
            }
        };
        fetchAppointmentData();
    }, [id, navigate]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchMedicines(searchTerm);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchMedicines = async (name) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/medicines/search?name=${encodeURIComponent(name)}`);
            setSuggestions(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSelectMedicine = (med) => {
        setSelectedMed(med);
        setSearchTerm(med.medicineName || med.tenThuoc);
        setSuggestions([]);
        setDosage({
            morning: med.suggestedDosage?.morning || med.phatDoGoiY?.sang || 0,
            noon: med.suggestedDosage?.noon || med.phatDoGoiY?.trua || 0,
            afternoon: med.suggestedDosage?.afternoon || med.phatDoGoiY?.chieu || 0,
            evening: med.suggestedDosage?.evening || med.phatDoGoiY?.toi || 0
        });
    };

    const handleAddMedicine = () => {
        if (!selectedMed) return;
        const dailyTotal = (parseInt(dosage.morning) || 0) + (parseInt(dosage.noon) || 0) + (parseInt(dosage.afternoon) || 0) + (parseInt(dosage.evening) || 0);
        const totalQuantity = (dailyTotal || 1) * days;
        const newMedicine = {
            medicineName: selectedMed.medicineName || selectedMed.tenThuoc,
            dosage: selectedMed.dosage || selectedMed.lieuLuong || "",
            form: selectedMed.form || selectedMed.dang || "",
            morning: dosage.morning,
            noon: dosage.noon,
            afternoon: dosage.afternoon,
            evening: dosage.evening,
            days: days,
            note: "",
            totalPrice: totalQuantity * (selectedMed.price || selectedMed.gia || 0)
        };
        setMedicines([...medicines, newMedicine]);
        setSelectedMed(null);
        setSearchTerm('');
        setDosage({ morning: 0, noon: 0, afternoon: 0, evening: 0 });
        setDays(1);
    };

    const handleCreateNewMed = async () => {
        if (!newMedForm.medicineName || !newMedForm.price) {
            return toast.error("Please enter medicine name and price!");
        }
        try {
            const res = await axios.post(`${API_BASE_URL}/medicines/add`, newMedForm);
            toast.success("New medicine added to inventory!");
            handleSelectMedicine(res.data.medicine);
            setIsAddMedModalOpen(false);
            setNewMedForm({ medicineName: '', price: 0, dosage: '', form: 'Pill' });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to add new medicine.");
        }
    };

    const handleMedicineNoteChange = (index, value) => {
        const updated = [...medicines];
        updated[index].note = value;
        setMedicines(updated);
    };

    const removeMedicine = (index) => {
        const updatedMedicines = [...medicines];
        updatedMedicines.splice(index, 1);
        setMedicines(updatedMedicines);
    };

    const savePrescription = async () => {
        if (!diagnosis) return toast.error("Please enter diagnosis before saving!");

        try {
            const vitalsRes = await axios.get(`${API_BASE_URL}/vitals/appointment/${id}`);
            const latestVitals = (vitalsRes.data && vitalsRes.data.length > 0) ? vitalsRes.data[0] : nurseSigns;

            const prescriptionData = {
                patientId: appointment.patientId || "BN001",
                patientName: appointment.patientName,
                nurseSigns: latestVitals ? {
                    weight: latestVitals.weight,
                    temperature: latestVitals.temperature,
                    bloodPressure: latestVitals.bloodPressure,
                    heartRate: latestVitals.heartRate,
                    spO2: latestVitals.spO2,
                    note: latestVitals.note
                } : null,
                symptoms,
                diagnosis,
                medicines,
                totalOrderPrice: medicines.reduce((sum, m) => sum + m.totalPrice, 0),
                followUpDate: showFollowUp ? followUpDate : null
            };

            const res = await axios.post(`${API_BASE_URL}/prescription/save`, prescriptionData);
            if (res.data.success) {
                await axios.put(`${API_BASE_URL}/appointment/complete`, { id });
                toast.success("Diagnosis saved and consultation completed!");
                navigate('/doctor');
            }
        } catch (error) {
            console.error("Save Error:", error);
            toast.error("Failed to save consultation results!");
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Đang tải...</div>;
    if (!appointment) return <div className="p-10 text-center text-red-500">Lỗi: Không tìm thấy lượt khám.</div>;

    return (
        <div className="max-w-7xl mx-auto p-4 bg-white min-h-screen font-sans text-slate-800">
            <div className="flex justify-between items-center bg-white border-b border-slate-300 pb-4 mb-6">
                <button
                    onClick={() => navigate('/doctor')}
                    className="border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-50 text-sm font-bold"
                >
                    ← EXIT
                </button>
                <div className="text-right">
                    <h1 className="text-xl font-bold">{appointment.patientName}</h1>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Consultation & Prescription</span>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <div className="bg-slate-50 border border-slate-200 rounded p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-bold text-xs uppercase text-slate-500 tracking-wider">Clinical Observations</h2>
                        {nurseSigns && (
                            <div className="flex gap-4 text-[11px] font-bold">
                                <span>Weight: {nurseSigns.weight}kg</span>
                                <span className="text-orange-600">Temp: {nurseSigns.temperature}°C</span>
                                <span>Pressure: {nurseSigns.bloodPressure}</span>
                                <span className="text-red-600">HR: {nurseSigns.heartRate}</span>
                                <span className="text-sky-600">SpO2: {nurseSigns.spO2}%</span>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Patient Symptoms</label>
                            <textarea
                                className="w-full border border-slate-300 p-2 rounded h-24 text-sm outline-none focus:border-slate-500"
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                placeholder="Describe symptoms..."
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Diagnosis (*)</label>
                            <textarea
                                className="w-full border border-slate-300 p-2 rounded h-24 text-sm outline-none focus:border-slate-500 font-medium"
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                placeholder="Enter clinical diagnosis..."
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-300 rounded p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-xs uppercase text-slate-500 tracking-wider">Medication & Dosage</h2>
                        <button
                            onClick={() => setIsAddMedModalOpen(true)}
                            className="text-[10px] font-black text-sky-600 uppercase bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100 hover:bg-sky-100 transition-all flex items-center gap-1"
                        >
                            <span className="text-sm">+</span> Add New Medicine to Directory
                        </button>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                className="w-full border border-slate-300 p-2 rounded text-sm font-bold outline-none focus:border-sky-500"
                                placeholder="Type medicine name to search..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => {
                                    if (searchTerm.length >= 2) fetchMedicines(searchTerm);
                                    setShowSuggestions(true);
                                }}
                                onClick={() => {
                                    if (searchTerm.length === 0) fetchMedicines('');
                                    setShowSuggestions(true);
                                }}
                                onBlur={() => {
                                    setTimeout(() => setShowSuggestions(false), 200);
                                }}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-300 shadow-xl max-h-48 overflow-y-auto rounded text-slate-800">
                                    {suggestions.map((med) => (
                                        <li key={med._id} className="p-2 hover:bg-slate-100 cursor-pointer border-b border-slate-50 flex justify-between items-center" onClick={() => handleSelectMedicine(med)}>
                                            <span className="text-sm font-bold">{med.tenThuoc} <small className="text-slate-400 font-normal">({med.lieuLuong} - {med.dang})</small></span>
                                            <span className="text-xs font-bold text-emerald-600">{med.gia.toLocaleString()}đ</span>
                                        </li>
                                    ))}
                                    <li
                                        className="p-3 bg-sky-50 text-sky-600 text-xs font-bold text-center cursor-pointer hover:bg-sky-100"
                                        onClick={() => {
                                            setNewMedForm({ ...newMedForm, medicineName: searchTerm });
                                            setIsAddMedModalOpen(true);
                                            setSuggestions([]);
                                        }}
                                    >
                                        + NOT FOUND? ADD NEW MEDICINE HERE
                                    </li>
                                </ul>
                            )}
                        </div>

                        {selectedMed && (
                            <div className="flex flex-wrap items-end gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <div className="flex flex-col items-center gap-2 group">
                                    <span className="text-[11px] font-black group-hover:text-amber-600 transition-colors">MORNING</span>
                                    <input
                                        type="number"
                                        className="w-16 border border-slate-200 p-2 rounded-xl text-center text-sm font-bold bg-slate-50 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all"
                                        value={dosage.morning}
                                        onChange={(e) => setDosage({ ...dosage, morning: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col items-center gap-2 group">
                                    <span className="text-[11px] font-black group-hover:text-blue-600 transition-colors">NOON</span>
                                    <input
                                        type="number"
                                        className="w-16 border border-slate-200 p-2 rounded-xl text-center text-sm font-bold bg-slate-50 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        value={dosage.noon}
                                        onChange={(e) => setDosage({ ...dosage, noon: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col items-center gap-2 group">
                                    <span className="text-[11px] font-black group-hover:text-orange-600 transition-colors">AFTERNOON</span>
                                    <input
                                        type="number"
                                        className="w-16 border border-slate-200 p-2 rounded-xl text-center text-sm font-bold bg-slate-50 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
                                        value={dosage.afternoon}
                                        onChange={(e) => setDosage({ ...dosage, afternoon: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col items-center gap-2 group">
                                    <span className="text-[11px] font-black group-hover:text-indigo-600 transition-colors">EVENING</span>
                                    <input
                                        type="number"
                                        className="w-16 border border-slate-200 p-2 rounded-xl text-center text-sm font-bold bg-slate-50 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                        value={dosage.evening}
                                        onChange={(e) => setDosage({ ...dosage, evening: e.target.value })}
                                    />
                                </div>
                                <div className="w-16">
                                    <label className="text-[9px] uppercase font-bold text-slate-400 block text-center">Days</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="w-full border border-slate-300 p-1 rounded text-center text-sm font-bold"
                                        value={days === 0 ? "" : days}
                                        placeholder="0"
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            setDays(val === "" ? 0 : parseInt(val, 10));
                                        }}
                                    />
                                </div>
                                <button onClick={handleAddMedicine} className="bg-slate-700 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-slate-600 transition-colors uppercase">Add</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border border-slate-300 rounded overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-100 border-b border-slate-300 font-bold text-[10px] text-slate-500 uppercase">
                            <tr>
                                <th className="p-2 border-r border-slate-200">Medicine Name</th>
                                <th className="p-2 border-r border-slate-200 text-center">Dosage</th>
                                <th className="p-2 border-r border-slate-200 text-center">Days</th>
                                <th className="p-2 border-r border-slate-200 w-1/3">Physician Instructions</th>
                                <th className="p-2 text-right">Amount</th>
                                <th className="p-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {medicines.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-400 italic">No prescription items added</td></tr>
                            ) : (
                                medicines.map((m, index) => (
                                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-3">
                                            <div className="font-bold text-slate-700 text-sm">{m.medicineName}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{m.dosage} — {m.form}</div>
                                        </td>
                                        <td className="p-3">
                                            <div className="grid grid-cols-4 gap-1 text-center">
                                                <div className="bg-amber-50 text-amber-700 p-1 rounded text-[10px] font-bold">M: {m.morning}</div>
                                                <div className="bg-blue-50 text-blue-700 p-1 rounded text-[10px] font-bold">N: {m.noon}</div>
                                                <div className="bg-orange-50 text-orange-700 p-1 rounded text-[10px] font-bold">A: {m.afternoon}</div>
                                                <div className="bg-indigo-50 text-indigo-700 p-1 rounded text-[10px] font-bold">E: {m.evening}</div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center text-sm font-black text-slate-600">{m.days}</td>
                                        <td className="p-3">
                                            <input
                                                type="text"
                                                className="w-full border border-slate-200 p-1.5 rounded text-[11px] font-medium outline-none focus:border-slate-400"
                                                value={m.note}
                                                onChange={(e) => handleMedicineNoteChange(index, e.target.value)}
                                                placeholder="Instructions..."
                                            />
                                        </td>
                                        <td className="p-3 text-right font-bold">{m.totalPrice.toLocaleString()}đ</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => removeMedicine(index)} className="text-slate-300 hover:text-red-500 font-bold px-2">×</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {medicines.length > 0 && (
                            <tfoot className="bg-slate-50 border-t border-slate-300 font-bold">
                                <tr>
                                    <td colSpan="8" className="p-3 text-right text-xs uppercase text-slate-400">Total:</td>
                                    <td className="p-3 text-right text-lg text-slate-800">{medicines.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}đ</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-slate-200 pt-6">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="followUp"
                            className="w-4 h-4 accent-slate-700 pointer-cursor"
                            checked={showFollowUp}
                            onChange={(e) => setShowFollowUp(e.target.checked)}
                        />
                        <label htmlFor="followUp" className="text-sm font-bold text-slate-600 uppercase cursor-pointer">Schedule Follow-up</label>
                        {showFollowUp && (
                            <input
                                type="date"
                                className="border border-slate-300 p-1 rounded text-sm ml-2 font-bold outline-none focus:border-slate-500"
                                value={followUpDate}
                                onChange={(e) => setFollowUpDate(e.target.value)}
                            />
                        )}
                    </div>

                    <button
                        onClick={savePrescription}
                        className="bg-emerald-600 text-white px-10 py-3 rounded font-bold hover:bg-emerald-700 transition shadow-sm uppercase text-sm tracking-widest"
                    >
                        Complete Examination
                    </button>
                </div>
            </div>

            {isAddMedModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">Add New Medicine to Catalog</h3>
                            <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-tighter">Enter medicine details for future use</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Medicine Name (*)</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-200 p-3 rounded-2xl text-sm font-bold outline-none focus:border-sky-500 bg-slate-50"
                                    value={newMedForm.medicineName}
                                    onChange={(e) => setNewMedForm({ ...newMedForm, medicineName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Price (VNĐ) (*)</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="w-full border border-slate-200 p-3 rounded-2xl text-sm font-bold outline-none focus:border-sky-500 bg-slate-50"
                                        value={newMedForm.price === 0 ? "" : newMedForm.price}
                                        placeholder="0"
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            setNewMedForm({ ...newMedForm, price: val === "" ? 0 : parseInt(val, 10) });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Unit (Type)</label>
                                    <select
                                        className="w-full border border-slate-200 p-3 rounded-2xl text-sm font-bold outline-none focus:border-sky-500 bg-slate-50"
                                        value={newMedForm.form}
                                        onChange={(e) => setNewMedForm({ ...newMedForm, form: e.target.value })}
                                    >
                                        <option value="Pill">Pill</option>
                                        <option value="Ampoule">Ampoule</option>
                                        <option value="Bottle">Bottle</option>
                                        <option value="Packet">Packet</option>
                                        <option value="Tube">Tube</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Strength (e.g. 500mg)</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-200 p-3 rounded-2xl text-sm font-bold outline-none focus:border-sky-500 bg-slate-50"
                                    value={newMedForm.dosage}
                                    onChange={(e) => setNewMedForm({ ...newMedForm, dosage: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 flex gap-3">
                            <button
                                onClick={() => setIsAddMedModalOpen(false)}
                                className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateNewMed}
                                className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-2xl text-sm font-bold hover:bg-sky-700 transition-all shadow-lg active:scale-95 uppercase"
                            >
                                Save to Catalog
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorExamination;