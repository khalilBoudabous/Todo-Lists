'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Logo from '@/components/Logo';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    passwordConfirm: z.string(),
    role: z.string().optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ['passwordConfirm'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    const success = await registerUser(data);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="max-w-md w-full bg-card-bg rounded-lg shadow-md p-8 border border-border">
          <h1 className="text-2xl font-bold text-center text-foreground mb-6">Register</h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  First Name
                </label>
                <input
                  {...register('firstName')}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card-bg"
                  placeholder="First name"
                />
                {errors.firstName && (
                  <p className="text-danger text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Last Name
                </label>
                <input
                  {...register('lastName')}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card-bg"
                  placeholder="Last name"
                />
                {errors.lastName && (
                  <p className="text-danger text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card-bg"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-danger text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Role
              </label>
              <select
                {...register('roles')}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card-bg"
              >
                <option value="ROLE_USER">User</option>
                <option value="ROLE_ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card-bg"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-danger text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Confirm Password
              </label>
              <input
                {...register('passwordConfirm')}
                type="password"
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card-bg"
                placeholder="Confirm your password"
              />
              {errors.passwordConfirm && (
                <p className="text-danger text-sm mt-1">{errors.passwordConfirm.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary-dark">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
