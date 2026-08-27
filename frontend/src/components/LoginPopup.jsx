import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Input from './Input';
import Button from './ui/Button';
import Icon from './ui/Icon';

export default function LoginPopup() {
  const { isLoginOpen, closeLogin, login, forgotPassword } = useAuth();
  const [view, setView] = useState('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
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
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Login failed. Please try again.',
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

  return (
    <AnimatePresence>
      {isLoginOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="fixed top-1/2 left-1/2 z-[70] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-7 md:p-8 shadow-2xl border border-slate-200"
            initial={{ opacity: 0, scale: 0.95, y: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-50%' }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold font-display text-slate-900">ASZEN Login</h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Enter your name to sign in (e.g. <span className="font-semibold text-indigo-600">lessy</span>)
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
                aria-label="Close"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>

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

            {view === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Input
                    label="Username / Name"
                    type="text"
                    name="username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. lessy, shwetha, karan"
                    required
                  />
                  {formattedPreview && (
                    <div className="mt-1.5 text-[11px] text-indigo-600 font-mono flex items-center gap-1 font-semibold">
                      <span>➜</span> Authentic Email: <span className="underline">{formattedPreview}</span>
                    </div>
                  )}
                </div>

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-500 cursor-pointer font-medium">
                    <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20" />
                    Keep me signed in
                  </label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setMessage({ type: '', text: '' }); }}
                    className="text-indigo-600 hover:underline font-bold text-xs"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" disabled={loading} variant="primary" className="w-full mt-2 py-2.5">
                  {loading ? 'Signing In…' : 'Sign In'}
                </Button>
              </form>
            ) : (
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1 font-display">Forgot password?</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Enter your name or email to receive a password reset link.
                </p>
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <Input
                      label="Username / Name"
                      type="text"
                      name="username"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="e.g. lessy, shwetha"
                      required
                    />
                    {formattedPreview && (
                      <div className="mt-1.5 text-[11px] text-indigo-600 font-mono">
                        Reset link will send to: <span className="font-semibold">{formattedPreview}</span>
                      </div>
                    )}
                  </div>
                  <Button type="submit" disabled={loading} variant="primary" className="w-full mt-2 py-2.5">
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </Button>
                </form>
                <button
                  type="button"
                  onClick={() => { setView('login'); setMessage({ type: '', text: '' }); }}
                  className="mt-4 text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors font-bold"
                >
                  <Icon name="arrowRight" className="w-3.5 h-3.5 rotate-180" />
                  Back to login
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
