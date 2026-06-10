import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../utils/store';
import { Eye, EyeOff, Mail, Lock, User, Zap, ArrowRight } from 'lucide-react';

const iconStyle = { width: '18px', height: '18px' };

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const success = await register(email, username, password);
    if (success) {
      toast.success('Account created! Please sign in. 🎉');
      navigate('/login');
    } else {
      const storeError = useAuthStore.getState().error;
      toast.error(storeError || 'Registration failed. Please try again.');
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow text-sm';

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/40 p-8 border border-gray-100 dark:border-gray-700/50">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg shadow-blue-500/30">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold gradient-text mb-1">TaskManager</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Create your free account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500 pointer-events-none" style={iconStyle} />
              <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" className={inputClass} required />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500 pointer-events-none" style={iconStyle} />
              <input id="reg-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="john_doe" className={inputClass} required />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500 pointer-events-none" style={iconStyle} />
              <input id="reg-password" type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters"
                className={`${inputClass} pr-11`} required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                {showPassword ? <EyeOff style={iconStyle} /> : <Eye style={iconStyle} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500 pointer-events-none" style={iconStyle} />
              <input id="reg-confirm" type={showPassword ? 'text' : 'password'} value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                className={inputClass} required />
            </div>
          </div>

          {/* Submit */}
          <button
            id="reg-submit"
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="animate-pulse">Creating account...</span>
            ) : (
              <>
                Create Account <ArrowRight style={iconStyle} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
