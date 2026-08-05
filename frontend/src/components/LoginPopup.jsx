import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Input from './Input';
import Button from './ui/Button';
import Icon from './ui/Icon';

export default function LoginPopup() {
  const { isLoginOpen, closeLogin, login, forgotPassword } = useAuth();
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const resetForm = () => {
    setEmail('');
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
      await login(email, password);
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
      const res = await forgotPassword(email);
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

  return (
    <AnimatePresence>
      {isLoginOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-obsidian/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="fixed top-1/2 left-1/2 z-[70] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[2.5rem] bg-obsidian-card p-7 md:p-9 shadow-float border border-line glass-card"
            initial={{ opacity: 0, scale: 0.95, y: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-50%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold font-display text-ink">Welcome back</h2>
                <p className="text-sm text-mist mt-1 font-normal">
                  Sign in to continue your editing workflow.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-500/10 hover:bg-slate-500/20 transition-colors text-ink border border-line"
                aria-label="Close"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>

            {message.text && (
              <div
                className={`mb-5 rounded-2xl px-4 py-3 text-sm font-semibold ${
                  message.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {message.text}
              </div>
            )}

            {view === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <div className="flex items-center justify-between text-sm pt-1">
                  <label className="flex items-center gap-2 text-mist cursor-pointer text-xs font-bold">
                    <input type="checkbox" className="rounded border-line bg-obsidian-card text-cyan-400 focus:ring-cyan-400/20" />
                    Keep me signed in
                  </label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setMessage({ type: '', text: '' }); }}
                    className="text-cyan-400 hover:text-cyan-300 hover:underline font-bold text-xs"
                  >
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" disabled={loading} variant="primary" className="w-full mt-2">
                  {loading ? 'Signing In…' : 'Login'}
                </Button>
              </form>
            ) : (
              <div>
                <h3 className="font-bold text-ink text-lg mb-1 font-display">Forgot your password?</h3>
                <p className="text-sm text-mist mb-5 font-normal">
                  Enter your email and we'll send you a reset link.
                </p>
                <form onSubmit={handleForgot} className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                  <Button type="submit" disabled={loading} variant="primary" className="w-full mt-2">
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </Button>
                </form>
                <button
                  type="button"
                  onClick={() => { setView('login'); setMessage({ type: '', text: '' }); }}
                  className="mt-5 text-xs text-mist hover:text-ink flex items-center gap-1.5 transition-colors font-bold"
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
