import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Edit3,
  Filter,
  KeyRound,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  UserCog,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { patientApi } from '@/api/services';
import type { Patient, PatientStatus, Role } from '@/types';

type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE' | 'DECEASED' | 'TRANSFERRED';
type StatusFilter = UserStatus | 'ALL';

interface ManagedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  department: string;
  status: UserStatus;
  lastLogin: string;
  joinedAt: string;
  permissions: string[];
  patient?: Patient;
}

interface PatientStats {
  totalPatients: number;
  activePatients: number;
  inactivePatients: number;
}

const staffDemoUsers: ManagedUser[] = [
  {
    id: 'USR-1001',
    name: 'Avery Morgan',
    username: 'avery.admin',
    email: 'avery.morgan@healthcare.test',
    role: 'ADMIN',
    department: 'Operations',
    status: 'ACTIVE',
    lastLogin: 'Today, 08:42',
    joinedAt: '2025-11-18',
    permissions: ['User access', 'Billing', 'Reports'],
  },
  {
    id: 'USR-1002',
    name: 'Dr. James Park',
    username: 'jpark',
    email: 'james.park@healthcare.test',
    role: 'DOCTOR',
    department: 'Cardiology',
    status: 'ACTIVE',
    lastLogin: 'Today, 07:15',
    joinedAt: '2024-09-03',
    permissions: ['Patient records', 'Prescriptions', 'Appointments'],
  },
  {
    id: 'USR-1003',
    name: 'Dr. Rita Singh',
    username: 'rsingh',
    email: 'rita.singh@healthcare.test',
    role: 'DOCTOR',
    department: 'Neurology',
    status: 'PENDING',
    lastLogin: 'Invite sent',
    joinedAt: '2026-06-12',
    permissions: ['Patient records', 'Appointments'],
  },
  {
    id: 'USR-1005',
    name: 'Noah Williams',
    username: 'nwilliams',
    email: 'noah.williams@healthcare.test',
    role: 'NURSE',
    department: 'Emergency',
    status: 'ACTIVE',
    lastLogin: 'Jun 24, 13:08',
    joinedAt: '2025-04-09',
    permissions: ['Triage', 'Patient records', 'Appointments'],
  },
];

const roleOptions: Array<Role | 'ALL'> = ['ALL', 'ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'];
const statusOptions: StatusFilter[] = ['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE', 'DECEASED', 'TRANSFERRED'];

const statusColors: Record<UserStatus, string> = {
  ACTIVE: 'bg-green-50 text-green-700',
  PENDING: 'bg-amber-50 text-amber-700',
  SUSPENDED: 'bg-red-50 text-red-600',
  INACTIVE: 'bg-gray-100 text-gray-600',
  DECEASED: 'bg-slate-100 text-slate-700',
  TRANSFERRED: 'bg-blue-50 text-blue-700',
};

const roleColors: Record<Role, string> = {
  ADMIN: 'bg-blue-50 text-blue-700',
  DOCTOR: 'bg-teal-50 text-teal-700',
  NURSE: 'bg-purple-50 text-purple-700',
  PATIENT: 'bg-slate-100 text-slate-700',
};

const patientStatusValues: PatientStatus[] = ['ACTIVE', 'INACTIVE', 'DECEASED', 'TRANSFERRED'];

const patientName = (patient: Patient) => patient.fullName || `${patient.firstName} ${patient.lastName}`;

const patientToManagedUser = (patient: Patient): ManagedUser => ({
  id: patient.id,
  name: patientName(patient),
  username: patient.patientCode,
  email: patient.email,
  role: 'PATIENT',
  department: 'Patient Portal',
  status: patient.status,
  lastLogin: 'Patient Service',
  joinedAt: patient.createdAt?.slice(0, 10) || '',
  permissions: ['Portal access', 'Patient profile'],
  patient,
});

