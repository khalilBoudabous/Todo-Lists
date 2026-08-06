'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { taskApi } from '@/services/api';
import type { Task } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Pencil, ArrowLeft } from 'lucide-react';

function TaskDetailContent({ id }: { id: string }) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await taskApi.getOne(parseInt(id));
        setTask(response.data.data);
      } catch (err) {
        setError('Failed to fetch task');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!task) {
    return <div className="text-center py-8">Task not found</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">{task.title}</h1>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/tasks/${task.id}/edit`}
            className="bg-yellow-50 text-warning px-4 py-2 rounded-lg hover:bg-yellow-100 flex items-center gap-2"
          >
            <Pencil size={18} />
            Edit Task
          </Link>
          <Link
            href={`/dashboard/admin/todolists`}
            className="border border-border text-foreground hover:bg-background px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to List
          </Link>
        </div>
      </div>
      {error && (
        <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="bg-card-bg rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted">Description</label>
          <p className="mt-1 text-foreground">{task.description || '-'}</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted">Status</label>
            <p className="mt-1 text-foreground capitalize">{task.status.replace('_', ' ')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted">Priority</label>
            <p className="mt-1 text-foreground capitalize">{task.priority}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted">Due Date</label>
            <p className="mt-1 text-foreground">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRoute>
      <TaskDetailContent id={id} />
    </ProtectedRoute>
  );
}
