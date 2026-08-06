'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminTodoListApi, userApi } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';

const todoListSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
});

type TodoListForm = z.infer<typeof todoListSchema>;

function CreateTodoListContent() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<TodoListForm>({
    resolver: zodResolver(todoListSchema),
  });

  const [users, setUsers] = useState<{ id: number; firstName: string; lastName: string; email: string }[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userApi.getAll({ limit: 100 });
        const data = response.data as { data: { id: number; firstName: string; lastName: string; email: string }[] };
        setUsers(data.data || []);
      } catch {
        setError('Failed to fetch users');
      } finally {
        setFetching(false);
      }
    };
    fetchUsers();
  }, []);

  const onSubmit = async (data: TodoListForm) => {
    setLoading(true);
    setError('');
    try {
      await adminTodoListApi.createForUser(parseInt(data.userId), {
        title: data.title,
        description: data.description,
      });
      router.push('/dashboard/admin/todolists');
    } catch {
      setError('Failed to create todo list');
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
        <h1 className="text-3xl font-bold text-foreground mb-6">Create Todo List</h1>
        {error && (
          <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">User</label>
            <select
              {...register('userId')}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
            {errors.userId && (
              <p className="text-danger text-sm mt-1">{errors.userId.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title</label>
            <input
              {...register('title')}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Todo list title"
            />
            {errors.title && (
              <p className="text-danger text-sm mt-1">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Description (optional)"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? 'Creating...' : 'Create Todo List'}
            </button>
            <Link
              href="/dashboard/admin/todolists"
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

export default function CreateTodoListPage() {
  return (
    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
      <CreateTodoListContent />
    </ProtectedRoute>
  );
}
