import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck, Eye, EyeOff, X } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExistsWarning, setEmailExistsWarning] = useState('');
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Auto-hide popup after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Real-time FAST email check (Debounced)
  useEffect(() => {
    if (isLogin || !email || email.length < 5 || !email.includes('@')) {
      setEmailExistsWarning('');
      return;
    }

    const checkEmail = async () => {
      try {
        setIsCheckingEmail(true);
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${baseUrl}/auth/check-email?email=${email}`);
        const data = await res.json();
        if (data.exists) {
          setEmailExistsWarning('This corporate email is already registered.');
          setError('An account with this corporate email already exists. Please log in.');
        } else {
          setEmailExistsWarning('');
          if (error.includes('already exists')) setError(''); // Clear only email errors
        }
      } catch (err) {
        console.error('Fast check failed');
      } finally {
        setIsCheckingEmail(false);
      }
    };

    const timeoutId = setTimeout(checkEmail, 500); // 500ms debounce
    return () => clearTimeout(timeoutId);
  }, [email, isLogin]);

  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length > 7) score++;
    if (pass.match(/[A-Z]/)) score++;
    if (pass.match(/[0-9]/)) score++;
    if (pass.match(/[^A-Za-z0-9]/)) score++;
    return score;
  };

  const strength = calculateStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isLogin && password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (!isLogin && strength < 2) {
      return setError("Password is too weak. Add numbers or symbols.");
    }

    try {
      if (isLogin) {
        const userData = await login(email, password);
        // Admin auto-redirect logic
        if (userData?.role === 'ADMIN' || email === 'admin@company.com') {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        await register(name, email, password);
        setSuccess('Account created successfully! Please sign in.');
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Minimalist Topbar */}
      <header className="py-6 px-8 border-b border-gray-100 flex justify-between items-center bg-white">
        <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-gray-900">
          <div className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          Enterprise Manager
        </div>
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-900 text-sm font-medium flex items-center gap-2">
          <ArrowLeft size={16} /> Return to Site
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              {isLogin ? 'Sign in to your account' : 'Create an account'}
            </h2>
            <p className="text-gray-500 text-sm">
              {isLogin ? 'Enter your corporate email and password.' : 'Join the enterprise workspace today.'}
            </p>
          </div>

          {/* Premium Floating Popup (Toast) for Errors & Success */}
          <AnimatePresence>
            {(error || success) && (
              <motion.div 
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-xl shadow-2xl border flex items-start gap-4 w-[90%] max-w-sm ${error ? 'bg-white shadow-red-500/20 border-red-100' : 'bg-white shadow-green-500/20 border-green-100'}`}
              >
                {error ? (
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <AlertCircle size={22} className="text-red-500" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={22} className="text-green-500" />
                  </div>
                )}
                
                <div className="flex-1 pt-1">
                  <h4 className={`font-black text-sm tracking-wide ${error ? 'text-red-800' : 'text-green-800'}`}>
                    {error ? 'Action Failed' : 'Success'}
                  </h4>
                  <p className="font-semibold text-sm text-gray-600 mt-1 leading-relaxed">{error || success}</p>
                </div>
                
                <button onClick={() => { setError(''); setSuccess(''); }} className="text-gray-400 hover:text-gray-800 transition-colors p-1">
                  <X size={18} strokeWidth={2.5} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-gray-900"
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="John Doe"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5 flex justify-between">
                Corporate Email
                {isCheckingEmail && !isLogin && <span className="text-xs text-blue-500 animate-pulse">Checking...</span>}
              </label>
              <input 
                type="email" 
                required 
                className={`w-full px-4 py-3 bg-white border ${emailExistsWarning && !isLogin ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-900 focus:border-gray-900'} rounded focus:ring-2 outline-none transition-all text-gray-900`}
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="name@company.com"
              />
              {emailExistsWarning && !isLogin && (
                <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> {emailExistsWarning}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-gray-900 pr-10"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!isLogin && password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1 h-1.5">
                    <div className={`flex-1 rounded-full ${strength >= 1 ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 rounded-full ${strength >= 2 ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 rounded-full ${strength >= 3 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 rounded-full ${strength >= 4 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 w-12 text-right">
                    {strength < 2 ? 'Weak' : strength < 4 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    required 
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-gray-900 pr-10"
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3.5 rounded transition-colors mt-2 flex justify-center items-center gap-2">
              <ShieldCheck size={18} />
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} 
              className="font-semibold text-gray-900 hover:underline"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>

        </motion.div>
      </div>
    </div>
  );
};

export default Login;
