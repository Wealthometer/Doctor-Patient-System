import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Save, UserRound } from 'lucide-react';
import { patientApi } from '@/api/services';
import { useAppSelector } from '@/store';
import type { CreatePatientRequest, Gender } from '@/types';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(1, 'Phone is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  bloodType: z.string().optional(),
  medicalNotes: z.string().optional(),
  insuranceProvider: z.string().min(1, 'Insurance provider is required'),
  insurancePolicyNumber: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const optional = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export default function PatientCreateProfile() {
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const defaults = useMemo<FormData>(() => ({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    gender: 'PREFER_NOT_TO_SAY',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    allergies: '',
    chronicConditions: '',
    bloodType: '',
    medicalNotes: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
  }), [user]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!user?.id) return;

      try {
        await patientApi.getByUserId(user.id);
        if (active) navigate('/patient/dashboard', { replace: true });
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status !== 404) {
          toast.error('Could not check your patient profile.');
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

  const onSubmit = async (data: FormData) => {
    if (!user?.id) return;

    setSubmitting(true);
    try {
      const payload: CreatePatientRequest = {
        userId: user.id,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        dateOfBirth: data.dateOfBirth,
        gender: data.gender as Gender,
        address: optional(data.address),
        city: optional(data.city),
        state: optional(data.state),
        zipCode: optional(data.zipCode),
        country: optional(data.country) || 'US',
        emergencyContactName: optional(data.emergencyContactName),
        emergencyContactPhone: optional(data.emergencyContactPhone),
        emergencyContactRelation: optional(data.emergencyContactRelation),
        allergies: optional(data.allergies),
        chronicConditions: optional(data.chronicConditions),
        bloodType: optional(data.bloodType),
        medicalNotes: optional(data.medicalNotes),
        insuranceProvider: data.insuranceProvider.trim(),
        insurancePolicyNumber: optional(data.insurancePolicyNumber),
      };

      await patientApi.create(payload);
      toast.success('Patient profile created');
      navigate('/patient/dashboard', { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string; message?: string } } };
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'Could not create patient profile');
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 mb-3">
          <UserRound size={20} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Create patient profile</h1>
        <p className="text-gray-600 mt-1">Complete your profile before opening your dashboard.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="First name" error={errors.firstName?.message}>
              <input {...register('firstName')} className="form-input" />
            </Field>
            <Field label="Last name" error={errors.lastName?.message}>
              <input {...register('lastName')} className="form-input" />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input {...register('email')} type="email" className="form-input" />
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              <input {...register('phone')} className="form-input" placeholder="(555) 123-4567" />
            </Field>
            <Field label="Date of birth" error={errors.dateOfBirth?.message}>
              <input {...register('dateOfBirth')} type="date" className="form-input" />
            </Field>
            <Field label="Gender" error={errors.gender?.message}>
              <select {...register('gender')} className="form-input">
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Street address">
              <input {...register('address')} className="form-input" />
            </Field>
            <Field label="City">
              <input {...register('city')} className="form-input" />
            </Field>
            <Field label="State">
              <input {...register('state')} className="form-input" />
            </Field>
            <Field label="ZIP code">
              <input {...register('zipCode')} className="form-input" />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical and insurance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Insurance provider" error={errors.insuranceProvider?.message}>
              <input {...register('insuranceProvider')} className="form-input" />
            </Field>
            <Field label="Policy number">
              <input {...register('insurancePolicyNumber')} className="form-input" />
            </Field>
            <Field label="Blood type">
              <input {...register('bloodType')} className="form-input" placeholder="O+" />
            </Field>
            <Field label="Allergies">
              <input {...register('allergies')} className="form-input" placeholder="None" />
            </Field>
            <Field label="Chronic conditions">
              <textarea {...register('chronicConditions')} className="form-input min-h-24" />
            </Field>
            <Field label="Medical notes">
              <textarea {...register('medicalNotes')} className="form-input min-h-24" />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Field label="Name">
              <input {...register('emergencyContactName')} className="form-input" />
            </Field>
            <Field label="Phone">
              <input {...register('emergencyContactPhone')} className="form-input" />
            </Field>
            <Field label="Relation">
              <input {...register('emergencyContactRelation')} className="form-input" />
            </Field>
          </div>
        </section>

        <div className="flex justify-end border-t border-gray-100 pt-5">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-5 rounded-xl text-sm transition-colors"
          >
            {submitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {submitting ? 'Creating profile...' : 'Create profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1.5">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-500 mt-1">{error}</span>}
    </label>
  );
}
