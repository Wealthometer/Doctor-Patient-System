import { useEffect, useMemo, useState } from 'react';
import { Activity, Building2, CalendarDays, Search, Stethoscope, Users } from 'lucide-react';
import { doctorApi } from '@/api/services';
import type { Doctor, DoctorStats, DoctorStatus } from '@/types';
import toast from 'react-hot-toast';

const doctorStatusColors: Record<DoctorStatus, string> = {
  ACTIVE: 'bg-green-50 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  ON_LEAVE: 'bg-amber-50 text-amber-700',
  SUSPENDED: 'bg-red-50 text-red-600',
};

interface DepartmentGroup {
  name: string;
  doctors: Doctor[];
  specializations: string[];
}

export default function DepartmentsPage() {
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const [statsRes, doctorsRes] = await Promise.all([
          doctorApi.getStats(),
          doctorApi.getAll({ size: 200, sort: 'department' }),
        ]);
        setStats(statsRes.data);
        setDoctors(doctorsRes.data.content);
        setSelectedDepartment(statsRes.data.departments[0] ?? doctorsRes.data.content[0]?.department ?? null);
      } catch {
        toast.error('Could not load doctor departments');
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, []);

  const departments = useMemo<DepartmentGroup[]>(() => {
    const grouped = new Map<string, Doctor[]>();
    doctors.forEach((doctor) => {
      const key = doctor.department || 'Unassigned';
      grouped.set(key, [...(grouped.get(key) ?? []), doctor]);
    });

    return Array.from(grouped.entries()).map(([name, departmentDoctors]) => ({
      name,
      doctors: departmentDoctors,
      specializations: Array.from(new Set(departmentDoctors.map((doctor) => doctor.specialization).filter(Boolean))),
    }));
  }, [doctors]);

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return departments;

    return departments.filter((department) =>
      department.name.toLowerCase().includes(query) ||
      department.specializations.some((specialization) => specialization.toLowerCase().includes(query)) ||
      department.doctors.some((doctor) => (doctor.fullName || `${doctor.firstName} ${doctor.lastName}`).toLowerCase().includes(query))
    );
  }, [departments, search]);

  const selected = departments.find((department) => department.name === selectedDepartment) ?? departments[0];
  const activeDoctors = doctors.filter((doctor) => doctor.status === 'ACTIVE').length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Departments</h2>
        <p className="text-sm text-gray-500">Departments and assigned doctors from doctor-service.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Departments', value: stats?.departments.length ?? departments.length, sub: 'From doctor stats', icon: Building2, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Doctors', value: stats?.totalDoctors ?? doctors.length, sub: `${activeDoctors} active clinicians`, icon: Stethoscope, color: 'bg-teal-50 text-teal-600' },
          { label: 'On Leave', value: stats?.onLeaveDoctors ?? doctors.filter((d) => d.status === 'ON_LEAVE').length, sub: 'Current doctor status', icon: CalendarDays, color: 'bg-amber-50 text-amber-600' },
          { label: 'Specializations', value: stats?.specializations.length ?? 0, sub: 'Active specializations', icon: Activity, color: 'bg-purple-50 text-purple-600' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-lg border border-gray-200 p-4">
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

      <div className="relative w-full max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search departments or doctors..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Department</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Doctors</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Active</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Specializations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading departments...</td></tr>
              ) : filteredDepartments.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No departments found.</td></tr>
              ) : filteredDepartments.map((department) => (
                <tr
                  key={department.name}
                  onClick={() => setSelectedDepartment(department.name)}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${selected?.name === department.name ? 'bg-blue-50/50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 size={16} className="text-blue-700" />
                      </div>
                      <p className="font-medium text-gray-900">{department.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{department.doctors.length}</td>
                  <td className="px-4 py-3 text-gray-600">{department.doctors.filter((doctor) => doctor.status === 'ACTIVE').length}</td>
                  <td className="px-4 py-3 text-gray-600">{department.specializations.join(', ') || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="bg-white rounded-lg border border-gray-200 p-5 h-fit">
          {selected ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 size={19} className="text-blue-700" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{selected.name}</h3>
                  <p className="text-xs text-gray-500">{selected.doctors.length} assigned doctors</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 mb-2">Specializations</h4>
                <div className="flex flex-wrap gap-2">
                  {selected.specializations.map((specialization) => (
                    <span key={specialization} className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                      {specialization}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-500">Doctors</h4>
                  <span className="text-xs text-gray-400">{selected.doctors.length} shown</span>
                </div>
                <div className="space-y-2">
                  {selected.doctors.length > 0 ? selected.doctors.map((doctor) => (
                    <div key={doctor.id} className="border border-gray-100 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doctor.fullName || `${doctor.firstName} ${doctor.lastName}`}</p>
                          <p className="text-xs text-gray-500">{doctor.doctorCode} - {doctor.specialization}</p>
                        </div>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${doctorStatusColors[doctor.status]}`}>
                          {doctor.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>Rating {doctor.averageRating.toFixed(1)}</span>
                        <span>{doctor.consultationFee || 'No fee listed'}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg">
                      <Users size={22} className="mx-auto text-gray-300" />
                      <p className="text-xs text-gray-500 mt-2">No doctors assigned yet</p>
                    </div>
                  )}
                </div>
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
    </div>
  );
}
