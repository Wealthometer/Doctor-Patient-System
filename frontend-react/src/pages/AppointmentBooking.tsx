import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentApi, doctorApi, patientApi } from '@/api/services';
import { useAppSelector } from '@/store';
import type { AppointmentType, AvailableSlot, Doctor, Patient } from '@/types';
import toast from 'react-hot-toast';

const appointmentTypes: AppointmentType[] = [
  'CONSULTATION',
  'FOLLOW_UP',
  'ROUTINE_CHECKUP',
  'EMERGENCY',
  'TELEMEDICINE',
  'PROCEDURE',
  'LAB_REVIEW',
];

export default function AppointmentBooking() {
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    slot: '',
    type: 'CONSULTATION' as AppointmentType,
    reason: '',
    notes: '',
  });

  useEffect(() => {
    const loadBaseData = async () => {
      if (!user?.id) return;

      try {
        const [patientRes, doctorsRes] = await Promise.all([
          patientApi.getByUserId(user.id),
          doctorApi.getAll({ size: 100, sort: 'lastName' }),
        ]);
        setPatient(patientRes.data);
        setDoctors(doctorsRes.data.content.filter((doctor) => doctor.status === 'ACTIVE'));
      } catch {
        toast.error('Could not load booking data');
      } finally {
        setLoading(false);
      }
    };

    loadBaseData();
  }, [user?.id]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!formData.doctorId || !formData.appointmentDate) {
        setSlots([]);
        return;
      }

      try {
        const { data } = await appointmentApi.getAvailableSlots(formData.doctorId, formData.appointmentDate);
        setSlots(data);
      } catch {
        setSlots([]);
        toast.error('Could not load available slots');
      }
    };

    loadSlots();
  }, [formData.appointmentDate, formData.doctorId]);

  const selectedSlot = useMemo(() => {
    if (!formData.slot) return null;
    const [startTime, endTime] = formData.slot.split('|');
    return { startTime, endTime };
  }, [formData.slot]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!patient || !selectedSlot) {
      toast.error('Choose a doctor, date, and available slot');
      return;
    }

    setSubmitting(true);
    try {
      await appointmentApi.book({
        patientId: patient.id,
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        type: formData.type,
        reason: formData.reason,
        notes: formData.notes || undefined,
      });
      toast.success('Appointment booked');
      navigate('/patient/appointments');
    } catch {
      toast.error('Could not book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-sm text-gray-500 mt-1">Select a doctor and one of their available appointment slots.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-gray-700">Doctor</span>
          <select
            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.doctorId}
            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value, slot: '' })}
            disabled={loading}
            required
          >
            <option value="">Choose doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.fullName || `${doctor.firstName} ${doctor.lastName}`} - {doctor.specialization}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Date</span>
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.appointmentDate}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value, slot: '' })}
              required
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Visit type</span>
            <select
              className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as AppointmentType })}
            >
              {appointmentTypes.map((type) => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-gray-700">Available slot</span>
          <select
            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.slot}
            onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
            disabled={!formData.doctorId || !formData.appointmentDate}
            required
          >
            <option value="">Choose slot</option>
            {slots.map((slot) => (
              <option key={`${slot.startTime}-${slot.endTime}`} value={`${slot.startTime}|${slot.endTime}`} disabled={!slot.available}>
                {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}{slot.available ? '' : ' unavailable'}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-gray-700">Reason for visit</span>
          <textarea
            className="w-full p-3 text-sm border border-gray-300 rounded-lg h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the reason for this appointment"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            required
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-gray-700">Notes</span>
          <textarea
            className="w-full p-3 text-sm border border-gray-300 rounded-lg h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </label>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => navigate('/patient/appointments')} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {submitting ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
}
