'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

function ChangePasswordContent() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await authApi.changePassword(data);
      if (response.data.success) {
        setSuccess('Password changed successfully');
      } else {
        setError(response.data.message || 'Failed to change password');
      }
    } catch (err) {
      setError('An error occurred');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">Change Password</h1>
      <div className="max-w-2xl bg-card-bg rounded-lg shadow p-6">
        {error && (
          <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-success text-success px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Current Password</label>
            <input
              {...register('currentPassword')}
              type="password"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.currentPassword && (
              <p className="text-danger text-sm mt-1">{errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
            <input
              {...register('newPassword')}
              type="password"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.newPassword && (
              <p className="text-danger text-sm mt-1">{errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Confirm New Password</label>
            <input
              {...register('confirmPassword')}
              type="password"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.confirmPassword && (
              <p className="text-danger text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <ChangePasswordContent />
    </ProtectedRoute>
  );
}