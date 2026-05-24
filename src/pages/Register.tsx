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
  Stethoscope,
  User,
  FileCheck
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [role, setRole] = useState('Doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName || !fullName || !role || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      toast.error('You must accept the terms of service to onboard.');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password, clinicName, fullName, role);
      // If we are in real Supabase mode, it might request email verification or successfully log in.
      // If mock mode, it will logs in directly & updates states. 
      // navigate('/dashboard') is handled either here or by the App shell's Route protection, 
      // but to be absolutely sure and direct:
      navigate('/dashboard');
    } catch (err) {
      // toast.error is handled inside useAuth
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header navbar */}
      <header className="px-6 py-5 max-w-7xl mx-auto w-full flex justify-between items-center bg-transparent">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-medical-600 flex items-center justify-center text-white font-bold transition-transform group-hover:scale-105">
            M
          </div>
          <span className="text-xl font-display font-bold text-slate-900">MediOrder</span>
        </Link>
        <Link 
          to="/login" 
          className="text-xs font-bold text-slate-500 hover:text-medical-600 transition-colors uppercase tracking-wider"
        >
          Sign In Instead
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
          {/* Left Decorative/Info Sidepanel */}
          <div className="lg:col-span-5 bg-medical-600 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden hidden lg:flex">
            {/* Background decoration circles */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-medical-500 rounded-full blur-[100px] opacity-40 pointer-events-none" />
            <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-medical-700 rounded-full blur-[120px] opacity-30 pointer-events-none" />

            {/* Top Brand/Badging */}
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest mb-6">
                Direct Distributor Access
              </span>
              <h2 className="text-3xl font-display font-bold leading-tight">
                Secure clinical supplies with wholesale prices.
              </h2>
              <p className="text-medical-50/80 text-sm mt-3 leading-relaxed">
                Connect and shop seamlessly with Sabah Pharma, MedCare Supplies, Borneo Medical, and other top Malaysian healthcare distributors.
              </p>
            </div>

            {/* Bullet Highlights */}
            <div className="space-y-4 relative z-10 py-8">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-white/10 rounded-lg mt-0.5">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">KKM License Validation</p>
                  <p className="text-xs text-medical-50/70">Secure and regulatory verified accounts maintain patient-safety standards.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-1 bg-white/10 rounded-lg mt-0.5">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">Consolidated Billing & POs</p>
                  <p className="text-xs text-medical-50/70">Single source of truth for clinics, GP branches or surgery groups.</p>
                </div>
              </div>
            </div>

            {/* Bottom Credits */}
            <div className="relative z-10 text-xs text-medical-100/65 flex items-center gap-1.5 font-mono">
              <Building2 size={12} /> Secure Portal
            </div>
          </div>

          {/* Right Signup Form panel */}
          <div className="lg:col-span-7 p-8 lg:p-14 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-8">
              {/* Form Heading Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 lg:hidden mb-4">
                  <div className="w-6 h-6 rounded bg-medical-600 flex items-center justify-center text-white font-bold text-xs">
                    M
                  </div>
                  <span className="text-sm font-bold text-slate-800">MediOrder</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display">
                  Create Clinical Account
                </h1>
                <p className="text-sm font-medium text-slate-500">
                  Register your medical clinic and begin streamlining procurement.
                </p>
              </div>

              {/* Form submit */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Clinic Name and Full Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="clinicName" className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Clinic Name
                    </label>
                    <div className="relative">
                      <input
                        id="clinicName"
                        type="text"
                        required
                        placeholder="City Family Clinic KL"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-medical-600/10 focus:border-medical-600 transition-all font-sans"
                      />
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="fullName" className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        id="fullName"
                        type="text"
                        required
                        placeholder="Dr. Aisha Khan"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-medical-600/10 focus:border-medical-600 transition-all font-sans"
                      />
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                  </div>
                </div>

                {/* Role Dropdown and Work Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="role" className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Role
                    </label>
                    <div className="relative">
                      <select
                        id="role"
                        required
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-10 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-medical-600/10 focus:border-medical-600 transition-all font-sans appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat cursor-pointer"
                      >
                        <option value="Doctor">Doctor</option>
                        <option value="Clinic Assistant">Clinic Assistant</option>
                        <option value="Procurement Officer">Procurement Officer</option>
                        <option value="Admin">Admin</option>
                      </select>
                      <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Work Email
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="dr.aisha@cityclinic.com.my"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-medical-600/10 focus:border-medical-600 transition-all font-sans"
                      />
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                  </div>
                </div>

                {/* Password and Confirm Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type="password"
                        required
                        placeholder="Min 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-medical-600/10 focus:border-medical-600 transition-all font-sans"
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type="password"
                        required
                        placeholder="Retype password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-medical-600/10 focus:border-medical-600 transition-all font-sans"
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                  </div>
                </div>

                {/* Terms Acceptance checkbox */}
                <div className="flex items-center pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-medical-600 focus:ring-medical-600/30 cursor-pointer mt-0.5"
                    />
                    <span className="text-xs text-slate-500 leading-normal">
                      I agree to the regulatory compliance terms and 
                      <a href="#" className="text-medical-600 font-bold hover:underline ml-1">Distributor Terms</a>.
                    </span>
                  </label>
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-medical-600 text-white rounded-xl py-4 font-bold text-sm tracking-wide shadow-lg shadow-medical-600/20 hover:bg-medical-700 transition-all duration-300 transform active:scale-[0.99] flex items-center justify-center gap-2 mt-4 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Redirection to Sign In */}
              <div className="pt-6 border-t border-slate-100 flex justify-center text-xs text-slate-500 font-medium font-sans">
                <span>Already have a verified account?</span>
                <Link 
                  to="/login" 
                  className="text-medical-600 font-bold hover:text-medical-700 hover:underline ml-1.5 transition-colors"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer credits */}
      <footer className="py-6 text-center text-xs text-slate-400 font-sans border-t border-slate-100">
        © 2026 MediOrder Malaysia. Licensed medical procurement framework.
      </footer>
    </div>
  );
}
