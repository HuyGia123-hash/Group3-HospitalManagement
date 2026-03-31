const createAppointment = async (appointmentData) => {
  return { ...appointmentData, status: 'pending', id: Date.now() };
};

const getPatientAppointments = async (patientEmail) => {
  return [];
};

const cancelAppointment = async (appointmentId, reason) => {
  return { id: appointmentId, status: 'cancelled', reason };
};

module.exports = {
  createAppointment,
  getPatientAppointments,
  cancelAppointment
};
