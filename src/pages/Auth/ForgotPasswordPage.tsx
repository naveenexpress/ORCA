import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-marine-900 border border-marine-750 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="space-y-1 text-center">
          <h2 className="text-xl font-bold text-white">Reset Account Password</h2>
          <p className="text-xs text-slate-400">Enter your registered email address to receive reset instructions.</p>
        </div>

        {sent ? (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-2xl space-y-2 text-center animate-in fade-in">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-bold">Password Reset Link Dispatched</p>
            <p className="text-slate-300 text-[11px]">Check your inbox for OTP reset verification.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="skipper@boat.com"
                className="w-full bg-marine-950 border border-marine-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs rounded-xl shadow-glow-cyan"
            >
              Send Reset Instructions
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-marine-800">
          <Link to="/login" className="text-xs text-cyan-400 hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
