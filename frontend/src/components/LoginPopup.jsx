import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiEyeOff, FiUserPlus, FiLogIn, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Input from './Input';
import Button from './ui/Button';
import Icon from './ui/Icon';

export default function LoginPopup() {
  const navigate = useNavigate();
  const { isLoginOpen, closeLogin, login, registerEmployee, forgotPassword } = useAuth();
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot'
  
  // Login State
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDesignation, setRegDesignation] = useState('Editor');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const getFormattedEmail = (input) => {
    const trimmed = (input || '').trim();
    if (!trimmed) return '';
    if (trimmed.includes('@')) return trimmed;
    const clean = trimmed.replace(/\.$/, '');
    return `${clean}.aszen@gmail.com`;
  };

  const resetForm = () => {
    setUsernameInput('');
    setPassword('');
    setRegName('');
    setRegEmail('');
    setRegDesignation('Editor');
    setRegPassword('');
    setRegConfirmPass('');
    setShowPassword(false);
    setShowRegPassword(false);
    setMessage({ type: '', text: '' });
    setView('login');
  };

  const handleClose = () => {
    closeLogin();
    resetForm();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await login(usernameInput, password);
      resetForm();
      navigate('/dashboard');
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Login failed. Please check your credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }
    if (regPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (regPassword !== regConfirmPass) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await registerEmployee({
        name: regName.trim(),
        email: regEmail.trim(),
        designation: regDesignation,
        password: regPassword,
      });
      setMessage({
        type: 'success',
        text: `Account created for ${regName.trim()}! You can now sign in below. Admin can release dashboard feature permissions.`,
      });
      setUsernameInput(regEmail.trim());
      setView('login');
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Registration failed.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await forgotPassword(usernameInput);
      setMessage({ type: 'success', text: res.message });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Could not send reset link.',
      });
    } finally {
      setLoading(false);
    }
  };

  const formattedPreview = getFormattedEmail(usernameInput);
  const formattedRegPreview = getFormattedEmail(regEmail);

  return (
    <AnimatePresence>
      {isLoginOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-md my-auto rounded-3xl bg-white p-7 md:p-8 shadow-2xl border border-slate-200"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header with Close */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold font-display text-slate-900">
                  {view === 'register' ? 'Employee Registration' : view === 'forgot' ? 'Reset Password' : 'Staff Sign In'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {view === 'register'
                    ? 'Register once to join the production system'
                    : view === 'forgot'
                    ? 'Enter your email to receive recovery instructions'
                    : 'Enter your credentials to access the production workspace'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 cursor-pointer"
                aria-label="Close"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs between Sign In and Register */}
            {view !== 'forgot' && (
              <div className="flex rounded-xl bg-slate-100 p-1 mb-5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setView('login'); setMessage({ type: '', text: '' }); }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    view === 'login'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <FiLogIn className="w-3.5 h-3.5" /> Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setView('register'); setMessage({ type: '', text: '' }); }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    view === 'register'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <FiUserPlus className="w-3.5 h-3.5" /> Register as Employee
                </button>
              </div>
            )}

            {/* Notification Banner */}
            {message.text && (
              <div
                className={`mb-4 rounded-xl px-4 py-2.5 text-xs font-semibold ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* View: Login Form */}
            {view === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Email or Username"
                  type="text"
                  name="username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. arun or lessy.aszen@gmail.com"
                  required
                />
                {usernameInput && !usernameInput.includes('@') && (
                  <p className="text-[11px] text-indigo-600 font-medium mt-1">
                    Signing in as: <span className="font-semibold">{formattedPreview}</span>
                  </p>
                )}

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-500 cursor-pointer font-medium">
                    <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20" />
                    Keep me signed in
                  </label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setMessage({ type: '', text: '' }); }}
                    className="text-indigo-600 hover:underline font-bold text-xs cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" disabled={loading} variant="primary" className="w-full mt-2 py-2.5">
                  {loading ? 'Signing In…' : 'Sign In'}
                </Button>
              </form>
            )}

            {/* View: Register as Employee Form */}
            {view === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                <Input
                  label="Full Name"
                  type="text"
                  name="name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Lessy, Shwetha"
                  required
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role Designation</label>
                  <select
                    value={regDesignation}
                    onChange={(e) => setRegDesignation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Editor">Editor</option>
                    <option value="Senior Editor">Senior Editor</option>
                    <option value="Pather">Pather</option>
                    <option value="QC Lead">QC Lead</option>
                    <option value="Project Manager">Project Manager</option>
                  </select>
                </div>

                <div>
                  <Input
                    label="Email Address or Username"
                    type="text"
                    name="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. lessy or lessy@aszen.com"
                    required
                  />
                  {regEmail && !regEmail.includes('@') && (
                    <p className="text-[11px] text-indigo-600 font-medium mt-1">
                      Account email: <span className="font-semibold">{formattedRegPreview}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showRegPassword ? 'text' : 'password'}
                      name="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3.5 top-[36px] text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                    >
                      {showRegPassword ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div>
                    <Input
                      label="Confirm Password"
                      type={showRegPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={regConfirmPass}
                      onChange={(e) => setRegConfirmPass(e.target.value)}
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  After registering once, your account is saved permanently. The administrator can grant permissions to release features.
                </p>

                <Button type="submit" disabled={loading} variant="primary" className="w-full mt-2 py-2.5">
                  {loading ? 'Creating Account…' : 'Register Employee Account'}
                </Button>
              </form>
            )}

            {/* View: Forgot Password */}
            {view === 'forgot' && (
              <div>
                <form onSubmit={handleForgot} className="space-y-4">
                  <Input
                    label="Email or Username"
                    type="text"
                    name="username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Enter your email or username"
                    required
                  />
                  <Button type="submit" disabled={loading} variant="primary" className="w-full mt-2 py-2.5">
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </Button>
                </form>
                <button
                  type="button"
                  onClick={() => { setView('login'); setMessage({ type: '', text: '' }); }}
                  className="mt-4 text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors font-bold cursor-pointer"
                >
                  <Icon name="arrowRight" className="w-3.5 h-3.5 rotate-180" />
                  Back to sign in
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
