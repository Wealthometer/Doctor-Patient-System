import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi, appointmentApi, prescriptionApi, billingApi } from '../../api/services';
import { StatCard, Card, Badge, Button, Spinner, Avatar } from '../../components/common';
import { formatDate, formatTime, formatCurrency } from '../../utils';
import { useAppSelector } from '../../hooks/redux';
import { Calendar, ClipboardList, CreditCard, Heart, ChevronRight, Clock, AlertCircle, Plus } from 'lucide-react';
import type { PatientResponse, AppointmentResponse, Prescription, InvoiceResponse } from '../../types';

export const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector(s => s.auth.user);

  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [upcomingAppts, setUpcomingAppts] = useState<AppointmentResponse[]>([]);
  const [activePrescriptions, setActivePrescriptions] = useState<Prescription[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const pat = await patientApi.getByUserId(user.id);
        setPatient(pat);

        const [apptRes, prescRes, billRes] = await Promise.all([
          appointmentApi.getByPatient(pat.id, 0, 50),
          prescriptionApi.getActiveByPatient(pat.id, 0, 10),
          billingApi.getPatientInvoices(pat.id, 0, 20),
        ]);

        setUpcomingAppts(
          apptRes.content
            .filter(a => ['SCHEDULED', 'CONFIRMED'].includes(a.status))
            .slice(0, 5)
        );
        setActivePrescriptions(prescRes.content.slice(0, 5));
        setPendingInvoices(
          billRes.content
            .filter(i => ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'].includes(i.status))
            .slice(0, 3)
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <Spinner />;

  if (!patient) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-16 text-center">
        <Heart className="w-14 h-14 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Complete Your Profile</h2>
        <p className="text-slate-500 mb-6 text-sm">Please have an admin create your patient profile to access all features.</p>
      </div>
    );
  }

  const totalBalance = pendingInvoices.reduce((s, i) => s + i.balanceAmount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <Avatar name={patient.fullName} size="lg" />
          <div>
            <p className="text-blue-100 text-sm">Patient ID: {patient.patientCode}</p>
            <h1 className="text-2xl font-bold">{patient.fullName}</h1>
            <div className="flex items-center gap-3 mt-1 text-blue-100 text-sm">
              <span>{patient.age}y · {patient.gender}</span>
              {patient.bloodType && <span className="bg-white/20 px-2 py-0.5 rounded-full">{patient.bloodType}</span>}
              <Badge status={patient.status} />
            </div>
          </div>
          <Button variant="outline" className="ml-auto !border-white/40 !text-white hover:!bg-white/20"
            onClick={() => navigate('/app/appointments')} icon={<Plus className="w-4 h-4" />}>
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Alert: pending balance */}
      {totalBalance > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm">You have an outstanding balance of <strong>{formatCurrency(totalBalance)}</strong>.</p>
          <Button size="sm" variant="outline" className="ml-auto !border-amber-400 !text-amber-700 hover:!bg-amber-100"
            onClick={() => navigate('/app/billing')}>View Invoices</Button>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Upcoming Appts." value={upcomingAppts.length} icon={<Calendar className="w-5 h-5" />} color="blue" />
        <StatCard title="Active Rx" value={activePrescriptions.length} icon={<ClipboardList className="w-5 h-5" />} color="green" />
        <StatCard title="Pending Bills" value={pendingInvoices.length} icon={<CreditCard className="w-5 h-5" />} color="yellow" />
        <StatCard title="Balance Due" value={formatCurrency(totalBalance)} icon={<AlertCircle className="w-5 h-5" />} color={totalBalance > 0 ? 'red' : 'green'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming appointments */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Upcoming Appointments</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/appointments')}>
              View All <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {upcomingAppts.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No upcoming appointments</p>
                <Button size="sm" className="mt-3" onClick={() => navigate('/app/appointments')}>Book an Appointment</Button>
              </div>
            ) : upcomingAppts.map(appt => (
              <div key={appt.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer"
                onClick={() => navigate('/app/appointments')}>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center text-blue-600 shrink-0">
                  <span className="text-base font-bold leading-none">{new Date(appt.appointmentDate).getDate()}</span>
                  <span className="text-xs">{new Date(appt.appointmentDate).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">Dr. {appt.doctorName}</p>
                  <p className="text-xs text-slate-400">{appt.department} · {appt.type?.replace(/_/g, ' ')}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                  </div>
                </div>
                <Badge status={appt.status} />
              </div>
            ))}
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          {/* Health info */}
          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Health Info</h3>
            <div className="space-y-2 text-sm">
              {[
                ['Blood Type', patient.bloodType || '—'],
                ['Allergies', patient.allergies || 'None'],
                ['Chronic Conditions', patient.chronicConditions || 'None'],
                ['Insurance', patient.insuranceProvider || '—'],
                ['Emergency Contact', patient.emergencyContactName || '—'],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex gap-2">
                  <span className="text-slate-400 min-w-28 shrink-0">{label}</span>
                  <span className="text-slate-700 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Active prescriptions */}
          <Card>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">Active Prescriptions</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/prescriptions')}>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="divide-y divide-slate-100">
              {activePrescriptions.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-sm">No active prescriptions</div>
              ) : activePrescriptions.map(presc => (
                <div key={presc.id} className="px-4 py-3 cursor-pointer hover:bg-slate-50" onClick={() => navigate('/app/prescriptions')}>
                  <p className="text-xs font-mono text-slate-400">{presc.prescriptionNumber}</p>
                  <p className="text-sm text-slate-700">{presc.items?.length ?? 0} medication(s)</p>
                  <p className="text-xs text-slate-400">Expires: {formatDate(presc.expiryDate)}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Pending invoices */}
          {pendingInvoices.length > 0 && (
            <Card>
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm">Pending Bills</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/billing')}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="divide-y divide-slate-100">
                {pendingInvoices.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50"
                    onClick={() => navigate('/app/billing')}>
                    <div>
                      <p className="text-xs font-mono text-slate-400">{inv.invoiceNumber}</p>
                      <p className="text-sm font-semibold text-red-600">{formatCurrency(inv.balanceAmount)}</p>
                    </div>
                    <Badge status={inv.status} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
