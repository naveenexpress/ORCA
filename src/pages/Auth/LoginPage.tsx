import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, Waves, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginDemoUser, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('fisherman@orca.marine');
  const [password, setPassword] = useState('password123');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setLocalError(result.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleQuickDemoRole = async (role: UserRole) => {
    setLocalError(null);
    clearError();
    await loginDemoUser(role);
    navigate('/dashboard');
  };

  const activeError = localError || error;

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-marine-900 border border-marine-750 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-marine-500 to-cyan-300 p-0.5 flex items-center justify-center shadow-glow-cyan mx-auto">
            <div className="w-full h-full bg-marine-950 rounded-[14px] flex items-center justify-center">
              <Waves className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to ORCA</h2>
          <p className="text-xs text-slate-400">Ocean Reasoning with Collaborative Agents</p>
        </div>

        {/* Server Validation Error Banner */}
        {activeError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{activeError}</span>
          </div>
        )}

        {/* Demo Fast Login Buttons */}
        <div className="p-3 bg-marine-950 border border-cyan-900/60 rounded-2xl space-y-2">
          <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block text-center">
            ⚡ Quick Demo Role Sign-In:
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleQuickDemoRole('fisherman')}
              disabled={isLoading}
              className="p-2 bg-marine-900 hover:bg-marine-800 rounded-xl text-left flex items-center gap-1.5 text-slate-200 disabled:opacity-50"
            >
              <span>🎣 Fisherman</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoRole('disaster_authority')}
              disabled={isLoading}
              className="p-2 bg-marine-900 hover:bg-marine-800 rounded-xl text-left flex items-center gap-1.5 text-slate-200 disabled:opacity-50"
            >
              <span>🚨 Disaster SDMA</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoRole('researcher')}
              disabled={isLoading}
              className="p-2 bg-marine-900 hover:bg-marine-800 rounded-xl text-left flex items-center gap-1.5 text-slate-200 disabled:opacity-50"
            >
              <span>🔬 Researcher</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoRole('agent')}
              disabled={isLoading}
              className="p-2 bg-marine-900 hover:bg-marine-800 rounded-xl text-left flex items-center gap-1.5 text-slate-200 disabled:opacity-50"
            >
              <span>📱 Field Agent</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-marine-950 border border-marine-750 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-cyan-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-marine-950 border border-marine-750 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs rounded-xl shadow-glow-cyan flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 font-bold hover:underline">
            Register for access
          </Link>
        </p>
      </div>
    </div>
  );
};
