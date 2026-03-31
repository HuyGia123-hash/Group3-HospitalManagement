import Appointment from '../models/Appointment.js';

const pad2 = (n) => String(n).padStart(2, '0');
const toLocalDateString = (d) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const getAppointments = async (req, res) => {
    try {
        const { patientName } = req.query;
        let query = patientName ? { patientName } : {};
        const appointments = await Appointment.find(query).sort({ createdAt: -1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

export const getAvailability = async (req, res) => {
    try {
        const { date, doctorName } = req.query;
        if (!date) return res.status(400).json({ message: "Missing required information (date)" });

        if (!doctorName || doctorName === "undefined" || doctorName === "") {
            return res.json({ bookedCounts: {} });
        }

        const cleanName = String(doctorName).trim().replace(/^BS\.\s*/i, '').toLowerCase();
        

        const appointments = await Appointment.find({ 
            date, 
            status: { $in: ['approved', 'completed', 'pending', 'Confirmed', 'Completed', 'Approved', 'Pending'] } 
        }).lean();

        const bookedCounts = {};
        let matchingCount = 0;

        appointments.forEach(apt => {
            const aptDoc = String(apt.doctorName || "").trim().replace(/^BS\.\s*/i, '').toLowerCase();
            

            if (aptDoc === cleanName) {
                const slot = apt.timeSlot;
                if (slot) {
                    const key = String(slot).trim();
                    bookedCounts[key] = (bookedCounts[key] || 0) + 1;
                    matchingCount++;
                }
            }
        });

        res.json({ 
            bookedCounts, 
            debug: {
                requestedDoctor: cleanName,
                totalInDate: appointments.length,
                matched: matchingCount
            }
        });
    } catch (error) {
        console.error("getAvailability Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getDoctorSchedule = async (req, res) => {
    try {
        const { doctorName } = req.query;
        if (!doctorName) return res.status(400).json({ message: "Doctor name is required" });

        const cleanName = String(doctorName).trim().replace(/^BS\.\s*/i, '');
        const nameRegex = new RegExp(`${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

        const appointments = await Appointment.find({ 
            doctorName: nameRegex
        });

        const processedAppointments = appointments.map(apt => {
            let displayStatus = apt.status;

            if (['completed', 'Completed'].includes(apt.status)) {
                displayStatus = 'Completed';
            } else if (['cancelled', 'Cancelled'].includes(apt.status)) {
                displayStatus = 'Cancelled';
            } else {
                const now = new Date();
                const options = { timeZone: 'Asia/Ho_Chi_Minh', hour12: false };
                const todayStr = now.toLocaleDateString('sv-SE', options);
                const timeStr = now.toLocaleTimeString('en-GB', options);
                const [h, m] = timeStr.split(':').map(Number);
                const currentTime = h * 60 + m;

                if (apt.date < todayStr) {
                    displayStatus = 'Cancelled';
                } else if (apt.date > todayStr) {
                    console.log(`[DEBUG] Future apt found: ${apt.date} > ${todayStr}. Setting Scheduled.`);
                    displayStatus = 'Scheduled';
                } else {
                    console.log(`[DEBUG] Today apt found: ${apt.date} === ${todayStr}. Checking deadline.`);

                    let isMorning = false;
                    if (apt.timeSlot) {
                        const startHour = parseInt(apt.timeSlot.split(':')[0]);
                        isMorning = startHour < 12;
                    } else {
                        isMorning = apt.session === 'Morning';
                    }


                    const deadline = isMorning ? 12 * 60 : 21 * 60;

                    if (currentTime > deadline) {
                        displayStatus = 'Cancelled';
                    } else {
                        displayStatus = 'Scheduled';
                    }
                }
            }

            return {
                ...apt._doc,
                displayStatus
            };
        });

        res.json(processedAppointments);
    } catch (error) {
        console.error("Doctor Schedule Fetch Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });
        res.json(appointment);
    } catch (error) {
        console.error("Appointment Detail Fetch Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const completeAppointment = async (req, res) => {
    try {
        const { patientName, date } = req.body;
        const appointment = await Appointment.findOneAndUpdate(
            { patientName: patientName, date: date, status: { $ne: 'cancelled' } },
            { status: 'completed' },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: 'No appointment found to complete' });
        }

        res.json({ message: 'Appointment status updated to completed', appointment });
    } catch (error) {
        console.error("Complete Appointment Error:", error);
        res.status(500).json({ message: 'Server error while completing appointment' });
    }
};

export const cancelAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { cancelReason } = req.body || {};

        if (!cancelReason || typeof cancelReason !== 'string' || !cancelReason.trim()) {
            return res.status(400).json({ message: 'Cancellation reason is required' });
        }

        const appointment = await Appointment.findById(appointmentId).lean();
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (['completed', 'Completed'].includes(appointment.status)) {
            return res.status(400).json({ message: 'Cannot cancel a completed appointment' });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: 'cancelled', cancelReason: cancelReason.trim() },
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json({ message: 'Appointment cancelled successfully', appointment: updatedAppointment });
    } catch (error) {
        console.error("Appointment Cancellation Error:", error);
        res.status(500).json({ message: 'Server error while cancelling appointment' });
    }
};

export const deleteAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const cancelReason =
            (req.body &&
                typeof req.body.cancelReason === 'string' &&
                req.body.cancelReason.trim()) ||
            'Patient cancelled due to mistake';

        const appointment = await Appointment.findById(appointmentId).lean();
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (['completed', 'Completed'].includes(appointment.status)) {
            return res.status(400).json({ message: 'Cannot cancel a completed appointment' });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: 'cancelled', cancelReason },
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json({ message: 'Appointment deleted/cancelled', appointment: updatedAppointment });
    } catch (error) {
        console.error('Delete Appointment Error:', error);
        res.status(500).json({ message: 'Server error while deleting appointment' });
    }
};

export const createAppointment = async (req, res) => {
    try {
        const { doctorName, date, timeSlot } = req.body;

        if (!doctorName || !date || !timeSlot) {
            return res.status(400).json({ message: 'Required information is missing' });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        const todayStr = toLocalDateString(new Date());
        if (String(date) < todayStr) {
            return res.status(400).json({ message: 'Past dates are not allowed' });
        }

        const cleanName = String(doctorName).trim().replace(/^BS\.\s*/i, '');
        const nameRegex = new RegExp(`${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
        const count = await Appointment.countDocuments({ 
            date: date, 
            status: { $in: ['approved', 'completed', 'pending', 'Confirmed', 'Completed', 'Approved', 'Pending'] },
            doctorName: nameRegex,
            timeSlot: timeSlot.trim()
        });
        
        if (count >= 1) {
            return res.status(400).json({ message: "This time slot is already booked for this doctor, please choose another slot." });
        }

        const newApt = new Appointment(req.body);
        newApt.appointmentSource = 'patient';
        newApt.status = 'approved';
        newApt.createdAt = Math.floor(Date.now() / 1000);
        await newApt.save();
        res.status(201).json({ message: "Booking successful", appointment: newApt });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