export default function UserManagementPage() {
  const [localUsers, setLocalUsers] = useState<ManagedUser[]>(staffDemoUsers);
  const [patientUsers, setPatientUsers] = useState<ManagedUser[]>([]);
  const [patientStats, setPatientStats] = useState<PatientStats | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(staffDemoUsers[0]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPatientStats = async () => {
      try {
        const { data } = await patientApi.getStats();
        setPatientStats(data);
      } catch {
        toast.error('Failed to load patient stats');
      }
    };

    fetchPatientStats();
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      setPatientsLoading(true);
      try {
        const params = { page: 0, size: 50, sort: 'createdAt,desc' };
        const query = search.trim();
        const shouldUseStatusEndpoint = !query && patientStatusValues.includes(statusFilter as PatientStatus);
        const { data } = query
          ? await patientApi.search(query, params)
          : shouldUseStatusEndpoint
            ? await patientApi.getByStatus(statusFilter, params)
            : await patientApi.getAll(params);

        setPatientUsers(data.content.map(patientToManagedUser));
      } catch {
        toast.error('Failed to load patients');
      } finally {
        setPatientsLoading(false);
      }
    };

    fetchPatients();
  }, [search, statusFilter]);

  const users = useMemo(() => [...localUsers, ...patientUsers], [localUsers, patientUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const active = users.filter((user) => user.status === 'ACTIVE').length;
    const pending = users.filter((user) => user.status === 'PENDING').length;
    const clinical = users.filter((user) => user.role === 'DOCTOR' || user.role === 'NURSE').length;
    const admin = users.filter((user) => user.role === 'ADMIN').length;

    return { active, pending, clinical, admin };
  }, [users]);

  const handleAddUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get('firstName') || '').trim();
    const lastName = String(formData.get('lastName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const role = String(formData.get('role') || 'PATIENT') as Role;
    const department = String(formData.get('department') || 'Patient Portal').trim();

    if (!firstName || !lastName || !email) {
      toast.error('First name, last name, and email are required');
      return;
    }

    const nextUser: ManagedUser = {
      id: `USR-${1001 + localUsers.length}`,
      name: `${firstName} ${lastName}`,
      username: `${firstName[0]}${lastName}`.toLowerCase(),
      email,
      role,
      department: department || 'Patient Portal',
      status: 'PENDING',
      lastLogin: 'Invite pending',
      joinedAt: new Date().toISOString().slice(0, 10),
      permissions: role === 'ADMIN' ? ['User access', 'Reports'] : role === 'DOCTOR' ? ['Patient records', 'Appointments'] : ['Portal access'],
    };

    setLocalUsers((current) => [nextUser, ...current]);
    setSelectedUser(nextUser);
    setShowAddUser(false);
    toast.success('Demo user added');
  };

  const handleStatusChange = (userId: string, status: UserStatus) => {
    setLocalUsers((current) => current.map((user) => (user.id === userId ? { ...user, status } : user)));
    setSelectedUser((current) => (current?.id === userId ? { ...current, status } : current));
    toast.success(`User marked ${status.toLowerCase()}`);
  };

  const handleEditPatient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingPatient) return;

    const formData = new FormData(event.currentTarget);
    const payload = {
      firstName: String(formData.get('firstName') || '').trim(),
      lastName: String(formData.get('lastName') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      address: String(formData.get('address') || '').trim(),
      city: String(formData.get('city') || '').trim(),
      state: String(formData.get('state') || '').trim(),
      zipCode: String(formData.get('zipCode') || '').trim(),
      country: String(formData.get('country') || '').trim(),
      allergies: String(formData.get('allergies') || '').trim(),
      chronicConditions: String(formData.get('chronicConditions') || '').trim(),
      bloodType: String(formData.get('bloodType') || '').trim(),
      medicalNotes: String(formData.get('medicalNotes') || '').trim(),
      insuranceProvider: String(formData.get('insuranceProvider') || '').trim(),
      insurancePolicyNumber: String(formData.get('insurancePolicyNumber') || '').trim(),
    };

    if (!payload.firstName || !payload.lastName || !payload.phone) {
      toast.error('First name, last name, and phone are required');
      return;
    }

    setSaving(true);
    try {
      const { data } = await patientApi.update(editingPatient.id, payload);
      const updatedUser = patientToManagedUser(data);
      setPatientUsers((current) => current.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
      setSelectedUser(updatedUser);
      setEditingPatient(null);
      toast.success('Patient updated');
    } catch {
      toast.error('Failed to update patient');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500">Manage access for administrators, clinicians, and patients.</p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={15} />
          Add User
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Users', value: stats.active, sub: `${users.length} total accounts`, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Clinical Staff', value: stats.clinical, sub: 'Doctors and nurses', icon: Stethoscope, color: 'bg-teal-50 text-teal-600' },
          { label: 'Pending Invites', value: stats.pending, sub: 'Awaiting account setup', icon: Mail, color: 'bg-amber-50 text-amber-600' },
          { label: 'Patients', value: patientStats?.totalPatients ?? patientUsers.length, sub: `${patientStats?.activePatients ?? 0} active patients`, icon: ShieldCheck, color: 'bg-purple-50 text-purple-600' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">{card.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon size={15} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Activity size={11} className="text-green-500" />
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex bg-white border border-gray-200 rounded-xl p-1">
          {roleOptions.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                roleFilter === role ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {role === 'ALL' ? 'All' : role.charAt(0) + role.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status === 'ALL' ? 'All statuses' : status}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 text-sm border border-gray-300 rounded-xl px-3 py-2 text-gray-600 hover:bg-gray-50">
            <Filter size={14} />
            More filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-4">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">User</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Department</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Last Login</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedUser?.id === user.id ? 'bg-blue-50/50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-800 text-xs font-semibold">
                          {user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.department}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.lastLogin}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          if (user.patient) {
                            setEditingPatient(user.patient);
                          } else {
                            toast.success('Demo edit action');
                          }
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title={user.patient ? 'Edit patient' : 'Edit user'}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          toast.success('Password reset link queued');
                        }}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Reset password"
                      >
                        <KeyRound size={15} />
                      </button>
                      {!user.patient && (user.status === 'SUSPENDED' ? (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleStatusChange(user.id, 'ACTIVE');
                          }}
                          className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Activate user"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      ) : (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleStatusChange(user.id, 'SUSPENDED');
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Suspend user"
                        >
                          <XCircle size={15} />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {!patientsLoading && filteredUsers.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">Showing {filteredUsers.length} of {users.length} users</span>
            <div className="flex gap-1">
              <button className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40" disabled>Previous</button>
              <button className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg">1</button>
              <button className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>

        <aside className="bg-white rounded-xl border border-gray-200 p-5 h-fit">
          {selectedUser ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-800 text-sm font-semibold">
                      {selectedUser.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-xs text-gray-500">@{selectedUser.username}</p>
                  </div>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg" title="More actions">
                  <MoreHorizontal size={17} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">User ID</p>
                  <p className="font-medium text-gray-900 mt-1 break-all">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Joined</p>
                  <p className="font-medium text-gray-900 mt-1">{selectedUser.joinedAt}</p>
                </div>
                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="font-medium text-gray-900 mt-1">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium text-gray-900 mt-1">{selectedUser.status}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 mb-2">Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.permissions.map((permission) => (
                    <span key={permission} className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => selectedUser.patient ? setEditingPatient(selectedUser.patient) : toast.success('Demo edit action')}
                  className="w-full flex items-center justify-center gap-2 text-sm bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700"
                >
                  <UserCog size={15} />
                  {selectedUser.patient ? 'Edit Patient' : 'Edit Access'}
                </button>
                <a
                  href={`mailto:${selectedUser.email}`}
                  className="w-full flex items-center justify-center gap-2 text-sm border border-gray-300 text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50"
                >
                  <Mail size={15} />
                  Send Email
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <Users size={28} className="mx-auto text-gray-300" />
              <p className="text-sm font-medium text-gray-900 mt-3">No user selected</p>
            </div>
          )}
        </aside>
      </div>

      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 px-4">
          <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Add User</h3>
                <p className="text-xs text-gray-500">Create a demo account for this screen.</p>
              </div>
              <button onClick={() => setShowAddUser(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">First name</span>
                  <input name="firstName" className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Last name</span>
                  <input name="lastName" className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="text-xs font-medium text-gray-600">Email</span>
                <input name="email" type="email" className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Role</span>
                  <select name="role" className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="NURSE">Nurse</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Department</span>
                  <input name="department" placeholder="Patient Portal" className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddUser(false)} className="text-sm border border-gray-300 rounded-xl px-4 py-2 text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="text-sm bg-blue-600 text-white rounded-xl px-4 py-2 hover:bg-blue-700">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 px-4">
          <div className="w-full max-w-2xl bg-white rounded-xl border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Edit Patient</h3>
                <p className="text-xs text-gray-500">Changes are saved through Patient Service.</p>
              </div>
              <button onClick={() => setEditingPatient(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleEditPatient} className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">First name</span>
                  <input name="firstName" defaultValue={editingPatient.firstName} className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Last name</span>
                  <input name="lastName" defaultValue={editingPatient.lastName} className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Phone</span>
                  <input name="phone" defaultValue={editingPatient.phone} className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Address</span>
                  <input name="address" defaultValue={editingPatient.address ?? ''} className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Insurance provider</span>
                  <input name="insuranceProvider" defaultValue={editingPatient.insuranceProvider ?? ''} className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">City</span>
                  <input name="city" defaultValue={editingPatient.city ?? ''} className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">State</span>
                  <input name="state" defaultValue={editingPatient.state ?? ''} className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">ZIP</span>
                  <input name="zipCode" defaultValue={(editingPatient as Patient & { zipCode?: string }).zipCode ?? ''} className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Country</span>
                  <input name="country" defaultValue={(editingPatient as Patient & { country?: string }).country ?? 'US'} className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Allergies</span>
                  <textarea name="allergies" defaultValue={editingPatient.allergies ?? ''} className="w-full min-h-20 text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Chronic conditions</span>
                  <textarea name="chronicConditions" defaultValue={editingPatient.chronicConditions ?? ''} className="w-full min-h-20 text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Blood type</span>
                  <input name="bloodType" defaultValue={editingPatient.bloodType ?? ''} className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Policy number</span>
                  <input name="insurancePolicyNumber" defaultValue={(editingPatient as Patient & { insurancePolicyNumber?: string }).insurancePolicyNumber ?? ''} className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Medical notes</span>
                  <input name="medicalNotes" defaultValue={(editingPatient as Patient & { medicalNotes?: string }).medicalNotes ?? ''} className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingPatient(null)} className="text-sm border border-gray-300 rounded-xl px-4 py-2 text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="text-sm bg-blue-600 text-white rounded-xl px-4 py-2 hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
