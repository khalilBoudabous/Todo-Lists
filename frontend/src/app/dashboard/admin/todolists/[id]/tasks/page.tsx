'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { adminTodoListApi } from '@/services/api';
import type { Task, TaskStatus } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';

function AdminTasksContent({ id }: { id: string }) {
  const todoListId = parseInt(id);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await adminTodoListApi.getTasks(todoListId);
        setTasks(response.data.data || []);
      } catch (err) {
        setError('Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [todoListId]);

  const handleDelete = async (taskId: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await taskApi.delete(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statusBadge = (status: TaskStatus) => {
    const colors: Record<TaskStatus, string> = {
      pending: 'bg-yellow-50 text-warning',
      in_progress: 'bg-primary-light text-primary-dark',
      completed: 'bg-green-50 text-success',
    };
    return <span className={`px-2 py-1 rounded-full text-xs ${colors[status]}`}>{status}</span>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
        <Link
          href={`/dashboard/admin/todolists/${todoListId}/tasks/create`}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Add Task
        </Link>
      </div>
      {error && (
        <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
        <div className="bg-card-bg rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-border">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card-bg divide-y divide-border">
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{task.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                  {statusBadge(task.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">{task.priority}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                  <div className="flex items-center gap-3">
                    <Link href={`/dashboard/tasks/${task.id}`} className="text-primary hover:text-primary-dark" title="View">
                      <Eye size={18} />
                    </Link>
                    <Link href={`/dashboard/tasks/${task.id}/edit`} className="text-yellow-600 hover:text-warning" title="Edit">
                      <Pencil size={18} />
                    </Link>
                    <button onClick={() => handleDelete(task.id)} className="text-danger hover:text-danger" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-muted">No tasks found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
      <AdminTasksContent id={id} />
    </ProtectedRoute>
  );
}
