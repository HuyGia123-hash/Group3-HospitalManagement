import express from 'express';
import VitalSigns from '../models/VitalSigns.js';
import Appointment from '../models/Appointment.js';
import mongoose from 'mongoose';
import { canNurseRecordVitals } from '../utils/vitalsEligibility.js';

const router = express.Router();

const validateVitals = (payload) => {
  const {
    temperature,
    bloodPressure,
    heartRate,
    weight,
    spO2,
    respiratoryRate,
  } = payload || {};

  const errors = [];

  if (temperature !== undefined) {
    const t = Number(temperature);
    if (Number.isNaN(t) || t < 35 || t > 42) errors.push('Nhiệt độ phải trong khoảng 35 - 42 °C');
  }

  if (!bloodPressure || typeof bloodPressure !== 'string') {
    errors.push('Huyết áp là chuỗi theo dạng "120/80"');
  } else {
    const m = bloodPressure.trim().match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
    if (!m) {
      errors.push('Huyết áp phải theo dạng "Systolic/Diastolic" ví dụ "120/80"');
    } else {
      const systolic = Number(m[1]);
      const diastolic = Number(m[2]);
      if (Number.isNaN(systolic) || systolic < 70 || systolic > 250) {
        errors.push('Huyết áp tâm thu (Systolic) phải trong khoảng 70 - 250 mmHg');
      }
      if (Number.isNaN(diastolic) || diastolic < 40 || diastolic > 150) {
        errors.push('Huyết áp tâm trương (Diastolic) phải trong khoảng 40 - 150 mmHg');
      }
    }
  }

  if (heartRate !== undefined) {
    const hr = Number(heartRate);
    if (Number.isNaN(hr) || hr < 30 || hr > 220) errors.push('Mạch phải trong khoảng 30 - 220 lần/phút');
  }

  if (weight !== undefined) {
    const w = Number(weight);
    if (Number.isNaN(w) || w < 0 || w > 300) errors.push('Cân nặng phải trong khoảng 0 - 300 kg');
  }

  if (spO2 !== undefined) {
    const s = Number(spO2);
    if (Number.isNaN(s) || s < 50 || s > 100) errors.push('SpO2 phải trong khoảng 50 - 100 %');
  }

  if (respiratoryRate !== undefined) {
    const rr = Number(respiratoryRate);
    if (!Number.isNaN(rr) && (rr < 5 || rr > 80)) errors.push('Nhịp thở phải trong khoảng 5 - 80 lần/phút');
  }

  if (temperature === undefined) errors.push('Nhiệt độ là bắt buộc');
  if (!bloodPressure) errors.push('Huyết áp là bắt buộc');
  if (heartRate === undefined) errors.push('Mạch là bắt buộc');
  if (weight === undefined) errors.push('Cân nặng là bắt buộc');
  if (spO2 === undefined) errors.push('SpO2 là bắt buộc');

  return errors;
};

router.get('/history', async (req, res) => {
  try {
    const history = await VitalSigns.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history/by-appointment/:appointmentId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.appointmentId)) {
      return res.status(400).json({ error: 'Id không hợp lệ' });
    }
    const items = await VitalSigns.find({ appointmentId: req.params.appointmentId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Id không hợp lệ' });
    }
    const doc = await VitalSigns.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Không tìm thấy' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/save', async (req, res) => {
  try {
    if (req.body?.appointmentId) {
      const appointmentId = req.body.appointmentId;
      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        return res.status(400).json({ success: false, error: 'appointmentId không hợp lệ' });
      }
      const appointment = await Appointment.findById(appointmentId).lean();
      if (!appointment) return res.status(404).json({ success: false, error: 'Không tìm thấy appointment' });

      const elig = canNurseRecordVitals(appointment);
      if (!elig.ok) {
        return res.status(400).json({ success: false, error: elig.message, code: elig.code });
      }
    } else {
      if (!req.body?.patientName) {
        return res.status(400).json({ success: false, error: 'Thiếu patientName (hoặc appointmentId)' });
      }
    }

    const errors = validateVitals(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: errors.join('; ') });
    }

    const newVitals = new VitalSigns(req.body);
    const saved = await newVitals.save();

    if (saved.appointmentId) {
      await Appointment.findByIdAndUpdate(saved.appointmentId, {
        $set: { status: 'completed', completedAt: new Date() },
      });
    }

    res.status(201).json({ success: true, message: 'Đã lưu chỉ số sinh tồn!', data: saved });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/save-for-appointment', async (req, res) => {
  try {
    const { appointmentId, temperature, bloodPressure, heartRate, weight, spO2, respiratoryRate, note, recordedBy } = req.body || {};

    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ success: false, error: 'appointmentId không hợp lệ' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, error: 'Không tìm thấy appointment' });

    const elig = canNurseRecordVitals(appointment.toObject ? appointment.toObject() : appointment);
    if (!elig.ok) {
      return res.status(400).json({ success: false, error: elig.message, code: elig.code });
    }

    const payloadForValidate = { temperature, bloodPressure, heartRate, weight, spO2, respiratoryRate };
    const errors = validateVitals(payloadForValidate);
    if (errors.length) {
      return res.status(400).json({ success: false, error: errors.join('; ') });
    }

    const newVitals = new VitalSigns({
      appointmentId: appointment._id,
      patientName: appointment.patientName,
      age: appointment.age,
      weight,
      temperature,
      bloodPressure,
      heartRate,
      respiratoryRate,
      spO2,
      note,
      recordedBy,
    });

    const saved = await newVitals.save();

    await Appointment.findByIdAndUpdate(appointment._id, {
      $set: {
        status: 'completed',
        completedAt: new Date(),
        lastVitalSignsId: saved._id,
      },
    });

    return res.status(201).json({ success: true, message: 'Đã lưu chỉ số sinh tồn!', data: saved });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Id không hợp lệ' });
    }
    const updated = await VitalSigns.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();
    if (!updated) return res.status(404).json({ error: 'Không tìm thấy' });
    res.json({ success: true, message: 'Đã cập nhật!', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Id không hợp lệ' });
    }
    const deleted = await VitalSigns.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Không tìm thấy' });
    res.json({ success: true, message: 'Đã xóa!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
