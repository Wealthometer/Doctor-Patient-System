import { Users } from 'lucide-react';

export default function Patients() {
  const patients = [
    { name: "Sarah Johnson", age: 34, lastVisit: "2 days ago", condition: "Hypertension" },
    { name: "Michael Chen", age: 45, lastVisit: "1 week ago", condition: "Diabetes" },
    { name: "Aisha Patel", age: 28, lastVisit: "Today", condition: "Post Surgery" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">My Patients</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold">{patient.name}</h3>
            <p className="text-gray-600 mt-1">{patient.age} years old</p>
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500">Last Visit</p>
              <p className="font-medium">{patient.lastVisit}</p>
            </div>
            <p className="mt-4 text-blue-700 font-medium">{patient.condition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}