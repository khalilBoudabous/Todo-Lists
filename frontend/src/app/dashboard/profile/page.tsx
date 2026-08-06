'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
});

type ProfileForm = z.infer<typeof profileSchema>;

function ProfileContent() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await authApi.updateProfile(data);
      if (response.data.success) {
        setSuccess('Profile updated successfully');
        updateUser(response.data.data);
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred');
    }
    setLoading(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">Profile</h1>
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
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-border rounded-lg bg-secondary-light"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
              <input
                {...register('firstName')}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.firstName && (
                <p className="text-danger text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
              <input
                {...register('lastName')}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.lastName && (
                <p className="text-danger text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}