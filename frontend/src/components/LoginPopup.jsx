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
            className="fixed inset-0 z-[60] bg-ink/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="fixed top-1/2 left-1/2 z-[70] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 md:p-8 shadow-float border border-line"
            initial={{ opacity: 0, scale: 0.95, y: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-50%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold font-display text-ink">Welcome back</h2>
                <p className="text-sm text-mist mt-1">
                  Sign in to continue your editing workflow.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-cloud transition-colors text-mist"
                aria-label="Close"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>

            {message.text && (
              <div
                className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
                  message.type === 'success'
                    ? 'bg-emerald-soft text-emerald border border-emerald/20'
                    : 'bg-red-50 text-red-600 border border-red-200'
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
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-mist cursor-pointer">
                    <input type="checkbox" className="rounded border-line text-royal focus:ring-royal/20" />
                    Keep me signed in
                  </label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setMessage({ type: '', text: '' }); }}
                    className="text-royal hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Signing In…' : 'Login'}
                </Button>
              </form>
            ) : (
              <div>
                <h3 className="font-semibold text-ink mb-1">Forgot your password?</h3>
                <p className="text-sm text-mist mb-5">
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
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </Button>
                </form>
                <button
                  type="button"
                  onClick={() => { setView('login'); setMessage({ type: '', text: '' }); }}
                  className="mt-4 text-sm text-mist hover:text-ink flex items-center gap-1 transition-colors"
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
