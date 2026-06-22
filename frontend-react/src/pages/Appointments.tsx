import { Calendar, Clock } from 'lucide-react';

export default function Appointments() {
  const appointments = [
    { id: 1, patient: "Sarah Johnson", time: "09:30 AM", status: "Upcoming", type: "Consultation" },
    { id: 2, patient: "Michael Chen", time: "11:00 AM", status: "Upcoming", type: "Follow-up" },
    { id: 3, patient: "Aisha Patel", time: "02:30 PM", status: "Completed", type: "Check-up" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">Appointments</h1>
      
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-6">Today's Schedule</h2>
        <div className="space-y-4">
          {appointments.map(app => (
            <div key={app.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-teal-50 transition-all">
              <div className="flex items-center gap-4">
                <Calendar className="w-8 h-8 text-teal-600" />
                <div>
                  <p className="font-semibold">{app.patient}</p>
                  <p className="text-gray-600">{app.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-medium">{app.time}</p>
                <span className={`text-sm px-4 py-1 rounded-full ${app.status === 'Upcoming' ? 'bg-teal-100 text-teal-700' : 'bg-green-100 text-green-700'}`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}