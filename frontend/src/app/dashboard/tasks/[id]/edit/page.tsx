'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { taskApi } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';

const taskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().optional(),
});

type TaskForm = z.infer<typeof taskSchema>;

function EditTaskContent({ id }: { id: string }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [todoListId, setTodoListId] = useState<number | null>(null);
  const router = useRouter();
  const taskId = parseInt(id);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskForm>();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await taskApi.getOne(taskId);
        const task = response.data.data;
        setTodoListId(task.todoListId || task.todoList?.id || null);
        reset({
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        });
      } catch (err) {
        setError('Failed to fetch task');
      } finally {
        setFetching(false);
      }
    };
    fetchTask();
  }, [taskId, reset]);

  const onSubmit = async (data: TaskForm) => {
    setLoading(true);
    setError('');
    try {
      await taskApi.update(taskId, data);
      router.push('/dashboard/admin/todolists');
    } catch (err) {
      setError('Failed to update task');
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
        <h1 className="text-3xl font-bold text-foreground mb-6">Edit Task</h1>
        {error && (
          <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title</label>
            <input
              {...register('title')}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Due Date</label>
            <input
              {...register('dueDate')}
              type="date"
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? 'Updating...' : 'Update Task'}
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

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRoute>
      <EditTaskContent id={id} />
    </ProtectedRoute>
  );
}
