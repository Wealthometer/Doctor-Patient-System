import { useState, useEffect, useCallback } from 'react';
import { appointmentApi } from '../../api/services';
import type { AppointmentResponse } from '../../types';
import { Spinner, EmptyState, AppointmentBadge, Pagination, Modal, Confirm } from '../../components/UI';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['ALL', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus] = useState('ALL');
  const [selected, setSelected] = useState<AppointmentResponse | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      // Load appointments by page — there's no global "all" filter endpoint with status,
      // so we load all and let table do filtering (or extend with doctor/patient filter later)
      // Using a wide patient approach: just GET /appointments/stats and show table from patients list
      // For admin we load from billing or use a broad approach
      // Since there's no GET /appointments (all), we show stats + note
      const stats = await appointmentApi.stats();
      // Since backend doesn't have a GET all appointments endpoint for admin,
      // we'll show the stats and a note about using doctor/patient filter
      setAppointments([]); // placeholder
      setTotalPages(0);
      setLoading(false);
      return stats;
    } catch {
      toast.error('Failed to load');
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const handleCancel = async () => {
    if (!cancelTarget || !cancelReason) return;
    setCancelling(true);
    try {
      await appointmentApi.cancel(cancelTarget, cancelReason);
      toast.success('Appointment cancelled');
      setCancelTarget(null);
      setCancelReason('');
      load(page);
    } catch { toast.error('Failed to cancel'); }
    finally { setCancelling(false); }
  };

  const handleConfirm = async (id: string) => {
    try {
      await appointmentApi.confirm(id);
      toast.success('Appointment confirmed');
      load(page);
    } catch { toast.error('Failed to confirm'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Appointments</h1>
          <p>View and manage all appointments across the system</p>
        </div>
      </div>

      <div className="chip-row mb-6">
        {STATUS_OPTIONS.map(s => (
          <div key={s} className={`chip ${filterStatus === s ? 'active' : ''}`}>{s}</div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Appointments</span>
        </div>
        <div className="table-wrapper">
          {loading ? <Spinner /> : appointments.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: 14 }}>
                Use the Patient or Doctor pages to view appointments filtered by person,<br />
                or search a specific doctor/patient's appointments.
              </p>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: 13, marginTop: 8 }}>
                The backend supports <code>/api/v1/appointments/patient/:id</code> and <code>/api/v1/appointments/doctor/:id</code>
              </p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Patient</th>
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
                    <td>{a.patientName || a.patientId.slice(0, 8) + '…'}</td>
                    <td>{a.doctorName || a.doctorId.slice(0, 8) + '…'}</td>
                    <td><span className="badge badge-info">{a.type.replace('_', ' ')}</span></td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason}</td>
                    <td><AppointmentBadge status={a.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(a)}>View</button>
                        {a.status === 'SCHEDULED' && (
                          <button className="btn btn-sm" style={{ background: 'var(--clr-accent-light)', color: 'var(--clr-accent)' }}
                            onClick={() => handleConfirm(a.id)}>Confirm</button>
                        )}
                        {['SCHEDULED', 'CONFIRMED'].includes(a.status) && (
                          <button className="btn btn-sm" style={{ background: 'var(--clr-danger-light)', color: 'var(--clr-danger)' }}
                            onClick={() => setCancelTarget(a.id)}>Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Appointment detail modal */}
      {selected && (
        <Modal open onClose={() => setSelected(null)} title="Appointment Details">
          <div className="info-grid">
            <div className="info-item"><div className="info-label">Date</div><div className="info-value">{selected.appointmentDate}</div></div>
            <div className="info-item"><div className="info-label">Time</div><div className="info-value">{selected.startTime} – {selected.endTime}</div></div>
            <div className="info-item"><div className="info-label">Type</div><div className="info-value">{selected.type}</div></div>
            <div className="info-item"><div className="info-label">Status</div><div className="info-value"><AppointmentBadge status={selected.status} /></div></div>
            <div className="info-item"><div className="info-label">Patient</div><div className="info-value">{selected.patientName || selected.patientId}</div></div>
            <div className="info-item"><div className="info-label">Doctor</div><div className="info-value">{selected.doctorName || selected.doctorId}</div></div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="info-label">Reason</div>
            <p style={{ marginTop: 4, fontSize: 13, lineHeight: 1.6 }}>{selected.reason}</p>
          </div>
          {selected.notes && (
            <div style={{ marginTop: 12 }}>
              <div className="info-label">Notes</div>
              <p style={{ marginTop: 4, fontSize: 13, lineHeight: 1.6 }}>{selected.notes}</p>
            </div>
          )}
          {selected.diagnosisSummary && (
            <div style={{ marginTop: 12 }}>
              <div className="info-label">Diagnosis Summary</div>
              <p style={{ marginTop: 4, fontSize: 13, lineHeight: 1.6 }}>{selected.diagnosisSummary}</p>
            </div>
          )}
          {selected.cancellationReason && (
            <div style={{ marginTop: 12, padding: 10, background: 'var(--clr-danger-light)', borderRadius: 8 }}>
              <div className="info-label" style={{ color: 'var(--clr-danger)' }}>Cancellation Reason</div>
              <p style={{ marginTop: 4, fontSize: 13 }}>{selected.cancellationReason}</p>
            </div>
          )}
        </Modal>
      )}

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
            onChange={e => setCancelReason(e.target.value)}
            placeholder="Please provide a reason…" />
        </div>
      </Modal>
    </div>
  );
}
