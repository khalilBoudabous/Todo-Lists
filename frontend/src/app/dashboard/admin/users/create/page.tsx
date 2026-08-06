'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { userApi } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

const createUserSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  passwordConfirm: z.string(),
  role: z.string().optional(),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

function CreateUserContent() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'ROLE_USER',
    },
  });

  const onSubmit = async (data: CreateUserForm) => {
    setLoading(true);
    setError('');
    try {
      await userApi.create(data);
      router.push('/dashboard/admin/users');
    } catch (err) {
      setError('Failed to create user');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">Create User</h1>
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
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.password && (
              <p className="text-danger text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
            <input
              {...register('passwordConfirm')}
              type="password"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.passwordConfirm && (
              <p className="text-danger text-sm mt-1">{errors.passwordConfirm.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Role</label>
            <select
              {...register('role')}
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
              {loading ? 'Creating...' : 'Create User'}
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

export default function CreateUserPage() {
  return (
    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
      <CreateUserContent />
    </ProtectedRoute>
  );
}
