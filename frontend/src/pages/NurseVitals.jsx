import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const pad2 = (n) => String(n).padStart(2, '0');
const toLocalDateString = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const SLOT_DEFS = [
  { slot: '07:00 - 08:00', session: 'Morning' },
  { slot: '09:00 - 10:00', session: 'Morning' },
  { slot: '13:00 - 15:00', session: 'Afternoon' },
  { slot: '16:00 - 18:00', session: 'Afternoon' },
];

const validateVitalsFront = (v) => {
  const errors = [];
  const temperature = Number(v.temperature);
  if (Number.isNaN(temperature) || temperature < 35 || temperature > 42) {
    errors.push('Temperature must be between 35 - 42 °C');
  }

  const bloodPressure = String(v.bloodPressure || '').trim();
  const m = bloodPressure.match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
  if (!m) {
    errors.push('Blood pressure must be in "Systolic/Diastolic" format, e.g., "120/80"');
  } else {
    const systolic = Number(m[1]);
    const diastolic = Number(m[2]);
    if (Number.isNaN(systolic) || systolic < 70 || systolic > 250) errors.push('Systolic must be 70 - 250 mmHg');
    if (Number.isNaN(diastolic) || diastolic < 40 || diastolic > 150) errors.push('Diastolic must be 40 - 150 mmHg');
  }

  const heartRate = Number(v.heartRate);
  if (Number.isNaN(heartRate) || heartRate < 30 || heartRate > 220) errors.push('Pulse rate must be 30 - 220 bpm');

  const weight = Number(v.weight);
  if (Number.isNaN(weight) || weight < 0 || weight > 300) errors.push('Weight must be 0 - 300 kg');

  const spO2 = Number(v.spO2);
  if (Number.isNaN(spO2) || spO2 < 50 || spO2 > 100) errors.push('SpO2 must be 50 - 100 %');

  return errors;
};

