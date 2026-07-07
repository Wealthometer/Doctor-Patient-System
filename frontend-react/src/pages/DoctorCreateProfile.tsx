import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorApi } from '@/api/services';
import { useAppSelector } from '@/store';
import type { CreateDoctorRequest } from '@/types';
import toast from 'react-hot-toast';

export default function DoctorCreateProfile() {
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!user?.id) {
        if (active) setCheckingProfile(false);
        return;
      }

      try {
        await doctorApi.getByUserId(user.id);
        if (active) navigate('/doctor/dashboard', { replace: true });
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status !== 404) {
          toast.error('Could not check your doctor profile.');
        }
      } finally {
        if (active) setCheckingProfile(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate, user?.id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id) {
      toast.error('Could not find your signed-in user. Please sign in again.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const getString = (name: string, fallback = '') => String(formData.get(name) || fallback).trim();
    const getNumber = (name: string, fallback: number) => {
      const value = getString(name);
      return value === '' ? fallback : Number(value);
    };

    const payload: CreateDoctorRequest = {
      userId: user.id,
      firstName: getString('firstName', user.firstName),
      lastName: getString('lastName', user.lastName),
      email: getString('email', user.email),
      phone: getString('phone'),
      specialization: getString('specialization'),
      department: getString('department'),
      licenseNumber: getString('licenseNumber'),
      qualifications: getString('qualifications'),
      yearsOfExperience: getNumber('yearsOfExperience', 0),
      consultationFee: getString('consultationFee'),
      workStartTime: getString('workStartTime', '09:00'),
      workEndTime: getString('workEndTime', '17:00'),
      workDays: getString('workDays', 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY'),
      maxDailyAppointments: getNumber('maxDailyAppointments', 20),
    };

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.phone ||
        !payload.specialization || !payload.department || !payload.licenseNumber) {
      toast.error('Please complete all required doctor profile fields.');
      return;
    }

    setSubmitting(true);

    try {
      await doctorApi.create(payload);
      toast.success('Doctor profile created');
      navigate('/doctor/dashboard', { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string; errors?: Record<string, string> } } };
      const fieldErrors = err.response?.data?.errors;
      const firstFieldError = fieldErrors ? Object.values(fieldErrors)[0] : undefined;
      toast.error(err.response?.data?.detail || firstFieldError || 'Could not create doctor profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingProfile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Doctor Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Complete the clinical profile used by appointments and patient booking.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="firstName" label="First name" defaultValue={user?.firstName} required />
          <Input name="lastName" label="Last name" defaultValue={user?.lastName} required />
          <Input name="email" label="Email" type="email" defaultValue={user?.email} required />
          <Input name="phone" label="Phone" required />
          <Input name="department" label="Department" required />
          <Input name="specialization" label="Specialization" required />
          <Input name="licenseNumber" label="License number" required />
          <Input name="qualifications" label="Qualifications" />
          <Input name="yearsOfExperience" label="Years of experience" type="number" min="0" max="60" defaultValue="0" />
          <Input name="consultationFee" label="Consultation fee" placeholder="150.00" />
          <Input name="workStartTime" label="Work start" type="time" defaultValue="09:00" />
          <Input name="workEndTime" label="Work end" type="time" defaultValue="17:00" />
          <Input name="workDays" label="Work days" defaultValue="MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY" />
          <Input name="maxDailyAppointments" label="Max daily appointments" type="number" min="1" max="50" defaultValue="20" />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {submitting ? 'Creating...' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        {...props}
        className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}
