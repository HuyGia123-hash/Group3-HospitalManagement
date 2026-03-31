import Appointment from '../models/Appointment.js';

const startAutoCancelTask = () => {
    console.log("Auto-cancel task started (checking every minute)...");
    setInterval(async () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const todayStr = now.toISOString().split('T')[0];

        if (hour === 12 && minute === 0) {
            try {
                const result = await Appointment.updateMany(
                    {
                        date: todayStr,
                        session: { $in: ['Morning', 'Sáng', 'morning'] },
                        status: { $in: ['Pending', 'pending', 'Approved', 'approved', 'Chờ xác nhận', 'Đã duyệt'] },
                    },
                    { status: 'Cancelled', cancelReason: 'Auto-cancelled after morning session deadline (12:00)' }
                );
                if (result.modifiedCount > 0) console.log(`Auto-cancelled ${result.modifiedCount} morning appointments.`);
            } catch (err) {
                console.error("Error in morning auto-cancel:", err);
            }
        }

        if (hour === 21 && minute === 0) {
            try {
                const result = await Appointment.updateMany(
                    {
                        date: todayStr,
                        session: { $in: ['Afternoon', 'Chiều', 'afternoon'] },
                        status: { $in: ['Pending', 'pending', 'Approved', 'approved', 'Chờ xác nhận', 'Đã duyệt'] },
                    },
                    { status: 'Cancelled', cancelReason: 'Auto-cancelled after afternoon session deadline (21:00)' }
                );
                if (result.modifiedCount > 0) console.log(`Auto-cancelled ${result.modifiedCount} afternoon appointments.`);
            } catch (err) {
                console.error("Error in afternoon auto-cancel:", err);
            }
        }
        
        if (hour === 0 && minute === 1) {
            try {
                const result = await Appointment.updateMany(
                    { 
                      date: { $lt: todayStr }, 
                      status: { $in: ['Pending', 'pending', 'Approved', 'approved', 'Chờ xác nhận', 'Đã duyệt', 'In Consultation', 'Đang khám'] } 
                    },
                    { status: 'Cancelled', cancelReason: 'Auto-cancelled due to date expiration' }
                );
                if (result.modifiedCount > 0) console.log(`Auto-cleaned ${result.modifiedCount} old appointments.`);
            } catch (err) {
                console.error("Error in midnight cleanup:", err);
            }
        }
    }, 60000); 
};

export default startAutoCancelTask;
