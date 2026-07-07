import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientApi, appointmentApi, doctorApi } from '../../api/services';
import type { AppointmentResponse, DoctorResponse, AppointmentType, AvailableSlot } from '../../types';
import { Spinner, EmptyState, AppointmentBadge, Pagination, Modal } from '../../components/UI';
import toast from 'react-hot-toast';

const TYPES: AppointmentType[] = ['CONSULTATION', 'FOLLOW_UP', 'ROUTINE_CHECKUP', 'EMERGENCY', 'TELEMEDICINE', 'PROCEDURE', 'LAB_REVIEW'];

export default function PatientAppointments() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showBook, setShowBook] = useState(false);
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const [bookForm, setBookForm] = useState({
    doctorId: '', appointmentDate: '', startTime: '', endTime: '',
    type: 'CONSULTATION' as AppointmentType, reason: '', notes: '',
  });

  useEffect(() => {
    if (!user) return;
    patientApi.getByUserId(user.id)
      .then(p => {
        setPatientId(p.id);
        return loadAppointments(p.id, 0);
      })
      .catch(() => toast.error('Could not load patient profile'))
      .finally(() => setLoading(false));

    doctorApi.getAll(0, 100).then(r => setDoctors(r.content)).catch(() => {});
  }, [user]);

  const loadAppointments = async (pid: string, p: number) => {
    const res = await appointmentApi.getByPatient(pid, p);
    setAppointments(res.content);
    setTotalPages(res.totalPages);
  };

  const handlePageChange = useCallback(async (p: number) => {
    if (!patientId) return;
    setPage(p);
    setLoading(true);
    try { await loadAppointments(patientId, p); }
    finally { setLoading(false); }
  }, [patientId]);

  const fetchSlots = async (doctorId: string, date: string) => {
    if (!doctorId || !date) return;
    setSlotsLoading(true);
    try {
      const s = await appointmentApi.getDoctorSlots(doctorId, date);
      setSlots(s);
    } catch { setSlots([]); }
    finally { setSlotsLoading(false); }
  };

  const handleBook = async () => {
    if (!patientId) return;
    setBooking(true);
    try {
      await appointmentApi.book({ ...bookForm, patientId });
      toast.success('Appointment booked successfully!');
      setShowBook(false);
      setBookForm({ doctorId: '', appointmentDate: '', startTime: '', endTime: '', type: 'CONSULTATION', reason: '', notes: '' });
      await loadAppointments(patientId, 0);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to book appointment');
    } finally { setBooking(false); }
  };

  const handleCancel = async () => {
    if (!cancelTarget || !cancelReason) return;
    setCancelling(true);
    try {
      await appointmentApi.cancel(cancelTarget, cancelReason);
      toast.success('Appointment cancelled');
      setCancelTarget(null);
      setCancelReason('');
      if (patientId) await loadAppointments(patientId, page);
    } catch { toast.error('Failed to cancel'); }
    finally { setCancelling(false); }
  };

  if (loading) return <Spinner />;

  const availableSlots = slots.filter(s => s.available);

  return (
    <div>
      <div className="page-header">
        <div><h1>My Appointments</h1><p>View and manage your appointments</p></div>
        <button className="btn btn-primary" onClick={() => setShowBook(true)}>+ Book Appointment</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {appointments.length === 0 ? (
            <EmptyState message="No appointments found. Book your first appointment!" />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Doctor</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{a.appointmentDate}</div>
                      <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{a.startTime} – {a.endTime}</div>
                    </td>
                    <td>Dr. {a.doctorName || '—'}</td>
                    <td><span className="badge badge-info">{a.type.replace('_', ' ')}</span></td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason}</td>
                    <td><AppointmentBadge status={a.status} /></td>
                    <td>
                      {['SCHEDULED', 'CONFIRMED'].includes(a.status) && (
                        <button className="btn btn-sm" style={{ background: 'var(--clr-danger-light)', color: 'var(--clr-danger)' }}
                          onClick={() => setCancelTarget(a.id)}>Cancel</button>
                      )}
                      {a.status === 'COMPLETED' && a.diagnosisSummary && (
                        <span style={{ fontSize: 12, color: 'var(--clr-text-muted)' }} title={a.diagnosisSummary}>📋 Has diagnosis</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
      </div>

      {/* Book appointment modal */}
      <Modal open={showBook} onClose={() => setShowBook(false)} title="Book Appointment" maxWidth="560px"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowBook(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleBook} disabled={booking || !bookForm.reason || !bookForm.doctorId || !bookForm.startTime}>
            {booking ? 'Booking…' : 'Book Appointment'}
          </button>
        </>}>

        <div className="form-group">
          <label className="form-label">Doctor <span style={{ color: 'var(--clr-danger)' }}>*</span></label>
          <select className="form-control" value={bookForm.doctorId}
            onChange={e => { setBookForm(p => ({ ...p, doctorId: e.target.value, startTime: '', endTime: '' })); setSlots([]); }}>
            <option value="">Select a doctor…</option>
            {doctors.filter(d => d.status === 'ACTIVE').map(d => (
              <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName} — {d.specialization}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Appointment Type <span style={{ color: 'var(--clr-danger)' }}>*</span></label>
          <select className="form-control" value={bookForm.type}
            onChange={e => setBookForm(p => ({ ...p, type: e.target.value as AppointmentType }))}>
            {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Date <span style={{ color: 'var(--clr-danger)' }}>*</span></label>
          <input type="date" className="form-control" value={bookForm.appointmentDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => {
              const d = e.target.value;
              setBookForm(p => ({ ...p, appointmentDate: d, startTime: '', endTime: '' }));
              if (bookForm.doctorId) fetchSlots(bookForm.doctorId, d);
            }} />
        </div>

        {availableSlots.length > 0 && (
          <div className="form-group">
            <label className="form-label">Available Time Slots</label>
            <div className="chip-row">
              {availableSlots.map(s => (
                <div
                  key={s.startTime}
                  className={`chip ${bookForm.startTime === s.startTime ? 'active' : ''}`}
                  onClick={() => setBookForm(p => ({ ...p, startTime: s.startTime, endTime: s.endTime }))}
                >
                  {s.startTime} – {s.endTime}
                </div>
              ))}
            </div>
          </div>
        )}

        {slotsLoading && <div style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginBottom: 12 }}>Loading slots…</div>}

        {!availableSlots.length && bookForm.appointmentDate && bookForm.doctorId && !slotsLoading && (
          <div className="form-grid mb-4">
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input type="time" className="form-control" value={bookForm.startTime}
                onChange={e => setBookForm(p => ({ ...p, startTime: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input type="time" className="form-control" value={bookForm.endTime}
                onChange={e => setBookForm(p => ({ ...p, endTime: e.target.value }))} />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Reason for Visit <span style={{ color: 'var(--clr-danger)' }}>*</span></label>
          <textarea className="form-control" rows={3} value={bookForm.reason}
            onChange={e => setBookForm(p => ({ ...p, reason: e.target.value }))}
            placeholder="Describe your symptoms or reason for the visit…" />
        </div>

        <div className="form-group">
          <label className="form-label">Additional Notes</label>
          <textarea className="form-control" rows={2} value={bookForm.notes}
            onChange={e => setBookForm(p => ({ ...p, notes: e.target.value }))}
            placeholder="Any additional information for the doctor…" />
        </div>
      </Modal>

      {/* Cancel modal */}
      <Modal open={!!cancelTarget} onClose={() => { setCancelTarget(null); setCancelReason(''); }} title="Cancel Appointment"
        footer={<>
          <button className="btn btn-ghost" onClick={() => { setCancelTarget(null); setCancelReason(''); }}>Back</button>
          <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling || !cancelReason}>
            {cancelling ? 'Cancelling…' : 'Cancel Appointment'}
          </button>
        </>}>
        <div className="form-group">
          <label className="form-label">Reason for cancellation <span style={{ color: 'var(--clr-danger)' }}>*</span></label>
          <textarea className="form-control" rows={3} value={cancelReason}
            onChange={e => setCancelReason(e.target.value)} placeholder="Please explain why you're cancelling…" />
        </div>
      </Modal>
    </div>
  );
}
