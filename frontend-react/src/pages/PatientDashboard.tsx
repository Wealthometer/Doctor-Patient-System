import { Calendar, FileText, Bell, Clock } from 'lucide-react';

export default function PatientDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Welcome back, John Doe 👋</h1>
        <p className="text-gray-600 mt-2">Your health dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm">
          <p className="text-gray-500">Next Appointment</p>
          <p className="text-5xl font-bold text-teal-600 mt-4">Tomorrow</p>
          <p className="text-sm text-gray-600 mt-2">10:00 AM - Dr. Smith</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm">
          <p className="text-gray-500">Medical Reports</p>
          <p className="text-5xl font-bold text-teal-600 mt-4">7</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm">
          <p className="text-gray-500">Active Prescriptions</p>
          <p className="text-5xl font-bold text-teal-600 mt-4">4</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <h3 className="font-semibold text-xl mb-6">Upcoming Appointments</h3>
        <div className="space-y-4">
          {[
            { date: "Tomorrow", doctor: "Dr. Smith", reason: "Follow-up Check" },
            { date: "Next Week", doctor: "Dr. Patel", reason: "Lab Review" }
          ].map((item, i) => (
            <div key={i} className="p-6 bg-gray-50 rounded-2xl flex justify-between items-center">
              <div>
                <p className="font-medium">{item.date}</p>
                <p className="text-gray-600">{item.doctor} • {item.reason}</p>
              </div>
              <button className="bg-teal-600 text-white px-6 py-2 rounded-2xl text-sm">View Details</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}