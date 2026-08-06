'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { todoListApi } from '@/services/api';
import type { TodoList } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Eye, Pencil, Trash2, Plus } from 'lucide-react';

function TodoListsContent() {
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTodoLists = async () => {
      try {
        const response = await todoListApi.getAll();
        setTodoLists(response.data.data || []);
      } catch (err) {
        setError('Failed to fetch todo lists');
      } finally {
        setLoading(false);
      }
    };
    fetchTodoLists();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await todoListApi.delete(id);
      setTodoLists(todoLists.filter((tl) => tl.id !== id));
    } catch (err) {
      setError('Failed to delete todo list');
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
        <h1 className="text-3xl font-bold text-foreground">My Todo Lists</h1>
        <Link
          href="/dashboard/todolists/create"
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Create Todo List
        </Link>
      </div>
      {error && (
        <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {todoLists.map((todoList) => (
          <div key={todoList.id} className="bg-card-bg rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">{todoList.title}</h3>
            <p className="text-muted mb-4">{todoList.description}</p>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/todolists/${todoList.id}`}
                className="bg-primary-light text-primary-dark px-3 py-1.5 rounded text-sm hover:bg-primary/20 flex items-center gap-1"
                title="View Tasks"
              >
                <Eye size={16} />
                View Tasks
              </Link>
              <Link
                href={`/dashboard/todolists/${todoList.id}/edit`}
                className="bg-yellow-50 text-warning px-3 py-1.5 rounded text-sm hover:bg-yellow-100 flex items-center gap-1"
                title="Edit"
              >
                <Pencil size={16} />
                Edit
              </Link>
              <button
                onClick={() => handleDelete(todoList.id)}
                className="bg-red-50 text-danger px-3 py-1.5 rounded text-sm hover:bg-red-100 flex items-center gap-1"
                title="Delete"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
        {todoLists.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted">
            No todo lists yet. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
}

export default function TodoListsPage() {
  return (
    <ProtectedRoute>
      <TodoListsContent />
    </ProtectedRoute>
  );
}
