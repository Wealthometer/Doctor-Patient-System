import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { doctorApi, authApi } from '../../api/services';
import {
  Table, Badge, Button, Modal, Input, Select, Textarea,
  SearchBar, Pagination, Card, Avatar, StatCard,
} from '../../components/common';
import { formatDate, cn } from '../../utils';
import { Plus, RefreshCw, Eye, Star, Edit } from 'lucide-react';
import { Stethoscope, Users, Award } from 'lucide-react';
import type { DoctorResponse, CreateDoctorRequest, DoctorStatus } from '../../types';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

export const DoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<DoctorResponse | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [stats, setStats] = useState<{ totalDoctors: number; activeDoctors: number; onLeaveDoctors: number } | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateDoctorRequest & { email_user: string; password_user: string; username_user: string }>();

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = search ? await doctorApi.search(search, page) : await doctorApi.getAll(page);
      setDoctors(res.content);
      setTotal(res.totalElements);
    } catch { toast.error('Failed to load doctors'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);
  useEffect(() => { doctorApi.getStats().then(setStats).catch(() => {}); }, []);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleCreate = async (data: any) => {
    setCreateLoading(true);
    try {
      // 1. Register user account for doctor
      const authRes = await authApi.register ? null : null; // placeholder
      // For demo: create doctor directly with a provided userId
      // In real flow: register user first, get userId, then create doctor profile
      const { email_user, password_user, username_user, ...doctorData } = data;
      
      // Register the user account
      const userRes = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify({ username: username_user, email: email_user, password: password_user, firstName: doctorData.firstName, lastName: doctorData.lastName, role: 'DOCTOR' }),
      });
      
      if (!userRes.ok) throw new Error('Failed to create user account');
      const userJson = await userRes.json();
      const userId = userJson.user?.id || userJson.id;
      
      await doctorApi.create({ ...doctorData, userId });
      toast.success('Doctor created');
      setShowCreate(false);
      reset();
      fetchDoctors();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create doctor');
    } finally { setCreateLoading(false); }
  };

  const handleStatusChange = async (id: string, status: DoctorStatus) => {
    try {
      await doctorApi.updateStatus(id, status);
      toast.success(`Status updated to ${status}`);
      fetchDoctors();
      if (selected?.id === id) {
        const updated = await doctorApi.getById(id);
        setSelected(updated);
      }
    } catch { toast.error('Failed to update status'); }
  };

  const columns = [
    {
      key: 'name', header: 'Doctor',
      render: (d: DoctorResponse) => (
        <div className="flex items-center gap-3">
          <Avatar name={d.fullName || `Dr. ${d.firstName} ${d.lastName}`} size="sm" />
          <div>
            <p className="font-medium text-slate-900">Dr. {d.firstName} {d.lastName}</p>
            <p className="text-xs text-slate-400">{d.doctorCode}</p>
          </div>
        </div>
      ),
    },
    { key: 'specialization', header: 'Specialization', render: (d: DoctorResponse) => <span className="text-sm">{d.specialization}</span> },
    { key: 'department', header: 'Department', render: (d: DoctorResponse) => <span className="text-sm">{d.department}</span> },
    {
      key: 'rating', header: 'Rating',
      render: (d: DoctorResponse) => (
        <div className="flex items-center gap-1 text-sm">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{d.averageRating?.toFixed(1) ?? '—'}</span>
          <span className="text-slate-400">({d.totalRatings})</span>
        </div>
      ),
    },
    { key: 'experience', header: 'Exp.', render: (d: DoctorResponse) => <span className="text-sm">{d.yearsOfExperience ?? '—'}y</span> },
    { key: 'status', header: 'Status', render: (d: DoctorResponse) => <Badge status={d.status} /> },
    {
      key: 'actions', header: '',
      render: (d: DoctorResponse) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => setSelected(d)}>View</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctors</h1>
          <p className="text-slate-500 text-sm">{total} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchDoctors}>Refresh</Button>
          <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowCreate(true)}>Add Doctor</Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Total Doctors" value={stats.totalDoctors} icon={<Stethoscope className="w-5 h-5" />} color="blue" />
          <StatCard title="Active" value={stats.activeDoctors} icon={<Users className="w-5 h-5" />} color="green" />
          <StatCard title="On Leave" value={stats.onLeaveDoctors} icon={<Award className="w-5 h-5" />} color="yellow" />
        </div>
      )}

      <Card>
        <div className="p-4 border-b border-slate-100">
          <SearchBar value={searchInput} onChange={setSearchInput} placeholder="Search by name, specialization, department..." />
        </div>
        <Table columns={columns} data={doctors} loading={loading} onRowClick={d => setSelected(d)} />
        {total > 20 && <Pagination page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} totalElements={total} size={20} />}
      </Card>

      {/* View doctor modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Doctor Profile" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <Avatar name={`${selected.firstName} ${selected.lastName}`} size="lg" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Dr. {selected.firstName} {selected.lastName}</h3>
                <p className="text-sm text-slate-500">{selected.doctorCode} · {selected.specialization}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge status={selected.status} />
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {selected.averageRating?.toFixed(1) ?? '—'} ({selected.totalRatings} reviews)
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ['Email', selected.email], ['Phone', selected.phone],
                ['Department', selected.department], ['Specialization', selected.specialization],
                ['License #', selected.licenseNumber], ['License Expiry', formatDate(selected.licenseExpiryDate)],
                ['Experience', `${selected.yearsOfExperience ?? '—'} years`],
                ['Consultation Fee', selected.consultationFee ? `$${selected.consultationFee}` : '—'],
                ['Work Hours', selected.workStartTime && selected.workEndTime ? `${selected.workStartTime} – ${selected.workEndTime}` : '—'],
                ['Work Days', selected.workDays || '—'],
                ['Max Daily Appts.', selected.maxDailyAppointments ?? '—'],
                ['Qualifications', selected.qualifications || '—'],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-slate-900">{value}</p>
                </div>
              ))}
            </div>
            {selected.bio && (
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Bio</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{selected.bio}</p>
              </div>
            )}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <Select
                options={STATUS_OPTIONS}
                value={selected.status}
                onChange={e => handleStatusChange(selected.id, e.target.value as DoctorStatus)}
                label="Change Status"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Create doctor modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); reset(); }} title="Add New Doctor" size="xl">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <p className="text-sm text-slate-500 bg-blue-50 rounded-lg p-3 border border-blue-100">
            This will create both a user account and a doctor profile.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Username" {...register('username_user', { required: 'Required' })} error={errors.username_user?.message} />
            <Input label="Account Email" type="email" {...register('email_user', { required: 'Required' })} error={errors.email_user?.message} />
            <Input label="Account Password" type="password" {...register('password_user', { required: 'Required' })} error={errors.password_user?.message} />
            <div /> {/* spacer */}
            <Input label="First Name" {...register('firstName', { required: 'Required' })} error={errors.firstName?.message} />
            <Input label="Last Name" {...register('lastName', { required: 'Required' })} error={errors.lastName?.message} />
            <Input label="Email" type="email" {...register('email', { required: 'Required' })} error={errors.email?.message} />
            <Input label="Phone" {...register('phone', { required: 'Required' })} error={errors.phone?.message} />
            <Input label="Specialization" {...register('specialization', { required: 'Required' })} error={errors.specialization?.message} />
            <Input label="Department" {...register('department', { required: 'Required' })} error={errors.department?.message} />
            <Input label="License Number" {...register('licenseNumber', { required: 'Required' })} error={errors.licenseNumber?.message} />
            <Input label="License Expiry" type="date" {...register('licenseExpiryDate')} />
            <Input label="Years of Experience" type="number" {...register('yearsOfExperience', { valueAsNumber: true })} />
            <Input label="Consultation Fee ($)" {...register('consultationFee')} />
            <Input label="Work Start Time" type="time" {...register('workStartTime')} />
            <Input label="Work End Time" type="time" {...register('workEndTime')} />
            <Input label="Work Days" {...register('workDays')} placeholder="e.g. Mon–Fri" />
            <Input label="Max Daily Appointments" type="number" {...register('maxDailyAppointments', { valueAsNumber: true })} />
          </div>
          <Textarea label="Qualifications" {...register('qualifications')} placeholder="MBBS, MD, etc." />
          <Textarea label="Bio" {...register('bio')} placeholder="Brief professional biography..." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowCreate(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={createLoading}>Create Doctor</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
