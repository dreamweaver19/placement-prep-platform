import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpenCheck, Bot, LayoutDashboard, LibraryBig, LogOut, UserRound, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dsa', label: 'DSA Tracker', icon: BookOpenCheck },
  { to: '/questions', label: 'Question Bank', icon: LibraryBig },
  { to: '/interview', label: 'Mock Interview', icon: Bot },
  { to: '/resume', label: 'Resume Analyzer', icon: FileText },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Placement Prep</p>
            <h1 className="text-lg font-semibold text-slate-950">Career Command Center</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{user?.name || 'Student'}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950',
                  isActive && 'bg-slate-950 text-white hover:bg-slate-950 hover:text-white'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