const NurseVitals = () => {
  const todayStr = useMemo(() => toLocalDateString(new Date()), []);

  const [tab, setTab] = useState('list');

  const [walkin, setWalkin] = useState({
    name: '',
    gender: 'Male',
    age: '',
    email: '',
    password: '',
    address: '',
    phone: '',
    cccd: '',
    date: todayStr,
    timeSlot: SLOT_DEFS[0].slot,
    department: '',
    doctorName: '',
  });

  const [walkinBusy, setWalkinBusy] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);

  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState(todayStr);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [vitalsEligibility, setVitalsEligibility] = useState(null);
  const [vitalsEligLoading, setVitalsEligLoading] = useState(false);
  const [savingVitals, setSavingVitals] = useState(false);

  const [vitals, setVitals] = useState({
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    weight: '',
    spO2: '',
    note: '',
  });

  const resetVitals = () =>
    setVitals({
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      weight: '',
      spO2: '',
      note: '',
    });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/doctors');
        setDoctors(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load doctor list:', err);
      }
    };
    fetchDoctors();
  }, []);

  const uniqueDepartments = Array.from(
    new Set((doctors || []).map((d) => d.department).filter(Boolean))
  );

  const filteredDoctors = walkin.department
    ? doctors.filter((d) => d.department === walkin.department)
    : [];

  const fetchRecentAppointments = async () => {
    try {
      setRecentLoading(true);
      const res = await axios.get('http://localhost:5000/api/nurse/appointments/recent', {
        params: { limit: 80 },
      });
      setRecentAppointments(res.data?.results || []);
    } catch (err) {
      console.error('Failed to fetch recent appointments:', err);
    } finally {
      setRecentLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentAppointments();
  }, []);

  const fetchHistoryByAppointment = async (appointmentId) => {
    if (!appointmentId) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/vitals/history/by-appointment/${appointmentId}`
      );
      setVitalsHistory(res.data || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const fetchVitalsEligibility = async (appointmentId) => {
    if (!appointmentId) {
      setVitalsEligibility(null);
      return;
    }
    try {
      setVitalsEligLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/nurse/appointments/${appointmentId}/vitals-eligibility`
      );
      setVitalsEligibility(res.data);
    } catch (err) {
      setVitalsEligibility({
        success: false,
        allowed: false,
        message: err.response?.data?.error || 'Could not verify vitals eligibility',
      });
    } finally {
      setVitalsEligLoading(false);
    }
  };

  const handleWalkinSubmit = async (e) => {
    e.preventDefault();
    setWalkinBusy(true);
    try {
      const trimmedName = String(walkin.name || '').trim();
      const trimmedEmail = String(walkin.email || '').trim();
      const phoneDigits = String(walkin.phone || '').trim();
      const cccdDigits = String(walkin.cccd || '').trim();

      if (!trimmedName || !/^[\p{L}\s]+$/u.test(trimmedName)) {
        toast.error('Name must only contain letters.');
        return;
      }
      if (!/^\d{10}$/.test(phoneDigits)) {
        toast.info('Phone number must be exactly 10 digits.');
        return;
      }
      if (!/^\d{10}$/.test(cccdDigits)) {
        toast.info('ID card must be exactly 10 digits.');
        return;
      }
      if (!/^[^\s@]+@gmail\.com$/i.test(trimmedEmail)) {
        toast.info('Email must end with @gmail.com');
        return;
      }

      const payload = { ...walkin };
      const res = await axios.post('http://localhost:5000/api/nurse/walk-in-booking', payload);
      if (res.data?.success) {
        if (res.data.alreadyHasAppointment) {
          toast.info(
            res.data.message ||
                'Patient already has an appointment today. Please record vitals during the scheduled slot.'
          );
          fetchRecentAppointments();
          return;
        }
        const appointment = res.data.appointment;
        setSelectedAppointment(appointment);
        setTab('vitals');
        resetVitals();
        fetchHistoryByAppointment(appointment?._id);
        fetchVitalsEligibility(appointment?._id);
        fetchRecentAppointments();
        toast.info('Appointment created — vitals can be recorded immediately.');
      } else {
        toast.error(res.data?.error || 'Failed to create appointment!');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error creating walk-in appointment!');
    } finally {
      setWalkinBusy(false);
    }
  };

  const handleSearch = async () => {
    const name = searchName.trim();
    if (!name) {
      toast.error('Please enter a patient name to search!');
      return;
    }
    try {
      const res = await axios.get('http://localhost:5000/api/nurse/appointments/search', {
        params: { name, date: searchDate },
      });
      setSearchResults(res.data?.results || []);
      setSelectedAppointment(null);
      setVitalsHistory([]);
      setVitalsEligibility(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not find patient!');
    }
  };

  const handleSelectAppointment = (apt) => {
    setSelectedAppointment(apt);
    setVitalsHistory([]);
    fetchHistoryByAppointment(apt?._id);
    fetchVitalsEligibility(apt?._id);
  };

  const handleSaveVitals = async (e) => {
    e.preventDefault();
    if (!selectedAppointment?._id) {
      toast.error('Please select a patient with a pending appointment!');
      return;
    }

    if (vitalsEligibility && vitalsEligibility.success === true && vitalsEligibility.allowed === false) {
      toast.info(vitalsEligibility.message || 'Vitals cannot be recorded for this appointment yet.');
      return;
    }

    const errors = validateVitalsFront(vitals);
    if (errors.length) {
      toast.info(errors.join('\n'));
      return;
    }

    setSavingVitals(true);
    try {
      const payload = {
        appointmentId: selectedAppointment._id,
        temperature: Number(vitals.temperature),
        bloodPressure: vitals.bloodPressure,
        heartRate: Number(vitals.heartRate),
        weight: Number(vitals.weight),
        spO2: Number(vitals.spO2),
        note: vitals.note || undefined,
        recordedBy: localStorage.getItem("userName") || "Y tá",
      };

      const res = await axios.post('http://localhost:5000/api/vitals/save-for-appointment', payload);
      if (res.data?.success) {
        toast.info('Vitals saved successfully!');
        resetVitals();
        handleSearch();
        fetchRecentAppointments();
        setSelectedAppointment(null);
        setVitalsHistory([]);
        setVitalsEligibility(null);
      } else {
        toast.error(res.data?.error || 'Failed to save!');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving vitals!');
    } finally {
      setSavingVitals(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!id) return;
    const ok = window.confirm('Do you want to delete this appointment? (Status will be set to Cancelled)');
    if (!ok) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/nurse/appointments/${id}`);
      if (res.data?.success) {
        toast.info('Appointment cancelled!');
        fetchRecentAppointments();
        if (tab === 'vitals') handleSearch();
      } else {
        toast.error(res.data?.error || 'Failed to cancel appointment');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error cancelling appointment');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Record Vital Signs</h1>
          <p className="text-slate-500 text-sm mt-1">
            Create appointments and record vitals (per policy: during scheduled slots or immediately after booking)
          </p>
        </div>
      </div>

      <div className="flex gap-2">
          <button
            type="button"
            className={`px-4 py-2 rounded-xl font-semibold border transition-colors ${tab === 'list' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            onClick={() => setTab('list')}
          >
            Scheduled Appointments
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-xl font-semibold border transition-colors ${tab === 'walkin' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            onClick={() => setTab('walkin')}
          >
            Create Appointment
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-xl font-semibold border transition-colors ${tab === 'vitals' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            onClick={() => setTab('vitals')}
          >
            Find & Record Vitals
          </button>
      </div>

      {tab === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Scheduled Appointments</h2>
            <button
              type="button"
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50"
              onClick={fetchRecentAppointments}
            >
              Refresh
            </button>
          </div>
          <div className="p-5">
            {recentLoading ? (
              <div className="text-sm text-slate-500">Loading appointments...</div>
            ) : recentAppointments.length === 0 ? (
              <div className="text-sm text-slate-500">No appointments found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Patient</th>
                      <th className="py-2 pr-3">Doctor</th>
                      <th className="py-2 pr-3">Time Slot</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAppointments.map((apt) => (
                      <tr key={apt._id} className="border-b border-slate-50 text-sm">
                        <td className="py-2 pr-3">{apt.date || '-'}</td>
                        <td className="py-2 pr-3 font-semibold">{apt.patientName || '-'}</td>
                        <td className="py-2 pr-3">{apt.doctorName || '-'}</td>
                        <td className="py-2 pr-3">{apt.session || '-'} - {apt.timeSlot || '-'}</td>
                        <td className="py-2 pr-3">{apt.status || '-'}</td>
                        <td className="py-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleCancelAppointment(apt._id)}
                            disabled={['completed', 'Completed'].includes(apt.status)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'walkin' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Create Patient Appointment</h2>
            <div className="text-xs text-slate-500">
              Auto-cancel: <span className="font-semibold">11:30</span> (AM) & <span className="font-semibold">19:00</span> (PM)
            </div>
          </div>

          <form onSubmit={handleWalkinSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                value={walkin.name}
                onChange={(e) =>
                  setWalkin((p) => ({
                    ...p,
                    name: String(e.target.value)
                      .replace(/[0-9]/g, '')
                      .replace(/[^\p{L}\s]/gu, ''),
                  }))
                }
                placeholder="e.g., John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
              <select
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none bg-white"
                value={walkin.gender}
                onChange={(e) => setWalkin((p) => ({ ...p, gender: e.target.value }))}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                min={0}
                max={120}
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                value={walkin.age}
                onChange={(e) => setWalkin((p) => ({ ...p, age: e.target.value }))}
                placeholder="e.g., 30"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                value={walkin.email}
                onChange={(e) => setWalkin((p) => ({ ...p, email: e.target.value }))}
                placeholder="patient@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                pattern="\d{10}"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                value={walkin.phone}
                onChange={(e) =>
                  setWalkin((p) => ({
                    ...p,
                    phone: String(e.target.value).replace(/\D/g, '').slice(0, 10),
                  }))
                }
                placeholder="e.g., 0901234567"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password (patient can change later)</label>
              <input
                type="password"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                value={walkin.password}
                onChange={(e) => setWalkin((p) => ({ ...p, password: e.target.value }))}
                placeholder="e.g., 123456"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
              <input
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                value={walkin.address}
                onChange={(e) => setWalkin((p) => ({ ...p, address: e.target.value }))}
                placeholder="e.g., 123 Street, City"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1">ID Card</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                pattern="\d{10}"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                value={walkin.cccd}
                onChange={(e) =>
                  setWalkin((p) => ({
                    ...p,
                    cccd: String(e.target.value).replace(/\D/g, '').slice(0, 10),
                  }))
                }
                placeholder="e.g., 123456789"
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Appointment Date</label>
              <input
                type="date"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none bg-white"
                min={todayStr}
                value={walkin.date}
                onChange={(e) => setWalkin((p) => ({ ...p, date: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Time Slot</label>
              <select
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none bg-white cursor-pointer"
                value={walkin.timeSlot}
                onChange={(e) => setWalkin((p) => ({ ...p, timeSlot: e.target.value }))}
              >
                {SLOT_DEFS.map((s) => (
                  <option key={s.slot} value={s.slot}>
                    {s.session} - {s.slot}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
              <select
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none bg-white cursor-pointer"
                value={walkin.department}
                onChange={(e) =>
                  setWalkin((p) => ({
                    ...p,
                    department: e.target.value,
                    doctorName: '',
                  }))
                }
                required
              >
                <option value="">-- Select Department --</option>
                {uniqueDepartments.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Assigned Physician</label>
              <select
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none bg-white cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                value={walkin.doctorName}
                onChange={(e) => setWalkin((p) => ({ ...p, doctorName: e.target.value }))}
                disabled={!walkin.department}
                required
              >
                <option value="">-- Select Physician --</option>
                {filteredDoctors.map((d) => (
                  <option key={d.email} value={d.name}>
                    Dr. {d.name} {d.department ? `- ${d.department}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="button"
                className="flex-1 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                onClick={() =>
                  setWalkin({
                    name: '',
                    gender: 'Male',
                    age: '',
                    email: '',
                    password: '',
                    address: '',
                    phone: '',
                    cccd: '',
                    date: todayStr,
                    timeSlot: SLOT_DEFS[0].slot,
                    department: '',
                    doctorName: '',
                  })
                }
              >
                Refresh
              </button>
              <button
                type="submit"
                disabled={walkinBusy}
                className="flex-1 py-3 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:bg-sky-400"
              >
                {walkinBusy ? 'Creating...' : 'Create & Admit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'vitals' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800">Find Patient & Record Vitals</h2>
            <p className="text-xs text-slate-500 mt-1">
              Patient-booked: Record vitals during slot. Walk-in: Recorded within 24h of creation.
            </p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Search by Name</label>
                <input
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Enter patient name..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none bg-white"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="px-5 py-2.5 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700"
                onClick={handleSearch}
              >
                Find Appointments
              </button>
              <button
                type="button"
                className="px-5 py-2.5 bg-white text-slate-700 rounded-xl font-semibold border border-slate-200 hover:bg-slate-50"
                onClick={() => {
                  setSearchName('');
                  setSearchResults([]);
                  setSelectedAppointment(null);
                  setVitalsHistory([]);
                  setVitalsEligibility(null);
                }}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <h3 className="font-bold text-slate-700 mb-3">Search Results</h3>
              <div className="space-y-2 max-h-[420px] overflow-auto pr-2">
                {searchResults.length === 0 ? (
                  <div className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-xl p-4">
                    No pending appointments. To book a new visit, go to the <strong>Create Appointment</strong> tab.
                  </div>
                ) : (
                  searchResults.map((apt) => {
                    const active = selectedAppointment?._id === apt._id;
                    const isWalkIn = apt.appointmentSource === 'walk_in';
                    const isPending = ['pending', 'Awaiting Confirmation'].includes(apt.status);
                    return (
                      <button
                        type="button"
                        key={apt._id}
                        onClick={() => handleSelectAppointment(apt)}
                        className={`w-full text-left rounded-xl border p-4 transition-colors ${active ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                      >
                        <div className="font-bold text-slate-800">{apt.patientName}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {apt.session === 'morning' ? 'Morning' : apt.session === 'evening' ? 'Afternoon' : apt.session} - {apt.timeSlot || apt.slot}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Date: {apt.date || apt.appointmentDate}</div>
                        <div className="text-[10px] mt-2 font-bold uppercase tracking-wide">
                          {isWalkIn ? (
                            <span className="text-violet-600">Walk-in</span>
                          ) : isPending ? (
                            <span className="text-amber-600">Awaiting Slot</span>
                          ) : (
                            <span className="text-emerald-600">Confirmed</span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              {!selectedAppointment ? (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-slate-600">
                  Select a patient from the list to start recording vitals.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h3 className="text-lg font-bold text-slate-800 mb-3">Patient Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50">
                        <div className="text-xs text-slate-500 uppercase font-medium">Full Name</div>
                        <div className="font-semibold text-slate-800">{selectedAppointment.patientName}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50">
                        <div className="text-xs text-slate-500 uppercase font-medium">Age / Gender</div>
                        <div className="font-semibold text-slate-800">
                          {selectedAppointment.age ?? '-'} / {selectedAppointment.gender ?? '-'}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50">
                        <div className="text-xs text-slate-500 uppercase font-medium">Time Slot</div>
                        <div className="font-semibold text-slate-800">
                          {selectedAppointment.session === 'morning'
                            ? 'Morning'
                            : selectedAppointment.session === 'evening'
                              ? 'Afternoon'
                              : selectedAppointment.session}{' '}
                          - {selectedAppointment.timeSlot || selectedAppointment.slot}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50">
                        <div className="text-xs text-slate-500 uppercase font-medium">Address / ID</div>
                        <div className="font-semibold text-slate-800">
                          {selectedAppointment.address ?? '-'}
                          {selectedAppointment.cccd ? ` / ${selectedAppointment.cccd}` : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveVitals} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h3 className="text-lg font-bold text-slate-800 mb-3">Enter Vitals</h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Patient name is automatically linked to the selected appointment.
                    </p>

                    {vitalsEligLoading && (
                      <p className="text-sm text-slate-500 mb-4">Checking vitals eligibility...</p>
                    )}
                    {!vitalsEligLoading && vitalsEligibility?.success && (
                      <div
                        className={`mb-4 rounded-xl border px-4 py-3 text-sm ${vitalsEligibility.allowed ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-900'
                          }`}
                      >
                        {vitalsEligibility.message}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Temperature (°C)</label>
                        <input
                          type="number"
                          min={35}
                          max={42}
                          step="0.1"
                          value={vitals.temperature}
                          onChange={(e) => setVitals((p) => ({ ...p, temperature: e.target.value }))}
                          className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                          placeholder="e.g., 37.0"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Blood Pressure (mmHg)</label>
                        <input
                          type="text"
                          value={vitals.bloodPressure}
                          onChange={(e) => setVitals((p) => ({ ...p, bloodPressure: e.target.value }))}
                          className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                          placeholder="e.g., 120/80"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pulse Rate (bpm)</label>
                        <input
                          type="number"
                          min={30}
                          max={220}
                          step="1"
                          value={vitals.heartRate}
                          onChange={(e) => setVitals((p) => ({ ...p, heartRate: e.target.value }))}
                          className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                          placeholder="e.g., 75"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Weight (kg)</label>
                        <input
                          type="number"
                          min={0}
                          max={300}
                          step="0.1"
                          value={vitals.weight}
                          onChange={(e) => setVitals((p) => ({ ...p, weight: e.target.value }))}
                          className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                          placeholder="e.g., 60"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SpO2 (%)</label>
                        <input
                          type="number"
                          min={50}
                          max={100}
                          step="1"
                          value={vitals.spO2}
                          onChange={(e) => setVitals((p) => ({ ...p, spO2: e.target.value }))}
                          className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                          placeholder="e.g., 98"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes (Optional)</label>
                        <textarea
                          value={vitals.note}
                          onChange={(e) => setVitals((p) => ({ ...p, note: e.target.value }))}
                          className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none min-h-[90px]"
                          placeholder="e.g., mild fatigue, dry cough..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-5">
                      <button
                        type="button"
                        className="flex-1 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                        onClick={() => resetVitals()}
                      >
                        Clear Form
                      </button>
                      <button
                        type="submit"
                        disabled={
                          savingVitals ||
                          vitalsEligLoading ||
                          (vitalsEligibility?.success && vitalsEligibility.allowed === false)
                        }
                        className="flex-1 py-3 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:bg-sky-400"
                      >
                        {savingVitals ? 'Saving...' : 'Save Vitals'}
                      </button>
                    </div>
                  </form>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h3 className="text-lg font-bold text-slate-800 mb-3">Recent Vitals History</h3>
                    {vitalsHistory.length === 0 ? (
                      <div className="text-sm text-slate-500">No data for this appointment.</div>
                    ) : (
                      <div className="space-y-3">
                        {vitalsHistory.slice(0, 10).map((item, idx) => (
                          <div
                            key={item._id || idx}
                            className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4"
                          >
                            <div>
                              <div className="font-bold text-slate-800">Visit #{vitalsHistory.length - idx}</div>
                              <div className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</div>
                            </div>
                            <div className="text-sm font-bold text-slate-700 whitespace-nowrap">
                              <span className="text-slate-900">{item.temperature}°C</span> · {item.bloodPressure} ·{' '}
                              {item.heartRate} bpm · {item.weight} kg · SpO2 {item.spO2}%
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseVitals;
