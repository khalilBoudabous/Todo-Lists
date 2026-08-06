'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { userApi } from '@/services/api';
import type { User, UserListResponse } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Eye, Pencil, Ban, CheckCircle, Trash2 } from 'lucide-react';

function UsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number } | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | boolean> = {};
      if (debouncedSearchQuery) params.query = debouncedSearchQuery;
      const response = await userApi.getAll(params);
      const data = response.data as UserListResponse;
      setUsers(data.data || []);
      setPagination(data.pagination || null);
    } catch {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await userApi.delete(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await userApi.toggleStatus(id, !currentStatus);
      setUsers(users.map((u) => u.id === id ? { ...u, isEnabled: !currentStatus } : u));
    } catch (err) {
      setError('Failed to toggle user status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Users</h1>
        <Link href="/dashboard/admin/users/create" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2">
          Create User
        </Link>
      </div>
      {error && (
        <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <button type="submit" className="ml-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg">
          Search
        </button>
      </form>
      <div className="bg-card-bg rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-card-bg divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">{user?.roles?.[0]?.replace('ROLE_', '')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.isEnabled ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'}`}>
                    {user.isEnabled ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                  <div className="flex items-center gap-3">
                    <Link href={`/dashboard/admin/users/${user.id}`} className="text-primary hover:text-primary-dark" title="View">
                      <Eye size={18} />
                    </Link>
                    <Link href={`/dashboard/admin/users/${user.id}/edit`} className="text-warning hover:text-warning" title="Edit">
                      <Pencil size={18} />
                    </Link>
                    <button onClick={() => handleToggleStatus(user.id, user.isEnabled)} className={user.isEnabled ? 'text-danger hover:text-danger' : 'text-success hover:text-success'} title={user.isEnabled ? 'Disable' : 'Enable'}>
                      {user.isEnabled ? <Ban size={18} /> : <CheckCircle size={18} />}
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="text-danger hover:text-danger" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
      <UsersContent />
    </ProtectedRoute>
  );
}
