import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../../api/services';
import { Card, Button, Input, Avatar, Badge } from '../../components/common';
import { useAppSelector } from '../../hooks/redux';
import { Lock, User, Shield, Eye, EyeOff } from 'lucide-react';
import type { ChangePasswordRequest } from '../../types';

export const ProfilePage: React.FC = () => {
  const user = useAppSelector(s => s.auth.user);
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<ChangePasswordRequest & { confirmPassword: string }>();
  const newPw = watch('newPassword');

  const handleChangePassword = async (data: ChangePasswordRequest) => {
    setPwLoading(true);
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully');
      reset();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your account settings</p>
      </div>

      {/* Profile info */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <Avatar name={`${user.firstName} ${user.lastName}`} size="lg" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{user.firstName} {user.lastName}</h2>
            <p className="text-slate-500 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge status="ACTIVE" label={user.role} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 text-sm">
          {[
            ['Username', user.username, <User className="w-4 h-4 text-slate-400" />],
            ['Email', user.email, <Shield className="w-4 h-4 text-slate-400" />],
            ['First Name', user.firstName, <User className="w-4 h-4 text-slate-400" />],
            ['Last Name', user.lastName, <User className="w-4 h-4 text-slate-400" />],
            ['Role', user.role, <Shield className="w-4 h-4 text-slate-400" />],
            ['User ID', user.id?.slice(0, 8) + '...', <Shield className="w-4 h-4 text-slate-400" />],
          ].map(([label, value, icon]) => (
            <div key={String(label)} className="flex items-start gap-3">
              <div className="mt-0.5">{icon as React.ReactNode}</div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label as string}</p>
                <p className="text-slate-900 font-medium mt-0.5">{value as string}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Change password */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900">Change Password</h3>
        </div>
        <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-4 max-w-sm">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                {...register('currentPassword', { required: 'Required' })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current password"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-xs text-red-600">{errors.currentPassword.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                {...register('newPassword', { required: 'Required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-xs text-red-600">{errors.newPassword.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Required',
                validate: val => val === newPw || 'Passwords do not match',
              })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" loading={pwLoading} icon={<Lock className="w-4 h-4" />}>
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
};
