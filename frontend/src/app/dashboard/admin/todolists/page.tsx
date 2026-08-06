'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminTodoListApi, userApi } from '@/services/api';
import type { User, TodoList } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Eye, Trash2, Plus } from 'lucide-react';

function AdminTodoListsContent() {
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAll({ limit: 100 });
      const data = response.data as { data: User[] };
      setUsers(data.data || []);
    } catch {
      // ignore
    }
  };

  const fetchTodoLists = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { limit: 100 };
      if (selectedUserId) params.userId = parseInt(selectedUserId);
      const response = await adminTodoListApi.getAll(params);
      const data = response.data as { data: TodoList[] };
      setTodoLists(data.data || []);
    } catch {
      setError('Failed to fetch todo lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchTodoLists();
  }, [selectedUserId]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await adminTodoListApi.delete(id);
      setTodoLists(todoLists.filter((tl) => tl.id !== id));
    } catch {
      setError('Failed to delete todo list');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Todo Lists</h1>
        <Link href="/dashboard/admin/todolists/create" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} />
          Create Todo List
        </Link>
      </div>
      {error && (
        <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-1">Filter by User</label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">All Users</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName} ({user.email})
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Tasks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card-bg divide-y divide-border">
              {todoLists.map((todoList) => (
                <tr key={todoList.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {todoList.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                    {todoList.user?.firstName} {todoList.user?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                    {todoList.tasks?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                    {todoList.createdAt ? new Date(todoList.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                    <div className="flex items-center gap-3">
                      <Link href={`/dashboard/admin/todolists/${todoList.id}`} className="text-primary hover:text-primary-dark" title="View">
                        <Eye size={18} />
                      </Link>
                      <button onClick={() => handleDelete(todoList.id)} className="text-danger hover:text-danger" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {todoLists.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-muted">
                    No todo lists found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminTodoListsPage() {
  return (
    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
      <AdminTodoListsContent />
    </ProtectedRoute>
  );
}
