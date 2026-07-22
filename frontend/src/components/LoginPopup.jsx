import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Input from './Input';
import Button from './Button';
import './components.css';

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
            className="login-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
         <motion.div
            className="login-popup"
            initial={{ opacity: 0, y: "-45%", scale: 0.95 }}
            animate={{ opacity: 1, y: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: "-45%", scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
        <div className="login-popup__header">
          <div>
            <h2 className="login-popup__title">Welcome back</h2>
            <p className="login-popup__subtitle">
              Sign in to continue your editing workflow.
            </p>
          </div>
          <button type="button" className="login-popup__close" onClick={handleClose}>
            ×
          </button>
        </div>

        {message.text && (
          <div className={`login-popup__message login-popup__message--${message.type}`}>
            {message.text}
          </div>
        )}

        {view === 'login' ? (
          <form className="login-popup__form" onSubmit={handleLogin}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <div className="login-options">
              <label>
                <input type="checkbox" /> Keep me signed in
              </label>
              <button type="button" onClick={() => setView('forgot')}>
                Forgot password?
              </button>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Login'}
            </Button>
          </form>
        ) : (
          <div className="login-popup__forgot-view">
            <h3>Forgot your password?</h3>
            <p>Enter your email and we will send you a reset link.</p>
            <form className="login-popup__form" onSubmit={handleForgot}>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
            <button
              type="button"
              className="login-popup__back"
              onClick={() => {
                setView('login');
                setMessage({ type: '', text: '' });
              }}
            >
              ← Back to login
            </button>
          </div>
        )}
      </motion.div>
    </>
  )}
</AnimatePresence>
  );
}
