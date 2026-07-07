import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorApi, appointmentApi } from '../../api/services';
import type { AppointmentResponse } from '../../types';
import { Spinner, EmptyState, AppointmentBadge, Pagination, Modal } from '../../components/UI';
import toast from 'react-hot-toast';

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selected, setSelected] = useState<AppointmentResponse | null>(null);
  const [completeModal, setCompleteModal] = useState<AppointmentResponse | null>(null);
  const [cancelModal, setCancelModal] = useState<AppointmentResponse | null>(null);
  const [diagnosisSummary, setDiagnosisSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    if (!user) return;
    doctorApi.getByUserId(user.id)
      .then(d => {
        setDoctorId(d.id);
        return loadAppointments(d.id, 0);
      })
      .catch(() => toast.error('Could not load doctor profile'))
      .finally(() => setLoading(false));
  }, [user]);

  const loadAppointments = async (did: string, p: number, date?: string) => {
    if (date) {
      const res = await appointmentApi.getByDoctor(did, p); // filter client-side for selected date
      const filtered = res.content.filter(a => a.appointmentDate === date);
      setAppointments(filtered);
      setTotalPages(res.totalPages);
    } else {
      const res = await appointmentApi.getByDoctor(did, p);
      setAppointments(res.content);
      setTotalPages(res.totalPages);
    }
  };

  const handlePageChange = useCallback(async (p: number) => {
    if (!doctorId) return;
    setPage(p);
    setLoading(true);
    try { await loadAppointments(doctorId, p, filterDate); }
    finally { setLoading(false); }
  }, [doctorId, filterDate]);

  const handleConfirm = async (id: string) => {
    try {
      await appointmentApi.confirm(id);
      toast.success('Appointment confirmed');
      if (doctorId) await loadAppointments(doctorId, page, filterDate);
    } catch { toast.error('Failed to confirm'); }
  };

  const handleStart = async (id: string) => {
    try {
      await appointmentApi.start(id);
      toast.success('Appointment started');
      if (doctorId) await loadAppointments(doctorId, page, filterDate);
    } catch { toast.error('Failed to start appointment'); }
  };

  const handleComplete = async () => {
    if (!completeModal) return;
    setSubmitting(true);
    try {
      await appointmentApi.complete(completeModal.id, { diagnosisSummary, notes });
      toast.success('Appointment completed');
      setCompleteModal(null);
      setDiagnosisSummary('');
      setNotes('');
      if (doctorId) await loadAppointments(doctorId, page, filterDate);
    } catch { toast.error('Failed to complete appointment'); }
    finally { setSubmitting(false); }
  };

  const handleCancel = async () => {
    if (!cancelModal || !cancelReason) return;
    setSubmitting(true);
    try {
      await appointmentApi.cancel(cancelModal.id, cancelReason);
      toast.success('Appointment cancelled');
      setCancelModal(null);
      setCancelReason('');
      if (doctorId) await loadAppointments(doctorId, page, filterDate);
    } catch { toast.error('Failed to cancel'); }
    finally { setSubmitting(false); }
  };

  const handleDateFilter = async (date: string) => {
    setFilterDate(date);
    setPage(0);
    if (!doctorId) return;
    setLoading(true);
    try { await loadAppointments(doctorId, 0, date); }
    finally { setLoading(false); }
  };

  const actionButtons = (a: AppointmentResponse) => (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => setSelected(a)}>View</button>
      {a.status === 'SCHEDULED' && (
        <button className="btn btn-sm" style={{ background: 'var(--clr-accent-light)', color: 'var(--clr-accent)' }}
          onClick={() => handleConfirm(a.id)}>Confirm</button>
      )}
      {a.status === 'CONFIRMED' && (
        <button className="btn btn-sm" style={{ background: 'var(--clr-primary-light)', color: 'var(--clr-primary)' }}
          onClick={() => handleStart(a.id)}>Start</button>
      )}
      {a.status === 'IN_PROGRESS' && (
        <button className="btn btn-sm" style={{ background: 'var(--clr-success-light)', color: 'var(--clr-success)' }}
          onClick={() => { setCompleteModal(a); setDiagnosisSummary(''); setNotes(a.notes || ''); }}>Complete</button>
      )}
      {['SCHEDULED', 'CONFIRMED'].includes(a.status) && (
        <button className="btn btn-sm" style={{ background: 'var(--clr-danger-light)', color: 'var(--clr-danger)' }}
          onClick={() => { setCancelModal(a); setCancelReason(''); }}>Cancel</button>
      )}
    </div>
  );

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div><h1>Appointments</h1><p>Manage your patient appointments</p></div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <label style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>Filter by date:</label>
          <input type="date" className="form-control" style={{ width: 180 }} value={filterDate}
            onChange={e => handleDateFilter(e.target.value)} />
          {filterDate && <button className="btn btn-ghost btn-sm" onClick={() => handleDateFilter('')}>Clear</button>}
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {appointments.length === 0 ? (
            <EmptyState message={filterDate ? `No appointments on ${filterDate}` : 'No appointments found'} />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{a.appointmentDate}</div>
                      <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{a.startTime} – {a.endTime}</div>
                    </td>
                    <td>{a.patientName || a.patientId.slice(0, 8) + '…'}</td>
                    <td><span className="badge badge-info">{a.type.replace('_', ' ')}</span></td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason}</td>
                    <td><AppointmentBadge status={a.status} /></td>
                    <td>{actionButtons(a)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
      </div>

      {/* Appointment detail modal */}
      {selected && (
        <Modal open onClose={() => setSelected(null)} title="Appointment Details" maxWidth="580px">
          <div className="info-grid">
            <div className="info-item"><div className="info-label">Patient</div><div className="info-value">{selected.patientName || selected.patientId}</div></div>
            <div className="info-item"><div className="info-label">Date</div><div className="info-value">{selected.appointmentDate}</div></div>
            <div className="info-item"><div className="info-label">Time</div><div className="info-value">{selected.startTime} – {selected.endTime}</div></div>
            <div className="info-item"><div className="info-label">Type</div><div className="info-value">{selected.type.replace('_', ' ')}</div></div>
            <div className="info-item"><div className="info-label">Status</div><div className="info-value"><AppointmentBadge status={selected.status} /></div></div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="info-label">Reason for Visit</div>
            <p style={{ marginTop: 4, fontSize: 13, lineHeight: 1.6 }}>{selected.reason}</p>
          </div>
          {selected.notes && (
            <div style={{ marginTop: 12 }}>
              <div className="info-label">Notes</div>
              <p style={{ marginTop: 4, fontSize: 13, lineHeight: 1.6 }}>{selected.notes}</p>
            </div>
          )}
          {selected.diagnosisSummary && (
            <div style={{ marginTop: 12, padding: 12, background: 'var(--clr-success-light)', borderRadius: 8 }}>
              <div className="info-label" style={{ color: 'var(--clr-success)' }}>Diagnosis Summary</div>
              <p style={{ marginTop: 4, fontSize: 13 }}>{selected.diagnosisSummary}</p>
            </div>
          )}
          {selected.cancellationReason && (
            <div style={{ marginTop: 12, padding: 10, background: 'var(--clr-danger-light)', borderRadius: 8 }}>
              <div className="info-label" style={{ color: 'var(--clr-danger)' }}>Cancellation Reason</div>
              <p style={{ marginTop: 4, fontSize: 13 }}>{selected.cancellationReason}</p>
            </div>
          )}
          <div style={{ marginTop: 16 }}>{actionButtons(selected)}</div>
        </Modal>
      )}

      {/* Complete modal */}
      <Modal open={!!completeModal} onClose={() => setCompleteModal(null)} title="Complete Appointment"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setCompleteModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleComplete} disabled={submitting || !diagnosisSummary}>
            {submitting ? 'Completing…' : 'Complete Appointment'}
          </button>
        </>}>
        <div className="form-group">
          <label className="form-label">Diagnosis Summary <span style={{ color: 'var(--clr-danger)' }}>*</span></label>
          <textarea className="form-control" rows={4} value={diagnosisSummary}
            onChange={e => setDiagnosisSummary(e.target.value)}
            placeholder="Enter your diagnosis and findings…" />
        </div>
        <div className="form-group">
          <label className="form-label">Additional Notes</label>
          <textarea className="form-control" rows={3} value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Follow-up instructions, recommendations…" />
        </div>
      </Modal>

      {/* Cancel modal */}
      <Modal open={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Appointment"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setCancelModal(null)}>Back</button>
          <button className="btn btn-danger" onClick={handleCancel} disabled={submitting || !cancelReason}>
            {submitting ? 'Cancelling…' : 'Confirm Cancellation'}
          </button>
        </>}>
        <div className="form-group">
          <label className="form-label">Cancellation Reason <span style={{ color: 'var(--clr-danger)' }}>*</span></label>
          <textarea className="form-control" rows={3} value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            placeholder="Please provide a reason for cancelling…" />
        </div>
      </Modal>
    </div>
  );
}
