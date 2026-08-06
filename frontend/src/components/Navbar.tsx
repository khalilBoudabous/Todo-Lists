'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Mail, Shield } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="bg-card-bg shadow-sm border-b border-border px-6 py-4">
        <div className="flex justify-between items-center">
          <Logo size={32} textColor="text-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-bg shadow-sm border-b border-border px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo size={28} textColor="text-foreground" />
          <h2 className="text-xl font-semibold text-foreground">
            Welcome, {user?.firstName}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <Mail size={16} />
            <span>{user?.email}</span>
          </div>
          <span className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full flex items-center gap-1">
            <Shield size={12} />
            {user?.roles?.[0]?.replace('ROLE_', '')}
          </span>
        </div>
      </div>
    </div>
  );
}