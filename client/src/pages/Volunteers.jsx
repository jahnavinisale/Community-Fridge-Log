import React, { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../api/usersApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { FormField } from '../components/FormField.jsx';
import { formatDate } from '../utils/formatters.js';
import { usePageTitle } from '../utils/usePageTitle.js';
import { Users, UserPlus, ShieldCheck, UserCheck, UserX, AlertCircle, Phone, Mail } from 'lucide-react';

export const Volunteers = () => {
  usePageTitle('Volunteer Management');
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New volunteer form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVolunteer, setNewVolunteer] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'volunteer',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await usersApi.list();
      setUsers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load volunteer roster');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleStatus = async (userToUpdate) => {
    if (userToUpdate._id === currentUser.id) {
      showToast('You cannot deactivate your own administrative account', 'error');
      return;
    }

    try {
      const nextActiveState = !userToUpdate.isActive;
      await usersApi.update(userToUpdate._id, { isActive: nextActiveState });
      showToast(
        `Volunteer ${userToUpdate.name} ${nextActiveState ? 'activated' : 'deactivated'}`,
        'success'
      );
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to update user status', 'error');
    }
  };

  const validateNewUser = () => {
    const errs = {};
    if (!newVolunteer.name.trim() || newVolunteer.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }
    if (!newVolunteer.email.trim() || !newVolunteer.email.includes('@')) {
      errs.email = 'Please provide a valid email address';
    }
    if (!newVolunteer.password || newVolunteer.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateNewUser()) return;

    setSubmitting(true);
    try {
      await usersApi.create(newVolunteer);
      showToast(`Created account for ${newVolunteer.name}`, 'success');
      setNewVolunteer({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'volunteer',
      });
      setShowAddForm(false);
      loadUsers();
    } catch (err) {
      setFormErrors({ form: err.message || 'Failed to create volunteer account' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#1C1B19]">
              Volunteer Roster &amp; Access Control
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-[#1F5E43] border border-emerald-300">
              Admin Only
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-0.5">
            Manage authorised fridge volunteers, provision new accounts, and deactivate departing members.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#1F5E43] text-white hover:bg-[#184D37] active:bg-[#123D2B] transition-colors shadow-xs touch-target shrink-0"
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" />
          <span>{showAddForm ? 'Close Volunteer Form' : 'Register New Volunteer'}</span>
        </button>
      </div>

      {/* Add Volunteer Form (Collapsible) */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="border-b border-stone-200 pb-3">
            <h2 className="text-base font-bold text-stone-900">
              Register New Volunteer Account
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Authorised volunteers receive access to inventory intake, collections, and disposal logging.
            </p>
          </div>

          {formErrors.form && (
            <div
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 font-medium flex items-center gap-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{formErrors.form}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FormField id="vol-name" label="Full Name" required error={formErrors.name}>
                <input
                  type="text"
                  id="vol-name"
                  value={newVolunteer.name}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, name: e.target.value })}
                  placeholder="e.g. David Miller"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                  required
                />
              </FormField>

              <FormField id="vol-email" label="Email Address" required error={formErrors.email}>
                <input
                  type="email"
                  id="vol-email"
                  value={newVolunteer.email}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, email: e.target.value })}
                  placeholder="david.volunteer@communityfridge.org"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                  required
                />
              </FormField>

              <FormField
                id="vol-password"
                label="Initial Password"
                required
                error={formErrors.password}
                helpText="Minimum 6 characters."
              >
                <input
                  type="password"
                  id="vol-password"
                  value={newVolunteer.password}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, password: e.target.value })}
                  placeholder="Create secure password"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                  required
                />
              </FormField>

              <FormField id="vol-role" label="Account Role" required>
                <select
                  id="vol-role"
                  value={newVolunteer.role}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, role: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                >
                  <option value="volunteer">Volunteer (Stock, intake, logs)</option>
                  <option value="admin">Administrator (Full privileges)</option>
                </select>
              </FormField>

              <FormField id="vol-phone" label="Phone Number (Optional)">
                <input
                  type="tel"
                  id="vol-phone"
                  value={newVolunteer.phone}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, phone: e.target.value })}
                  placeholder="+44 7700 900000"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                />
              </FormField>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg touch-target"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1F5E43] hover:bg-[#184D37] rounded-lg touch-target disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Confirm Registration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Roster Display */}
      {loading ? (
        <LoadingSpinner label="Loading volunteer roster..." />
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm">
          <p className="font-semibold">Error loading volunteers</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={loadUsers}
            className="mt-3 px-3 py-1.5 bg-red-800 text-white rounded text-xs font-semibold"
          >
            Retry Loading
          </button>
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No registered volunteers found"
          description="Register your first community fridge volunteer using the button above."
        />
      ) : (
        <div className="space-y-4">
          {/* Mobile View: Stacked Cards (visible below md breakpoint) */}
          <div className="md:hidden space-y-3">
            {users.map((u) => {
              const isCurrent = u._id === currentUser?.id;
              return (
                <div
                  key={u._id}
                  className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700">
                        {u.role === 'admin' ? (
                          <ShieldCheck className="w-4 h-4 text-[#1F5E43]" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-stone-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-sm font-bold text-stone-900">{u.name}</h2>
                          {isCurrent && (
                            <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-normal">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 capitalize">{u.role}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        u.isActive
                          ? 'bg-emerald-50 text-[#1F5E43] border-emerald-300'
                          : 'bg-red-50 text-red-800 border-red-300'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="font-mono text-[11px] break-all">{u.email}</span>
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="text-[11px]">{u.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                    <span>Registered: {formatDate(u.createdAt)}</span>

                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors touch-target ${
                          u.isActive
                            ? 'bg-stone-50 hover:bg-red-50 text-red-700 border-red-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-[#1F5E43] border-emerald-300'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Clean Table (visible at md breakpoint and above) */}
          <div className="hidden md:block bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3">Volunteer Name</th>
                    <th scope="col" className="px-4 py-3">Email Address</th>
                    <th scope="col" className="px-4 py-3">Phone</th>
                    <th scope="col" className="px-4 py-3">Role</th>
                    <th scope="col" className="px-4 py-3">Account Status</th>
                    <th scope="col" className="px-4 py-3">Registered Date</th>
                    <th scope="col" className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {users.map((u) => {
                    const isCurrent = u._id === currentUser?.id;
                    return (
                      <tr key={u._id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="px-4 py-3 font-semibold text-stone-900">
                          <div className="flex items-center gap-2">
                            {u.role === 'admin' ? (
                              <ShieldCheck className="w-4 h-4 text-[#1F5E43]" title="Administrator" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-stone-500" title="Volunteer" />
                            )}
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-normal">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-stone-600">{u.email}</td>
                        <td className="px-4 py-3 text-stone-600">{u.phone || '-'}</td>
                        <td className="px-4 py-3 capitalize font-medium">{u.role}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              u.isActive
                                ? 'bg-emerald-50 text-[#1F5E43] border-emerald-300'
                                : 'bg-red-50 text-red-800 border-red-300'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u)}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors touch-target ${
                                u.isActive
                                  ? 'bg-stone-50 hover:bg-red-50 text-red-700 border-red-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-[#1F5E43] border-emerald-300'
                              }`}
                            >
                              {u.isActive ? 'Deactivate' : 'Reactivate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
