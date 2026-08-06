'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { statsApi } from '@/services/api';
import type { DashboardStats } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsApi.getDashboardStats();
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Tasks', value: stats?.tasks.total || 0, color: 'bg-primary' },
    { title: 'Completed', value: stats?.tasks.completed || 0, color: 'bg-success' },
    { title: 'Pending', value: stats?.tasks.byStatus.pending || 0, color: 'bg-warning' },
    { title: 'In Progress', value: stats?.tasks.byStatus.in_progress || 0, color: 'bg-accent' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.title} className="bg-card-bg rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${card.color} rounded-lg p-3 mr-4`}>
                <div className="text-white text-2xl font-bold">{card.value}</div>
              </div>
              <div>
                <p className="text-muted text-sm">{card.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-card-bg rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.firstName}!</h2>
        <p className="text-muted">
          You are logged in as <span className="font-medium">{user?.roles?.[0]?.replace('ROLE_', '')}</span>.
          {user?.roles?.includes('ROLE_ADMIN') && ' You have administrative access.'}
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}