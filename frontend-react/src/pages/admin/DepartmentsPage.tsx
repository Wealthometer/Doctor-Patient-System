import { FormEvent, useMemo, useState } from 'react';
import {
  Activity,
  Building2,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Filter,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Stethoscope,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { DoctorStatus } from '@/types';

type DepartmentStatus = 'ACTIVE' | 'LIMITED' | 'INACTIVE';

interface DepartmentDoctor {
  id: string;
  doctorCode: string;
  fullName: string;
  specialization: string;
  department: string;
  averageRating: number;
  consultationFee: string;
  status: DoctorStatus;
}

interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  location: string;
  phone: string;
  status: DepartmentStatus;
  doctorCount: number;
  activeDoctorCount: number;
  appointmentCount: number;
  specializations: string[];
  doctors: DepartmentDoctor[];
}

const demoDepartments: Department[] = [
  {
    id: 'DEP-001',
    name: 'Cardiology',
    code: 'CARD',
    head: 'Dr. James Park',
    location: 'Building A, Floor 3',
    phone: '(555) 014-2201',
    status: 'ACTIVE',
    doctorCount: 7,
    activeDoctorCount: 6,
    appointmentCount: 84,
    specializations: ['Interventional Cardiology', 'Heart Failure', 'Preventive Care'],
    doctors: [
      { id: 'd1', doctorCode: 'D-1001', fullName: 'Dr. James Park', specialization: 'Interventional Cardiology', department: 'Cardiology', averageRating: 4.8, consultationFee: '$180', status: 'ACTIVE' },
      { id: 'd2', doctorCode: 'D-1008', fullName: 'Dr. Helena Morris', specialization: 'Heart Failure', department: 'Cardiology', averageRating: 4.7, consultationFee: '$165', status: 'ACTIVE' },
      { id: 'd3', doctorCode: 'D-1011', fullName: 'Dr. Omar Reed', specialization: 'Preventive Care', department: 'Cardiology', averageRating: 4.6, consultationFee: '$145', status: 'ON_LEAVE' },
    ],
  },
  {
    id: 'DEP-002',
    name: 'Neurology',
    code: 'NEUR',
    head: 'Dr. Rita Singh',
    location: 'Building B, Floor 2',
    phone: '(555) 014-3310',
    status: 'ACTIVE',
    doctorCount: 5,
    activeDoctorCount: 4,
    appointmentCount: 62,
    specializations: ['Stroke Care', 'Epilepsy', 'Movement Disorders'],
    doctors: [
      { id: 'd4', doctorCode: 'D-1002', fullName: 'Dr. Rita Singh', specialization: 'Stroke Care', department: 'Neurology', averageRating: 4.9, consultationFee: '$190', status: 'ACTIVE' },
      { id: 'd5', doctorCode: 'D-1015', fullName: 'Dr. Marcus Hale', specialization: 'Epilepsy', department: 'Neurology', averageRating: 4.5, consultationFee: '$170', status: 'ACTIVE' },
    ],
  },
  {
    id: 'DEP-003',
    name: 'Orthopedics',
    code: 'ORTH',
    head: 'Dr. Samuel Lee',
    location: 'Building C, Floor 1',
    phone: '(555) 014-4427',
    status: 'LIMITED',
    doctorCount: 4,
    activeDoctorCount: 2,
    appointmentCount: 47,
    specializations: ['Sports Medicine', 'Joint Replacement', 'Trauma'],
    doctors: [
      { id: 'd6', doctorCode: 'D-1003', fullName: 'Dr. Samuel Lee', specialization: 'Sports Medicine', department: 'Orthopedics', averageRating: 4.6, consultationFee: '$155', status: 'ACTIVE' },
      { id: 'd7', doctorCode: 'D-1020', fullName: 'Dr. Nina Patel', specialization: 'Joint Replacement', department: 'Orthopedics', averageRating: 4.4, consultationFee: '$175', status: 'ON_LEAVE' },
    ],
  },
  {
    id: 'DEP-004',
    name: 'Pediatrics',
    code: 'PEDS',
    head: 'Dr. Anya Patel',
    location: 'Building A, Floor 1',
    phone: '(555) 014-1188',
    status: 'ACTIVE',
    doctorCount: 6,
    activeDoctorCount: 6,
    appointmentCount: 91,
    specializations: ['General Pediatrics', 'Adolescent Medicine', 'Immunization'],
    doctors: [
      { id: 'd8', doctorCode: 'D-1004', fullName: 'Dr. Anya Patel', specialization: 'General Pediatrics', department: 'Pediatrics', averageRating: 4.9, consultationFee: '$130', status: 'ACTIVE' },
      { id: 'd9', doctorCode: 'D-1012', fullName: 'Dr. Grace Kim', specialization: 'Adolescent Medicine', department: 'Pediatrics', averageRating: 4.8, consultationFee: '$135', status: 'ACTIVE' },
    ],
  },
  {
    id: 'DEP-005',
    name: 'Emergency',
    code: 'EMRG',
    head: 'Dr. Elena Torres',
    location: 'Main Building, Ground',
    phone: '(555) 014-9110',
    status: 'ACTIVE',
    doctorCount: 9,
    activeDoctorCount: 8,
    appointmentCount: 128,
    specializations: ['Emergency Medicine', 'Trauma Response', 'Triage'],
    doctors: [
      { id: 'd10', doctorCode: 'D-1005', fullName: 'Dr. Elena Torres', specialization: 'Emergency Medicine', department: 'Emergency', averageRating: 4.7, consultationFee: '$210', status: 'ACTIVE' },
      { id: 'd11', doctorCode: 'D-1018', fullName: 'Dr. Victor Chen', specialization: 'Trauma Response', department: 'Emergency', averageRating: 4.6, consultationFee: '$205', status: 'ACTIVE' },
    ],
  },
  {
    id: 'DEP-006',
    name: 'Dermatology',
    code: 'DERM',
    head: 'Unassigned',
    location: 'Building B, Floor 4',
    phone: '(555) 014-5630',
    status: 'INACTIVE',
    doctorCount: 2,
    activeDoctorCount: 0,
    appointmentCount: 0,
    specializations: ['Clinical Dermatology', 'Skin Screening'],
    doctors: [
      { id: 'd12', doctorCode: 'D-1022', fullName: 'Dr. Leah Stone', specialization: 'Clinical Dermatology', department: 'Dermatology', averageRating: 4.3, consultationFee: '$150', status: 'INACTIVE' },
    ],
  },
];

