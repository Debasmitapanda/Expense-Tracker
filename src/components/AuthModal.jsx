import React, { useState } from 'react';
import { Wallet, User, Lock, Eye, EyeOff, LogIn, UserPlus, AlertCircle, Sparkles } from 'lucide-react';
import { loginApi, registerApi } from '../services/api';

export default function AuthModal({ isOpen, onAuthSuccess }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLoginTab) {
        if (!username || !password) {
          setErrorMsg('Please fill in both Username and Password.');
          setLoading(false);
          return;
        }
        const res = await loginApi(username, password);
        if (res.success) {
          onAuthSuccess(res.user);
        } else {
          setErrorMsg(res.error || 'Login failed. Check your username and password.');
        }
      } else {
        if (!username || !name || !password) {
          setErrorMsg('Please fill in all required fields.');
          setLoading(false);
          return;
        }
        if (password.length < 4) {
          setErrorMsg('Password must be at least 4 characters long.');
          setLoading(false);
          return;
        }
        const res = await registerApi(username, name, password);
        if (res.success) {
          onAuthSuccess(res.user);
        } else {
          setErrorMsg(res.error || 'Registration failed.');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-emerald-100 flex flex-col">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 sm:p-7 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
          
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-lg shadow-emerald-950/20">
            <Wallet className="w-7 h-7 text-white" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Daily Expense Billing Tracker
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">
            {isLoginTab ? 'Sign in to access your saved expenses' : 'Create an account for cloud backup'}
          </p>
        </div>

        {/* Tab Selector Switch */}
        <div className="flex bg-slate-100 p-1.5 mx-6 mt-5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              isLoginTab
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              !isLoginTab
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          
          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold rounded-2xl flex items-start space-x-2 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Full Name Input (Register Tab Only) */}
          {!isLoginTab && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="w-5 h-5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Debasmita Panda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 text-sm sm:text-base font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  required={!isLoginTab}
                />
              </div>
            </div>
          )}

          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
              Username
            </label>
            <div className="relative flex items-center">
              <User className="w-5 h-5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Choose username (e.g. debasmita)"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                className="w-full pl-10 pr-3 py-3 text-sm sm:text-base font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 text-sm sm:text-base font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-md shadow-emerald-600/30 hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <span>Please wait...</span>
            ) : isLoginTab ? (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign In to Tracker</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Create Account & Save Data</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium">
            🔒 All your expense logs are encrypted and saved securely in MongoDB.
          </p>
        </div>
      </div>
    </div>
  );
}
