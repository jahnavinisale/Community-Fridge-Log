import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Refrigerator, ShieldCheck, UserCheck, Lock, Mail } from 'lucide-react';
import { FormField } from '../components/FormField.jsx';
import { usePageTitle } from '../utils/usePageTitle.js';

export const Login = () => {
  usePageTitle('Sign In');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#FAF8F4]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-[#1F5E43] text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Refrigerator className="w-7 h-7" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1C1B19]">
          Community Fridge Log
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Authorised Volunteer &amp; Stock Management Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xs rounded-2xl border border-stone-200 sm:px-10">
          {error && (
            <div
              className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 font-medium"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <FormField id="login-email" label="Volunteer Email" required>
              <div className="relative">
                <input
                  type="email"
                  id="login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="volunteer@communityfridge.org"
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                  required
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" aria-hidden="true" />
              </div>
            </FormField>

            <FormField id="login-password" label="Password" required>
              <div className="relative">
                <input
                  type="password"
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1F5E43] touch-target"
                  required
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" aria-hidden="true" />
              </div>
            </FormField>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-[#1F5E43] hover:bg-[#184D37] active:bg-[#123D2B] transition-colors focus:outline-none touch-target mt-2"
            >
              {submitting ? 'Authenticating...' : 'Sign In to Fridge Portal'}
            </button>
          </form>

          {/* Quick Demo Login Credentials for Evaluation */}
          <div className="mt-6 pt-5 border-t border-stone-200">
            <p className="text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wider">
              Quick Demo Login (Sample Accounts):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@communityfridge.org', 'AdminPass123!')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-medium text-stone-800 touch-target"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#1F5E43]" />
                Admin Demo
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('sarah.volunteer@communityfridge.org', 'Volunteer123!')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-medium text-stone-800 touch-target"
              >
                <UserCheck className="w-3.5 h-3.5 text-stone-600" />
                Volunteer Demo
              </button>
            </div>
            <p className="text-[11px] text-stone-500 mt-3 text-center">
              Internal volunteer portal. No public registration is permitted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
