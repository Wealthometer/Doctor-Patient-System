import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { appointmentApi, doctorApi, patientApi } from '../../api/services';
import {
  Table, Badge, Button, Modal, Input, Select, Textarea,
  SearchBar, Pagination, Card, StatCard, Spinner,
} from '../../components/common';
import { formatDate, formatTime } from '../../utils';
import { useAppSelector } from '../../hooks/redux';
import { Plus, RefreshCw, Eye, CheckCircle, XCircle, Play, Check, Calendar, Clock } from 'lucide-react';
import type {
  AppointmentResponse, BookAppointmentRequest, CancelAppointmentRequest,
  DoctorResponse, PatientResponse, AvailableSlot,
} from '../../types';

const TYPE_OPTIONS = [
  { value: 'CONSULTATION', label: 'Consultation' },
  { value: 'FOLLOW_UP', label: 'Follow-Up' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'ROUTINE_CHECKUP', label: 'Routine Checkup' },
  { value: 'PROCEDURE', label: 'Procedure' },
  { value: 'LAB_TEST', label: 'Lab Test' },
];

export const AppointmentsPage: React.FC = () => {
  const user = useAppSelector(s => s.auth.user);
  const [searchParams] = useSearchParams();
  const filterPatientId = searchParams.get('patientId');

  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<AppointmentResponse | null>(null);
  const [showBook, setShowBook] = useState(false);
  const [showCancel, setShowCancel] = useState<AppointmentResponse | null>(null);
  const [showComplete, setShowComplete] = useState<AppointmentResponse | null>(null);
  const [bookLoading, setBookLoading] = useState(false);
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [myPatient, setMyPatient] = useState<PatientResponse | null>(null);
  const [myDoctorId, setMyDoctorId] = useState<string | null>(null);

  const { register: bookReg, handleSubmit: bookSubmit, watch, reset: bookReset, setValue } = useForm<BookAppointmentRequest>();
  const { register: cancelReg, handleSubmit: cancelSubmit, reset: cancelReset } = useForm<CancelAppointmentRequest>();
  const { register: completeReg, handleSubmit: completeSubmit, reset: completeReset } = useForm<{ diagnosisSummary: string }>();

  const watchDoctor = watch('doctorId');
  const watchDate = watch('appointmentDate');

  const isAdmin = user?.role === 'ADMIN';
  const isDoctor = user?.role === 'DOCTOR';
  const isPatient = user?.role === 'PATIENT';

  // Load my profile on mount
  useEffect(() => {
    if (isPatient && user) {
      patientApi.getByUserId(user.id).then(setMyPatient).catch(() => {});
    }
    if (isDoctor && user) {
      doctorApi.getByUserId(user.id).then(d => setMyDoctorId(d.id)).catch(() => {});
    }
    doctorApi.getAll(0, 100).then(res => setDoctors(res.content)).catch(() => {});
  }, [user, isPatient, isDoctor]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (filterPatientId) {
        res = await appointmentApi.getByPatient(filterPatientId, page);
      } else if (isPatient && myPatient) {
        res = await appointmentApi.getByPatient(myPatient.id, page);
      } else if (isDoctor && myDoctorId) {
        res = await appointmentApi.getByDoctor(myDoctorId, page);
      } else {
        // admin or nurse: fetch all (use doctor endpoint with a broad search, or aggregate)
        // API doesn't have a getAll, so we show all for admin via patient stats trick
        // We'll fetch from patient perspective using the API
        res = await appointmentApi.getByDoctor('', page).catch(() =>
          appointmentApi.getByPatient('', page)
        );
      }
      setAppointments(res?.content ?? []);
      setTotal(res?.totalElements ?? 0);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  }, [page, myPatient, myDoctorId, filterPatientId, isPatient, isDoctor]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // Load slots when doctor+date change
  useEffect(() => {
    if (watchDoctor && watchDate) {
      setSlotsLoading(true);
      appointmentApi.getAvailableSlots(watchDoctor, watchDate)
        .then(setSlots)
        .catch(() => setSlots([]))
        .finally(() => setSlotsLoading(false));
    }
  }, [watchDoctor, watchDate]);

  const handleBook = async (data: BookAppointmentRequest) => {
    setBookLoading(true);
    try {
      const payload = { ...data };
      if (isPatient && myPatient) payload.patientId = myPatient.id;
      await appointmentApi.book(payload);
      toast.success('Appointment booked');
      setShowBook(false);
      bookReset();
      fetchAppointments();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to book appointment');
    } finally { setBookLoading(false); }
  };

  const handleConfirm = async (id: string) => {
    try { await appointmentApi.confirm(id); toast.success('Confirmed'); setSelected(null); fetchAppointments(); }
    catch { toast.error('Failed to confirm'); }
  };

  const handleStart = async (id: string) => {
    try { await appointmentApi.start(id); toast.success('Started'); setSelected(null); fetchAppointments(); }
    catch { toast.error('Failed to start'); }
  };

  const handleCancel = async (data: CancelAppointmentRequest) => {
    if (!showCancel) return;
    try { await appointmentApi.cancel(showCancel.id, data); toast.success('Cancelled'); setShowCancel(null); cancelReset(); setSelected(null); fetchAppointments(); }
    catch { toast.error('Failed to cancel'); }
  };

  const handleComplete = async (data: { diagnosisSummary: string }) => {
    if (!showComplete) return;
    try { await appointmentApi.complete(showComplete.id, data); toast.success('Marked complete'); setShowComplete(null); completeReset(); setSelected(null); fetchAppointments(); }
    catch { toast.error('Failed to complete'); }
  };

  const columns = [
    { key: 'appointmentNumber', header: 'Ref #', render: (a: AppointmentResponse) => <span className="font-mono text-xs text-slate-500">{a.appointmentNumber}</span> },
    {
      key: 'patient', header: 'Patient',
      render: (a: AppointmentResponse) => <span className="text-sm font-medium">{a.patientName}</span>,
    },
    {
      key: 'doctor', header: 'Doctor',
      render: (a: AppointmentResponse) => <div><p className="text-sm">Dr. {a.doctorName}</p><p className="text-xs text-slate-400">{a.department}</p></div>,
    },
    {
      key: 'date', header: 'Date & Time',
      render: (a: AppointmentResponse) => (
        <div>
          <p className="text-sm font-medium">{formatDate(a.appointmentDate)}</p>
          <p className="text-xs text-slate-400">{formatTime(a.startTime)} – {formatTime(a.endTime)}</p>
        </div>
      ),
    },
    { key: 'type', header: 'Type', render: (a: AppointmentResponse) => <span className="text-sm">{a.type?.replace(/_/g, ' ')}</span> },
    { key: 'status', header: 'Status', render: (a: AppointmentResponse) => <Badge status={a.status} /> },
    {
      key: 'actions', header: '',
      render: (a: AppointmentResponse) => (
        <Button variant="ghost" size="sm" icon={<Eye className="w-3.5 h-3.5" />} onClick={e => { e.stopPropagation(); setSelected(a); }}>View</Button>
      ),
    },
  ];

  const canBook = isPatient || isAdmin || isDoctor;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="text-slate-500 text-sm">{total} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchAppointments}>Refresh</Button>
          {canBook && (
            <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowBook(true)}>Book Appointment</Button>
          )}
        </div>
      </div>

      <Card>
        <Table columns={columns} data={appointments} loading={loading} onRowClick={setSelected} />
        {total > 20 && <Pagination page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} totalElements={total} size={20} />}
      </Card>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Appointment Details" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ['Reference #', selected.appointmentNumber],
                ['Patient', selected.patientName],
                ['Doctor', `Dr. ${selected.doctorName}`],
                ['Department', selected.department],
                ['Date', formatDate(selected.appointmentDate)],
                ['Time', `${formatTime(selected.startTime)} – ${formatTime(selected.endTime)}`],
                ['Type', selected.type?.replace(/_/g, ' ')],
                ['Status', ''],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
                  {label === 'Status' ? <Badge status={selected.status} /> : <p className="text-slate-900">{value}</p>}
                </div>
              ))}
            </div>
            {selected.reason && (
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Reason</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{selected.reason}</p>
              </div>
            )}
            {selected.diagnosisSummary && (
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Diagnosis Summary</p>
                <p className="text-sm text-slate-700 bg-emerald-50 rounded-lg p-3 border border-emerald-100">{selected.diagnosisSummary}</p>
              </div>
            )}
            {selected.cancellationReason && (
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Cancellation Reason</p>
                <p className="text-sm text-slate-700 bg-red-50 rounded-lg p-3 border border-red-100">{selected.cancellationReason}</p>
              </div>
            )}
            {/* Action buttons based on status */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              {selected.status === 'SCHEDULED' && (isAdmin || isDoctor) && (
                <Button size="sm" icon={<CheckCircle className="w-3.5 h-3.5" />} onClick={() => handleConfirm(selected.id)}>Confirm</Button>
              )}
              {selected.status === 'CONFIRMED' && (isAdmin || isDoctor) && (
                <Button size="sm" icon={<Play className="w-3.5 h-3.5" />} onClick={() => handleStart(selected.id)}>Start Session</Button>
              )}
              {selected.status === 'IN_PROGRESS' && (isAdmin || isDoctor) && (
                <Button size="sm" variant="primary" icon={<Check className="w-3.5 h-3.5" />} onClick={() => { setShowComplete(selected); setSelected(null); }}>Complete</Button>
              )}
              {['SCHEDULED', 'CONFIRMED'].includes(selected.status) && (
                <Button size="sm" variant="danger" icon={<XCircle className="w-3.5 h-3.5" />} onClick={() => { setShowCancel(selected); setSelected(null); }}>Cancel</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Book appointment modal */}
      <Modal open={showBook} onClose={() => { setShowBook(false); bookReset(); setSlots([]); }} title="Book Appointment" size="lg">
        <form onSubmit={bookSubmit(handleBook)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {!isPatient && (
              <Input label="Patient ID" {...bookReg('patientId', { required: 'Required' })} placeholder="UUID" className="col-span-2" />
            )}
            <Select
              label="Doctor"
              options={doctors.map(d => ({ value: d.id, label: `Dr. ${d.firstName} ${d.lastName} – ${d.specialization}` }))}
              {...bookReg('doctorId', { required: 'Required' })}
              className="col-span-2"
            />
            <Input label="Appointment Date" type="date" {...bookReg('appointmentDate', { required: 'Required' })}
              min={new Date().toISOString().split('T')[0]} />
            <Select label="Type" options={TYPE_OPTIONS} {...bookReg('type', { required: 'Required' })} />
          </div>

          {/* Time slots */}
          {watchDoctor && watchDate && (
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Available Time Slots</label>
              {slotsLoading ? <Spinner className="py-4" /> : (
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {slots.filter(s => s.available).map(slot => (
                    <button
                      key={slot.startTime}
                      type="button"
                      onClick={() => { setValue('startTime', slot.startTime); setValue('endTime', slot.endTime); }}
                      className="text-sm px-3 py-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-slate-700"
                    >
                      {formatTime(slot.startTime)}
                    </button>
                  ))}
                  {slots.filter(s => s.available).length === 0 && (
                    <p className="col-span-3 text-sm text-slate-400 text-center py-2">No available slots for this date</p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Input label="Start Time" type="time" {...bookReg('startTime', { required: 'Required' })} />
                <Input label="End Time" type="time" {...bookReg('endTime', { required: 'Required' })} />
              </div>
            </div>
          )}

          <Textarea label="Reason for Visit" {...bookReg('reason', { required: 'Required' })} placeholder="Describe the reason for this appointment..." />
          <Textarea label="Notes (optional)" {...bookReg('notes')} placeholder="Additional notes..." />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => { setShowBook(false); bookReset(); setSlots([]); }}>Cancel</Button>
            <Button type="submit" loading={bookLoading} icon={<Calendar className="w-4 h-4" />}>Book Appointment</Button>
          </div>
        </form>
      </Modal>

      {/* Cancel modal */}
      <Modal open={!!showCancel} onClose={() => { setShowCancel(null); cancelReset(); }} title="Cancel Appointment" size="sm">
        <form onSubmit={cancelSubmit(handleCancel)} className="space-y-4">
          <p className="text-sm text-slate-600">Please provide a reason for cancelling this appointment.</p>
          <Textarea label="Cancellation Reason" {...cancelReg('cancellationReason', { required: 'Required' })} rows={4} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => { setShowCancel(null); cancelReset(); }}>Back</Button>
            <Button type="submit" variant="danger">Confirm Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Complete modal */}
      <Modal open={!!showComplete} onClose={() => { setShowComplete(null); completeReset(); }} title="Complete Appointment" size="sm">
        <form onSubmit={completeSubmit(handleComplete)} className="space-y-4">
          <Textarea label="Diagnosis Summary" {...completeReg('diagnosisSummary')} placeholder="Enter diagnosis summary..." rows={5} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => { setShowComplete(null); completeReset(); }}>Back</Button>
            <Button type="submit" icon={<Check className="w-4 h-4" />}>Mark Complete</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
