'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { todoListApi } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

const todoListSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
});

type TodoListForm = z.infer<typeof todoListSchema>;

function CreateTodoListContent() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TodoListForm>({
    resolver: zodResolver(todoListSchema),
  });

  const onSubmit = async (data: TodoListForm) => {
    setLoading(true);
    setError('');
    try {
      await todoListApi.create(data);
      router.push('/dashboard/todolists');
    } catch (err) {
      setError('Failed to create todo list');
    }
    setLoading(false);
  };

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
            <label className="block text-sm font-medium text-foreground mb-1">
              Title
            </label>
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
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
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
              href="/dashboard/todolists"
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
    <ProtectedRoute>
      <CreateTodoListContent />
    </ProtectedRoute>
  );
}
