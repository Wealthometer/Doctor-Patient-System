import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  { title: "Today's Appointments", value: "12", color: "teal" },
  { title: "Active Patients", value: "248", color: "teal" },
  { title: "Avg. Wait Time", value: "18 min", color: "amber" },
];

const chartData = [
  { day: 'Mon', appointments: 8 },
  { day: 'Tue', appointments: 12 },
  { day: 'Wed', appointments: 15 },
  { day: 'Thu', appointments: 10 },
  { day: 'Fri', appointments: 18 },
];


export default function DoctorDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, Dr. Armani</h1>
        <p className="text-gray-600 mt-2">Here's what's happening in your clinic today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow transition-all">
            <p className="text-gray-500 text-lg">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-4">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="bg-white p-8 rounded-3xl shadow-sm">
          <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-700" />
            Weekly Appointments Trend
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line 
                type="natural" 
                dataKey="appointments" 
                stroke="#2563EB" 
                strokeWidth={5} 
                dot={{ fill: '#2563EB', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white p-8 rounded-3xl shadow-sm">
          <h3 className="font-semibold text-xl mb-6">Upcoming Today</h3>
          <div className="space-y-4">
            {[
              { patient: "Sarah Johnson", time: "09:30 AM", reason: "Follow-up" },
              { patient: "Michael Chen", time: "11:00 AM", reason: "Consultation" },
              { patient: "Aisha Patel", time: "02:30 PM", reason: "Check-up" }
            ].map((app, i) => (
              <div key={i} className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-all">
                <div>
                  <p className="font-medium">{app.patient}</p>
                  <p className="text-sm text-gray-600">{app.reason}</p>
                </div>
                <div className="text-right font-mono text-blue-700 font-semibold">
                  {app.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}