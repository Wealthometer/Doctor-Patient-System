import { useState } from 'react';

export default function AppointmentBooking() {
  const [formData, setFormData] = useState({
    doctor: '',
    date: '',
    time: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Appointment request sent successfully! (This will connect to backend later)");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Book New Appointment</h1>
      
      <div className="bg-white rounded-3xl p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-gray-700 mb-2">Select Doctor</label>
            <select 
              className="w-full p-4 border border-gray-200 rounded-2xl"
              value={formData.doctor}
              onChange={(e) => setFormData({...formData, doctor: e.target.value})}
            >
              <option value="">Choose Doctor</option>
              <option value="Dr. Smith">Dr. Smith (Cardiologist)</option>
              <option value="Dr. Patel">Dr. Patel (General Physician)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Date</label>
              <input 
                type="date" 
                className="w-full p-4 border border-gray-200 rounded-2xl"
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Time</label>
              <input 
                type="time" 
                className="w-full p-4 border border-gray-200 rounded-2xl"
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Reason for Visit</label>
            <textarea 
              className="w-full p-4 border border-gray-200 rounded-3xl h-32"
              placeholder="Describe your symptoms..."
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-teal-600 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-teal-700 transition-all"
          >
            Book Appointment
          </button>
        </form>
      </div>
    </div>
  );
}