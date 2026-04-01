Project description:
  This project was developed to address the challenge of centralized data management in a healthcare environment. The system provides clear access control for three main groups: Patients, Doctors, and Nurses, ensuring security and specialization in each operation.

Main Modules:
  Patients: Proactively schedule appointments, track health records, and evaluate service quality.
  Doctors: Manage patient lists, conduct online consultations and prescribe medications.
  Nurses: Receive walk-in patients, measure vital signs, and coordinate appointments in real-time.

Key Features
  User Authentication: Secure login based on roles (Role-based Access Control).
  Appointment Management: Schedule appointments, cancel appointments, and automatically update doctor availability.
  Electronic Medical Records: Store patient history, vital signs, and prescriptions.
  Feedback system: Patients leave feedback and doctors can respond directly.
  Automated tasks: Background jobs automatically cancel overdue or unattended appointments.

Installation guide:
Install path
  System request
  Node.js: v18.x trở lên.

Steps:

1.Download the source code:
Type
  git clone <your-repo-url> 
  cd hospital 
Backend settings:
  cd backend 
  install npm 
  start npm 
Server will run at: http://localhost:5000

Frontend settings:
  cd ../frontend ->
  install npm ->
  start npm ->
Application will run at: http://localhost:3000

Technology used:
  Frontend
  React 19
  React Router 7
  Axios
  Lucide React
  React Toastify

Backend and Database
  Node.js
  Express 5
  MongoDB
  Mongoose
