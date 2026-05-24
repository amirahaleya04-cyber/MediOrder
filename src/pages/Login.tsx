import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Mail, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Quick fill sample credentials
  const fillSampleCredentials = () => {
    setEmail('dr.aisha@cityclinic.com.my');
    setPassword('password123');
    toast.info('Sample credentials loaded! Click Sign in to proceed.', {
      duration: 3000
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      // toast.error is handled inside useAuth
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address to reset password.');
      return;
    }
    toast.success('Password reset link sent!', {
      description: `A secured recovery email has been dispatched to ${email}`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header navbar for standalone brand feel */}
      <header className="px-6 py-5 max-w-7xl mx-auto w-full flex justify-between items-center bg-transparent">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-medical-600 flex items-center justify-center text-white font-bold transition-transform group-hover:scale-105">
            M
          </div>
          <span className="text-xl font-display font-bold text-slate-900">MediOrder</span>
        </Link>
        <Link 
          to="/" 
          className="text-xs font-bold text-slate-500 hover:text-medical-600 transition-colors uppercase tracking-wider"
        >
          Back to home
        </Link>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 py-8 lg:py-16">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-xl shadow-slate-100/50 w-full max-w-5xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]"
        >
          {/* Left Decorative/Info Sidepanel (Visible on Desktop) */}
          <div className="lg:col-span-5 bg-medical-600 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden hidden lg:flex">
            {/* Background decoration circles */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-medical-500 rounded-full blur-[100px] opacity-40 pointer-events-none" />
            <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-medical-700 rounded-full blur-[120px] opacity-30 pointer-events-none" />

            {/* Top Brand/Badging */}
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest mb-6">
                Clinical Logistics Hub
              </span>
              <h2 className="text-3xl font-display font-bold leading-tight">
                Empowering clinics with resilient procurement.
              </h2>
              <p className="text-medical-50/80 text-sm mt-3 leading-relaxed">
                MediOrder streamlines pharmaceutical purchases, stock monitoring, and regulatory compliance for medical practitioners across Malaysia.
              </p>
            </div>

            {/* Bullet Highlights */}
            <div className="space-y-4 relative z-10 py-8">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-white/10 rounded-lg mt-0.5">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">SST & KKM Compliant</p>
                  <p className="text-xs text-medical-50/70">Automatic validation against local healthcare codes.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-1 bg-white/10 rounded-lg mt-0.5">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">Full Supplier Transparency</p>
                  <p className="text-xs text-medical-50/70">Direct, real-time inventory levels from top distributors.</p>
                </div>
              </div>
            </div>

            {/* Bottom Credits */}
            <div className="relative z-10 text-xs text-medical-100/65 flex items-center gap-1.5 font-mono">
              <Building2 size={12} /> MediOrder Malaysia
            </div>
          </div>

          {/* Right Login Form panel */}
          <div className="lg:col-span-7 p-8 lg:p-14 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-8">
              {/* Form Heading Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 lg:hidden mb-4">
                  <div className="w-6 h-6 rounded bg-medical-600 flex items-center justify-center text-white font-bold text-xs">
                    M
                  </div>
                  <span className="text-sm font-bold text-slate-800">MediOrder Logistics</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display">
                  Welcome back to MediOrder
                </h1>
                <p className="text-sm font-medium text-slate-500">
                  Access your clinical logistics platform and purchase orders.
                </p>
              </div>

              {/* Form submit */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email address field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="dr.aisha@cityclinic.com.my"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-medical-600/10 focus:border-medical-600 transition-all font-sans"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Password
                    </label>
                    <a
                      href="#"
                      onClick={handleForgotPassword}
                      className="text-xs font-bold text-medical-600 hover:text-medical-700 hover:underline transition-colors capitalize"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-11 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-medical-600/10 focus:border-medical-600 transition-all font-sans"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Box */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-medical-600 focus:ring-medical-600/30 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 font-medium">Remember my clinic node</span>
                  </label>
                  
                  {/* Demo Credential Quick-Fill */}
                  <span 
                    onClick={fillSampleCredentials}
                    className="text-xs text-slate-400 hover:text-medical-600 hover:underline font-bold uppercase tracking-tighter cursor-pointer"
                  >
                    Quick-Fill Demo
                  </span>
                </div>

                {/* Log In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-medical-600 text-white rounded-xl py-4 font-bold text-sm tracking-wide shadow-lg shadow-medical-600/20 hover:bg-medical-700 transition-all duration-300 transform active:scale-[0.99] flex items-center justify-center gap-2 col-span-2 mt-4 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      Sign In To Account
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Redirection to Create Account */}
              <div className="pt-6 border-t border-slate-100 flex justify-center text-xs text-slate-500 font-medium font-sans">
                <span>New to MediOrder?</span>
                <Link 
                  to="/register" 
                  className="text-medical-600 font-bold hover:text-medical-700 hover:underline ml-1.5 transition-colors"
                >
                  Create an Account
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer credits */}
      <footer className="py-6 text-center text-xs text-slate-400 font-sans border-t border-slate-100">
        © 2026 MediOrder Malaysia. Secured clinical supply chain network.
      </footer>
    </div>
  );
}
