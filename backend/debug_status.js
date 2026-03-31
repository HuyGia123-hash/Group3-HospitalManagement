import mongoose from 'mongoose';
import Appointment from './src/models/Appointment.js';

async function check() {
    await mongoose.connect('mongodb://localhost:27017/hospital');
    
    const now = new Date();
    const options = { timeZone: 'Asia/Ho_Chi_Minh', hour12: false };
    const todayStr = now.toLocaleDateString('sv-SE', options);
    const timeStr = now.toLocaleTimeString('en-GB', options);
    const [h, m] = timeStr.split(':').map(Number);
    const currentTime = h * 60 + m;

    console.log('--- SYSTEM TIME ---');
    console.log('Now (Raw):', now);
    console.log('Today (sv-SE, Asia/Ho_Chi_Minh):', todayStr);
    console.log('Time (en-GB, Asia/Ho_Chi_Minh):', timeStr);
    console.log('Current Minutes:', currentTime);

    const apts = await Appointment.find({ patientName: 'Phan Gia Huy' });
    console.log('\n--- APPOINTMENTS FOR Phan Gia Huy ---');
    apts.forEach(apt => {
        console.log(`Date: ${apt.date}, TimeSlot: ${apt.timeSlot}, Status: ${apt.status}, Session: ${apt.session}`);
        
        let displayStatus = apt.status;
        if (apt.status === 'Đã khám' || apt.status === 'Đã hủy' || apt.status === 'completed' || apt.status === 'cancelled') {
            displayStatus = (apt.status === 'completed' || apt.status === 'Đã khám') ? 'Đã khám' : 'Đã hủy';
        } else {
            if (apt.date < todayStr) {
                displayStatus = 'Đã hủy (Past Date)';
            } else if (apt.date > todayStr) {
                displayStatus = 'Chưa thể khám được (Future Date)';
            } else {
                let isMorning = false;
                if (apt.timeSlot) {
                    const startHour = parseInt(apt.timeSlot.split(':')[0]);
                    isMorning = startHour < 12;
                } else {
                    isMorning = apt.session === 'Sáng';
                }
                const deadline = isMorning ? 11 * 60 : 19 * 60;
                const sessionStart = isMorning ? 7 * 60 : 13 * 60;

                if (currentTime > deadline) {
                    displayStatus = 'Đã hủy (Past Deadline)';
                } else if (currentTime < sessionStart) {
                    displayStatus = 'Chưa thể khám được (Before Session)';
                } else {
                    displayStatus = 'Khám bệnh';
                }
            }
        }
        console.log(`=> Calculated DisplayStatus: ${displayStatus}`);
    });

    await mongoose.disconnect();
}

check();
