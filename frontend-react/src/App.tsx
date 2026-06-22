import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DoctorDashboard from './pages/DoctorDashboard';
import Appointments from './pages/Appointments';
import Patients from './pages/Patients';
import Prescriptions from './pages/Prescriptions';
import PatientDashboard from './pages/PatientDashboard';
import AppointmentBooking from './pages/AppointmentBooking';
// ... other imports
function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          
          <main className="flex-1 overflow-auto p-8">
            <Routes>
              <Route path="/" element={<DoctorDashboard />} />
              <Route path="/dashboard" element={<DoctorDashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/patient-dashboard" element={<PatientDashboard />} />
              <Route path="/book-appointment" element={<AppointmentBooking />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;