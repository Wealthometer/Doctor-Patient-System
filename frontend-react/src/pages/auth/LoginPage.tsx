import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginThunk, clearError } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or email is required'),
  password:        z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const { isLoading, error, isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const routes: Record<string, string> = {
        ADMIN: '/admin/dashboard', DOCTOR: '/doctor/dashboard', PATIENT: '/patient/create-profile',
      };
      navigate(routes[user.role] || '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const onSubmit = (data: FormData) => dispatch(loginThunk(data));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">H+</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">HealthCare+</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username/Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username or Email
              </label>
              <input
                {...register('usernameOrEmail')}
                type="text"
                autoComplete="username"
                placeholder="admin or admin@healthcare.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {errors.usernameOrEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.usernameOrEmail.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Register
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-xs font-semibold text-blue-700 mb-2">Demo credentials</p>
            <div className="space-y-1 text-xs text-blue-600">
              <p>Admin: <code className="bg-blue-100 px-1 rounded">admin</code> / <code className="bg-blue-100 px-1 rounded">Admin@123</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
