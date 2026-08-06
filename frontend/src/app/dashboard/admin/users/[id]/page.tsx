'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { userApi } from '@/services/api';
import type { User } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Pencil, ListTodo } from 'lucide-react';

function UserDetailContent({ id }: { id: string }) {
  const userId = parseInt(id);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userApi.getOne(userId);
        setUser(response.data.data);
      } catch (err) {
        setError('Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-8">User not found</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">User Details</h1>
        <Link
          href={`/dashboard/admin/users/${user.id}/edit`}
          className="bg-yellow-50 text-warning px-4 py-2 rounded-lg hover:bg-yellow-100 flex items-center gap-2"
        >
          <Pencil size={18} />
          Edit User
        </Link>
      </div>
      {error && (
        <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="bg-card-bg rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted">Name</label>
          <p className="mt-1 text-foreground">{user.firstName} {user.lastName}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted">Email</label>
          <p className="mt-1 text-foreground">{user.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted">Role</label>
          <p className="mt-1 text-foreground">{user?.roles?.[0]?.replace('ROLE_', '')}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted">Status</label>
                  <span className={`mt-1 px-2 py-1 rounded-full text-xs ${user.isEnabled ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'}`}>
                    {user.isEnabled ? 'Active' : 'Disabled'}
                  </span>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted">Created At</label>
          <p className="mt-1 text-foreground">{new Date(user.createdAt).toLocaleString()}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted">Updated At</label>
          <p className="mt-1 text-foreground">{new Date(user.updatedAt).toLocaleString()}</p>
        </div>
        <div className="pt-4 border-t">
          <Link
            href={`/dashboard/admin/todolists?userId=${user.id}`}
            className="inline-block bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <ListTodo size={18} />
            View Todo Lists
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
      <UserDetailContent id={id} />
    </ProtectedRoute>
  );
}
