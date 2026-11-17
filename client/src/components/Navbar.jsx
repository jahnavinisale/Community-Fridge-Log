import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Refrigerator,
  LayoutDashboard,
  Boxes,
  PlusCircle,
  Truck,
  Trash2,
  Users,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  User,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/inventory', icon: Boxes },
    { name: 'Add Donation', path: '/add-item', icon: PlusCircle },
    { name: 'Collections', path: '/collections', icon: Truck },
    { name: 'Disposals', path: '/disposals', icon: Trash2 },
    ...(isAdmin ? [{ name: 'Volunteers', path: '/volunteers', icon: Users }] : []),
  ];

  const getLinkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#1F5E43] text-white'
        : 'text-stone-300 hover:bg-stone-800 hover:text-white'
    }`;

  return (
    <header className="bg-stone-900 border-b border-stone-800 text-white sticky top-0 z-40">
      {/* Skip to main content link for keyboard/screen reader accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1F5E43] focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-2.5 text-white font-bold text-lg tracking-tight hover:opacity-90 focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1F5E43] flex items-center justify-center shadow-xs">
                <Refrigerator className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight">Community Fridge</span>
                <span className="text-xs font-normal text-emerald-400">Inventory &amp; Safe Log</span>
              </div>
            </NavLink>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} className={getLinkClasses}>
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile & Actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2.5 pl-3 border-l border-stone-800">
              <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                ) : (
                  <User className="w-4 h-4 text-stone-300" aria-hidden="true" />
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-stone-200 leading-tight">
                  {user?.name}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  {user?.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition-colors border border-stone-700 ml-1 touch-target"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Log out</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 focus:outline-none touch-target"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-stone-900 border-b border-stone-800 px-4 pt-2 pb-4 space-y-1">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-800 text-sm">
            <div>
              <p className="font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-emerald-400 capitalize">{user?.role} Account</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 text-xs bg-stone-800 hover:bg-stone-700 text-red-300 rounded border border-stone-700 touch-target"
            >
              Log out
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={getLinkClasses}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
