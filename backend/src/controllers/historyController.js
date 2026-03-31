import History from '../models/History.js';

export const getHistory = async (req, res) => {
    try {
        const { patientName } = req.query;
        let query = {};
        if (patientName) {
            query.patientName = patientName;
        }
        const histories = await History.find(query).sort({ date: -1 });
        res.json(histories);
    } catch (error) {
        res.status(500).json({ message: "Server error while fetching medical history" });
    }
};

export const createHistory = async (req, res) => {
    try {
        const newHistory = new History({
            historyId: req.body.historyId || 'HIS' + Math.floor(Math.random() * 100000),
            patientName: req.body.patientName,
            date: req.body.date || new Date().toISOString().split('T')[0],
            diagnosis: req.body.diagnosis,
            doctorName: req.body.doctorName,
            vitals: req.body.vitals,
            prescription: req.body.prescription || req.body.toa_thuoc,
            symptoms: req.body.symptoms
        });
        await newHistory.save();
        res.status(201).json({ message: "Medical history saved successfully", history: newHistory });
    } catch (error) {
        res.status(500).json({ message: "Error saving medical history", error: error.message });
    }
};