const statusOptions: Array<DepartmentStatus | 'ALL'> = ['ALL', 'ACTIVE', 'LIMITED', 'INACTIVE'];

const statusColors: Record<DepartmentStatus, string> = {
  ACTIVE: 'bg-green-50 text-green-700',
  LIMITED: 'bg-amber-50 text-amber-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
};

const doctorStatusColors: Record<DoctorStatus, string> = {
  ACTIVE: 'bg-green-50 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  ON_LEAVE: 'bg-amber-50 text-amber-700',
  SUSPENDED: 'bg-red-50 text-red-600',
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(demoDepartments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DepartmentStatus | 'ALL'>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(demoDepartments[0]);
  const [showAddDepartment, setShowAddDepartment] = useState(false);

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return departments.filter((department) => {
      const matchesSearch =
        department.name.toLowerCase().includes(query) ||
        department.code.toLowerCase().includes(query) ||
        department.head.toLowerCase().includes(query) ||
        department.specializations.some((specialization) => specialization.toLowerCase().includes(query));
      const matchesStatus = statusFilter === 'ALL' || department.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [departments, search, statusFilter]);

  const stats = useMemo(() => {
    const activeDepartments = departments.filter((department) => department.status === 'ACTIVE').length;
    const totalDoctors = departments.reduce((sum, department) => sum + department.doctorCount, 0);
    const activeDoctors = departments.reduce((sum, department) => sum + department.activeDoctorCount, 0);
    const appointments = departments.reduce((sum, department) => sum + department.appointmentCount, 0);

    return { activeDepartments, totalDoctors, activeDoctors, appointments };
  }, [departments]);

  const handleAddDepartment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const code = String(formData.get('code') || '').trim().toUpperCase();
    const head = String(formData.get('head') || 'Unassigned').trim();
    const location = String(formData.get('location') || '').trim();

    if (!name || !code || !location) {
      toast.error('Department name, code, and location are required');
      return;
    }

    const nextDepartment: Department = {
      id: `DEP-${String(departments.length + 1).padStart(3, '0')}`,
      name,
      code,
      head: head || 'Unassigned',
      location,
      phone: '(555) 014-0000',
      status: 'ACTIVE',
      doctorCount: 0,
      activeDoctorCount: 0,
      appointmentCount: 0,
      specializations: ['General Care'],
      doctors: [],
    };

    setDepartments((current) => [nextDepartment, ...current]);
    setSelectedDepartment(nextDepartment);
    setShowAddDepartment(false);
    toast.success('Demo department added');
  };

  const handleStatusChange = (departmentId: string, status: DepartmentStatus) => {
    setDepartments((current) => current.map((department) => (department.id === departmentId ? { ...department, status } : department)));
    setSelectedDepartment((current) => (current?.id === departmentId ? { ...current, status } : current));
    toast.success(`Department marked ${status.toLowerCase()}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Departments</h2>
          <p className="text-sm text-gray-500">Review departments returned from doctor stats and drill into assigned doctors.</p>
        </div>
        <button
          onClick={() => setShowAddDepartment(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={15} />
          Add Department
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Departments', value: stats.activeDepartments, sub: `${departments.length} total departments`, icon: Building2, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Doctors', value: stats.totalDoctors, sub: `${stats.activeDoctors} active clinicians`, icon: Stethoscope, color: 'bg-teal-50 text-teal-600' },
          { label: 'Appointments', value: stats.appointments, sub: 'Scheduled this month', icon: CalendarDays, color: 'bg-amber-50 text-amber-600' },
          { label: 'Coverage', value: '93%', sub: 'Active department coverage', icon: Activity, color: 'bg-purple-50 text-purple-600' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">{card.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon size={15} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex bg-white border border-gray-200 rounded-xl p-1">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                statusFilter === status ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search departments..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 text-sm border border-gray-300 rounded-xl px-3 py-2 text-gray-600 hover:bg-gray-50">
            <Filter size={14} />
            More filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-4">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Department</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Head</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Doctors</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Appointments</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDepartments.map((department) => (
                <tr
                  key={department.id}
                  onClick={() => setSelectedDepartment(department)}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedDepartment?.id === department.id ? 'bg-blue-50/50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 size={16} className="text-blue-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{department.name}</p>
                        <p className="text-xs text-gray-500">{department.code} · {department.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{department.head}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {department.activeDoctorCount}
                    <span className="text-gray-400">/{department.doctorCount}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{department.appointmentCount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[department.status]}`}>
                      {department.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          toast.success('Demo edit action');
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit department"
                      >
                        <Edit3 size={15} />
                      </button>
                      {department.status === 'INACTIVE' ? (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleStatusChange(department.id, 'ACTIVE');
                          }}
                          className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Activate department"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      ) : (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleStatusChange(department.id, 'INACTIVE');
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Deactivate department"
                        >
                          <XCircle size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">Showing {filteredDepartments.length} of {departments.length} departments</span>
            <div className="flex gap-1">
              <button className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40" disabled>Previous</button>
              <button className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg">1</button>
              <button className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>

        <aside className="bg-white rounded-xl border border-gray-200 p-5 h-fit">
          {selectedDepartment ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 size={19} className="text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{selectedDepartment.name}</h3>
                    <p className="text-xs text-gray-500">{selectedDepartment.code} · {selectedDepartment.location}</p>
                  </div>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg" title="More actions">
                  <MoreHorizontal size={17} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Department ID</p>
                  <p className="font-medium text-gray-900 mt-1">{selectedDepartment.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium text-gray-900 mt-1">{selectedDepartment.status}</p>
                </div>
                <div>
                  <p className="text-gray-500">Head</p>
                  <p className="font-medium text-gray-900 mt-1">{selectedDepartment.head}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900 mt-1">{selectedDepartment.phone}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 mb-2">Specializations</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDepartment.specializations.map((specialization) => (
                    <span key={specialization} className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                      {specialization}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-500">Active Doctors</h4>
                  <span className="text-xs text-gray-400">{selectedDepartment.doctors.length} shown</span>
                </div>
                <div className="space-y-2">
                  {selectedDepartment.doctors.length > 0 ? selectedDepartment.doctors.map((doctor) => (
                    <div key={doctor.id} className="border border-gray-100 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doctor.fullName}</p>
                          <p className="text-xs text-gray-500">{doctor.doctorCode} · {doctor.specialization}</p>
                        </div>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${doctorStatusColors[doctor.status]}`}>
                          {doctor.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>Rating {doctor.averageRating.toFixed(1)}</span>
                        <span>{doctor.consultationFee}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl">
                      <Users size={22} className="mx-auto text-gray-300" />
                      <p className="text-xs text-gray-500 mt-2">No doctors assigned yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 text-sm bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700">
                  <Edit3 size={15} />
                  Edit Department
                </button>
                <button className="w-full flex items-center justify-center gap-2 text-sm border border-gray-300 text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50">
                  <Mail size={15} />
                  Message Staff
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <Building2 size={28} className="mx-auto text-gray-300" />
              <p className="text-sm font-medium text-gray-900 mt-3">No department selected</p>
            </div>
          )}
        </aside>
      </div>

      {showAddDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 px-4">
          <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Add Department</h3>
                <p className="text-xs text-gray-500">Create a demo department before API integration.</p>
              </div>
              <button onClick={() => setShowAddDepartment(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Department name</span>
                  <input name="name" className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Code</span>
                  <input name="code" placeholder="CARD" className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="text-xs font-medium text-gray-600">Department head</span>
                <input name="head" placeholder="Unassigned" className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </label>

              <label className="space-y-1 block">
                <span className="text-xs font-medium text-gray-600">Location</span>
                <input name="location" placeholder="Building A, Floor 2" className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddDepartment(false)} className="text-sm border border-gray-300 rounded-xl px-4 py-2 text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="text-sm bg-blue-600 text-white rounded-xl px-4 py-2 hover:bg-blue-700">
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
