'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { userApi } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';

const editUserSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  roles: z.array(z.string()),
});

type EditUserForm = z.infer<typeof editUserSchema>;

function EditUserContent({ id }: { id: string }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();
  const userId = parseInt(id);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditUserForm>();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userApi.getOne(userId);
        reset({
          firstName: response.data.data.firstName,
          lastName: response.data.data.lastName,
          email: response.data.data.email,
          roles: response.data.data.roles,
        });
      } catch (err) {
        setError('Failed to fetch user');
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
  }, [userId, reset]);

  const onSubmit = async (data: EditUserForm) => {
    setLoading(true);
    setError('');
    try {
      await userApi.update(userId, data);
      router.push('/dashboard/admin/users');
    } catch (err) {
      setError('Failed to update user');
    }
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">Edit User</h1>
        {error && (
          <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.email && (
              <p className="text-danger text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Role</label>
            <select
              {...register('roles')}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="ROLE_USER">User</option>
              <option value="ROLE_ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? 'Updating...' : 'Update User'}
            </button>
            <Link
              href="/dashboard/admin/users"
              className="border border-border text-foreground hover:bg-background font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
      <EditUserContent id={id} />
    </ProtectedRoute>
  );
}
