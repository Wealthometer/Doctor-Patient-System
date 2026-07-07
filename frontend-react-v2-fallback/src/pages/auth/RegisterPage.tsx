import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Activity } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { register as registerAction, clearError } from '../../store/slices/authSlice';
import { Input, Select, Button } from '../../components/common';

const schema = z.object({
  username: z.string().min(3, 'Minimum 3 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  role: z.enum(['ADMIN', 'DOCTOR', 'PATIENT', 'NURSE']),
});
type FormData = z.infer<typeof schema>;

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useAppSelector(s => s.auth);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'PATIENT' },
  });

  useEffect(() => {
    if (user) navigate('/app/dashboard', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const onSubmit = (data: FormData) => {
    dispatch(registerAction(data));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 mt-1 text-sm">Join the HealthCare platform</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">First Name</label>
                <input {...register('firstName')} placeholder="John"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                {errors.firstName && <p className="text-xs text-red-400">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Last Name</label>
                <input {...register('lastName')} placeholder="Doe"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                {errors.lastName && <p className="text-xs text-red-400">{errors.lastName.message}</p>}
              </div>
            </div>

            {[
              { name: 'username', label: 'Username', placeholder: 'johndoe', type: 'text' },
              { name: 'email', label: 'Email', placeholder: 'john@example.com', type: 'email' },
              { name: 'password', label: 'Password', placeholder: 'Min. 8 characters', type: 'password' },
            ].map(field => (
              <div key={field.name} className="space-y-1">
                <label className="text-sm font-medium text-slate-300">{field.label}</label>
                <input {...register(field.name as any)} type={field.type} placeholder={field.placeholder}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                {(errors as any)[field.name] && <p className="text-xs text-red-400">{(errors as any)[field.name]?.message}</p>}
              </div>
            ))}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Role</label>
              <select {...register('role')}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {['PATIENT', 'DOCTOR', 'NURSE', 'ADMIN'].map(r => (
                  <option key={r} value={r} className="bg-slate-800">{r}</option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-all mt-2 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
