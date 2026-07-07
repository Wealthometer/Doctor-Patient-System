import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { patientApi } from '../../api/services';
import {
  Table, Badge, Button, Modal, Input, Select, Textarea, SearchBar,
  Pagination, Card, Spinner, Avatar,
} from '../../components/common';
import { formatDate, cn } from '../../utils';
import { useAppSelector } from '../../hooks/redux';
import { Plus, RefreshCw, Eye, UserX, Filter } from 'lucide-react';
import type { PatientResponse, CreatePatientRequest } from '../../types';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => ({ value: t, label: t }));

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector(s => s.auth.user);
  const isAdmin = user?.role === 'ADMIN';

  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<PatientResponse | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreatePatientRequest>();

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = search
        ? await patientApi.search(search, page)
        : await patientApi.getAll(page);
      setPatients(res.content);
      setTotal(res.totalElements);
    } catch { toast.error('Failed to load patients'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleCreate = async (data: CreatePatientRequest) => {
    setCreateLoading(true);
    try {
      await patientApi.create({ ...data, userId: user!.id });
      toast.success('Patient created');
      setShowCreate(false);
      reset();
      fetchPatients();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create patient');
    } finally { setCreateLoading(false); }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this patient?')) return;
    try {
      await patientApi.deactivate(id);
      toast.success('Patient deactivated');
      fetchPatients();
    } catch { toast.error('Failed to deactivate'); }
  };

  const columns = [
    {
      key: 'name', header: 'Patient',
      render: (p: PatientResponse) => (
        <div className="flex items-center gap-3">
          <Avatar name={p.fullName || `${p.firstName} ${p.lastName}`} size="sm" />
          <div>
            <p className="font-medium text-slate-900">{p.fullName || `${p.firstName} ${p.lastName}`}</p>
            <p className="text-xs text-slate-400">{p.patientCode}</p>
          </div>
        </div>
      ),
    },
    { key: 'email', header: 'Email', render: (p: PatientResponse) => <span className="text-sm">{p.email}</span> },
    { key: 'phone', header: 'Phone', render: (p: PatientResponse) => <span className="text-sm">{p.phone}</span> },
    { key: 'age', header: 'Age / Gender', render: (p: PatientResponse) => <span className="text-sm">{p.age}y · {p.gender}</span> },
    { key: 'bloodType', header: 'Blood Type', render: (p: PatientResponse) => p.bloodType ? <Badge status="" label={p.bloodType} /> : '—' },
    { key: 'status', header: 'Status', render: (p: PatientResponse) => <Badge status={p.status} /> },
    { key: 'createdAt', header: 'Registered', render: (p: PatientResponse) => <span className="text-xs text-slate-500">{formatDate(p.createdAt)}</span> },
    {
      key: 'actions', header: '',
      render: (p: PatientResponse) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => setSelected(p)}>View</Button>
          {isAdmin && p.status === 'ACTIVE' && (
            <Button variant="ghost" size="sm" icon={<UserX className="w-3.5 h-3.5" />}
              className="text-red-500 hover:bg-red-50" onClick={() => handleDeactivate(p.id)}>
              Deactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-slate-500 text-sm">{total} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchPatients}>Refresh</Button>
          {isAdmin && (
            <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowCreate(true)}>Add Patient</Button>
          )}
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100">
          <SearchBar value={searchInput} onChange={setSearchInput} placeholder="Search by name, email, code..." />
        </div>
        <Table columns={columns} data={patients} loading={loading} onRowClick={p => setSelected(p)} />
        {total > 20 && <Pagination page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} totalElements={total} size={20} />}
      </Card>

      {/* View patient modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Patient Details" size="lg">
        {selected && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <Avatar name={selected.fullName} size="lg" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selected.fullName}</h3>
                <p className="text-sm text-slate-500">{selected.patientCode}</p>
                <Badge status={selected.status} />
              </div>
            </div>
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ['Email', selected.email], ['Phone', selected.phone],
                ['Date of Birth', formatDate(selected.dateOfBirth)], ['Age', `${selected.age} years`],
                ['Gender', selected.gender], ['Blood Type', selected.bloodType || '—'],
                ['Address', [selected.address, selected.city, selected.state].filter(Boolean).join(', ') || '—'],
                ['Country', selected.country || '—'],
                ['Insurance', selected.insuranceProvider || '—'], ['Policy #', selected.insurancePolicyNumber || '—'],
                ['Emergency Contact', selected.emergencyContactName || '—'],
                ['Emergency Phone', selected.emergencyContactPhone || '—'],
                ['Allergies', selected.allergies || 'None'], ['Chronic Conditions', selected.chronicConditions || 'None'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-slate-900">{value}</p>
                </div>
              ))}
            </div>
            {selected.medicalNotes && (
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Medical Notes</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{selected.medicalNotes}</p>
              </div>
            )}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => { navigate(`/app/appointments?patientId=${selected.id}`); setSelected(null); }}>
                View Appointments
              </Button>
              <Button variant="outline" onClick={() => { navigate(`/app/prescriptions?patientId=${selected.id}`); setSelected(null); }}>
                View Prescriptions
              </Button>
              <Button variant="outline" onClick={() => { navigate(`/app/billing?patientId=${selected.id}`); setSelected(null); }}>
                View Billing
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create patient modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); reset(); }} title="Add New Patient" size="xl">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" {...register('firstName', { required: 'Required' })} error={errors.firstName?.message} />
            <Input label="Last Name" {...register('lastName', { required: 'Required' })} error={errors.lastName?.message} />
            <Input label="Email" type="email" {...register('email', { required: 'Required' })} error={errors.email?.message} />
            <Input label="Phone" {...register('phone', { required: 'Required' })} error={errors.phone?.message} />
            <Input label="Date of Birth" type="date" {...register('dateOfBirth', { required: 'Required' })} error={errors.dateOfBirth?.message} />
            <Select label="Gender" options={GENDER_OPTIONS} {...register('gender', { required: 'Required' })} error={errors.gender?.message} />
            <Select label="Blood Type" options={BLOOD_TYPES} {...register('bloodType')} />
            <Input label="Insurance Provider" {...register('insuranceProvider', { required: 'Required' })} error={errors.insuranceProvider?.message} />
            <Input label="Insurance Policy #" {...register('insurancePolicyNumber')} />
            <Input label="Address" {...register('address')} />
            <Input label="City" {...register('city')} />
            <Input label="State" {...register('state')} />
            <Input label="Country" {...register('country')} defaultValue="US" />
            <Input label="Emergency Contact Name" {...register('emergencyContactName')} />
            <Input label="Emergency Contact Phone" {...register('emergencyContactPhone')} />
            <Input label="Emergency Contact Relation" {...register('emergencyContactRelation')} />
          </div>
          <Textarea label="Allergies" {...register('allergies')} placeholder="List any known allergies..." />
          <Textarea label="Chronic Conditions" {...register('chronicConditions')} placeholder="List any chronic conditions..." />
          <Textarea label="Medical Notes" {...register('medicalNotes')} placeholder="Additional medical notes..." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowCreate(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={createLoading}>Create Patient</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
