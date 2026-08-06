'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, ClipboardList, User, Users, FolderOpen, LogOut } from 'lucide-react';
import Logo from './Logo';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/todolists', label: 'My Todo Lists', icon: ClipboardList },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

const adminItems = [
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/todolists', label: 'All Todo Lists', icon: FolderOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  return (
    <div className="w-64 bg-sidebar-bg text-sidebar-text flex flex-col">
      <div className="p-4 border-b border-white/10">
        <Logo size={32} />
      </div>
      <nav className="flex-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
                pathname === item.href
                  ? 'bg-sidebar-active text-white'
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {isAdmin && adminItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
                pathname.startsWith(item.href)
                  ? 'bg-sidebar-active text-white'
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full bg-danger hover:bg-red-700 text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}