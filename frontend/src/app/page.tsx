'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import { LogIn, UserPlus } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-primary-light to-secondary-light overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center py-6">
            <Logo size={36} />
          {user ? (
            <Link href="/dashboard" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2">
              Dashboard
            </Link>
          ) : (
            <div className="flex gap-4">
              <Link href="/login" className="text-primary hover:text-primary-dark flex items-center gap-1">
                <LogIn size={18} />
                Login
              </Link>
              <Link href="/register" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <UserPlus size={18} />
                Register
              </Link>
            </div>
          )}
        </div>
        <div className="text-center py-20">
          <h2 className="text-4xl font-bold text-foreground mb-4">Manage Your Tasks Efficiently</h2>
          <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
            A powerful todo list application to organize your tasks, boost productivity, and collaborate with your team.
          </p>
          {!user && (
            <div className="flex justify-center gap-4">
              <Link href="/register" className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg text-lg flex items-center gap-2">
                <UserPlus size={20} />
                Get Started
              </Link>
              <Link href="/login" className="border border-primary text-primary hover:bg-primary-light px-6 py-3 rounded-lg text-lg flex items-center gap-2">
                <LogIn size={20} />
                Sign In
              </Link>
            </div>
          )}
         </div>
        </div>
        </div>
      </div>
    );
  }
