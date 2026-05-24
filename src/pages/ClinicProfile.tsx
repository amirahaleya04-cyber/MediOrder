import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  User, 
  FileText, 
  Users, 
  TrendingUp,
  CreditCard,
  Edit3,
  Plus,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

export default function ClinicProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Profile fields matching requirements
  const [clinicName, setClinicName] = useState('City Clinic KL');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Doctor');
  const [email, setEmail] = useState('');
  const [clinicAddress, setClinicAddress] = useState('12-G, Block B, Centrio Pantai Hillpark, Jalan Pantai Murni, 59200 Kuala Lumpur');
  const [clinicPhone, setClinicPhone] = useState('+60 3-1234 5678');
  const [registrationNo, setRegistrationNo] = useState('KKM/2024/08812');

  // Computed stats from real Supabase records
  const [supplierCount, setSupplierCount] = useState(0);
  const [poThisMonth, setPoThisMonth] = useState(0);
  const [spendingThisMonth, setSpendingThisMonth] = useState(0);

  const fetchProfileAndStats = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        // 1. Fetch user profile
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileErr) {
          console.error('Error fetching profile:', profileErr.message);
          toast.error(`Failed to load profile: ${profileErr.message}`);
        } else if (profile) {
          setClinicName(profile.clinic_name || 'City Clinic KL');
          setFullName(profile.full_name || '');
          setRole(profile.role || 'Doctor');
          setEmail(profile.email || user.email || '');
          setClinicAddress(profile.clinic_address || '12-G, Block B, Centrio Pantai Hillpark, Jalan Pantai Murni, 59200 Kuala Lumpur');
          setClinicPhone(profile.clinic_phone || '+60 3-1234 5678');
          setRegistrationNo(profile.registration_no || 'KKM/2024/08812');
        } else {
          // If no profile row exists, check user metadata or state
          setClinicName(user.user_metadata?.clinic_name || 'City Clinic KL');
          setFullName(user.user_metadata?.full_name || '');
          setRole(user.user_metadata?.role || 'Doctor');
          setEmail(user.email || '');
        }

        const activeClinic = profile?.clinic_name || user.user_metadata?.clinic_name || 'City Clinic KL';

        // 2. Fetch suppliers count
        const { data: sups, error: supsErr } = await supabase
          .from('suppliers')
          .select('id')
          .eq('clinic_name', activeClinic);
        
        if (!supsErr && sups) {
          setSupplierCount(sups.length);
        }

        // 3. Fetch purchase orders to compute stats
        const { data: pos, error: posErr } = await supabase
          .from('purchase_orders')
          .select('*')
          .eq('clinic_name', activeClinic);

        if (!posErr && pos) {
          const now = new Date();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth();

          const curMonthPOs = pos.filter((order: any) => {
            const dateStr = order.order_date || order.created_at;
            if (!dateStr) return false;
            const d = new Date(dateStr);
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
          });

          setPoThisMonth(curMonthPOs.length);

          const sumSpending = curMonthPOs.reduce((sum: number, o: any) => {
            const totalVal = o.grand_total !== undefined ? Number(o.grand_total) : 0;
            return sum + totalVal;
          }, 0);
          setSpendingThisMonth(sumSpending);
        }
      } else {
        // Fallback states from localStorage if no database
        setEmail(user.email || 'contact@cityclinickl.com.my');
        setFullName(user.user_metadata?.full_name || 'Dr. Aisha');
        setClinicName(user.user_metadata?.clinic_name || 'City Clinic KL');
      }
    } catch (err: any) {
      console.error('Cascade error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndStats();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const updateRow = {
          clinic_name: clinicName.trim(),
          full_name: fullName.trim(),
          role: role,
          email: email.trim(),
          clinic_address: clinicAddress.trim(),
          clinic_phone: clinicPhone.trim(),
          registration_no: registrationNo.trim(),
          updated_at: new Date().toISOString()
        };

        const { error: updateErr } = await supabase
          .from('profiles')
          .update(updateRow)
          .eq('id', user.id);

        if (updateErr) {
          throw updateErr;
        }

        toast.success('Clinic profile details updated in database!');
        setIsEditing(false);
        fetchProfileAndStats();
      } else {
        toast.info('Local simulation: Clinic details updated successfully.');
        setIsEditing(false);
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      toast.error(`Failed to save: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-medical-600" size={36} />
        <p className="text-sm font-medium text-slate-500">Retrieving clinic credentials...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-medical-600 relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-3xl shadow-lg border border-slate-100">
            <div className="w-24 h-24 rounded-[1.25rem] bg-medical-50 flex items-center justify-center text-medical-600 text-4xl font-bold font-sans">
              {clinicName?.charAt(0).toUpperCase() || 'C'}
            </div>
          </div>
        </div>
        <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">{clinicName}</h1>
            <p className="text-slate-500 font-medium">Reg No: {registrationNo || 'N/A'}</p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                <Edit3 size={18} />
                Edit Clinic Details
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfileAndStats();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-all"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-medical-600 text-white rounded-xl text-sm font-bold hover:bg-medical-700 transition-all shadow-lg shadow-medical-600/20 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                  Save Changes
                </button>
              </div>
            )}
            <button 
              onClick={() => navigate('/staff')}
              className="flex items-center gap-2 px-6 py-2.5 bg-medical-600 text-white rounded-xl text-sm font-bold hover:bg-medical-700 transition-all shadow-lg shadow-medical-600/20"
            >
              <Plus size={18} />
              Add Staff
            </button>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 size={24} className="text-medical-600" />
              General Information
            </h2>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Clinic Name</label>
                    <input 
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Registration No</label>
                    <input 
                      type="text"
                      value={registrationNo}
                      onChange={(e) => setRegistrationNo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Clinic Phone</label>
                    <input 
                      type="text"
                      value={clinicPhone}
                      onChange={(e) => setClinicPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Clinic Email</label>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Address</label>
                    <textarea 
                      rows={3}
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Primary PIC Name</label>
                    <input 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Role / Designation</label>
                    <input 
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20"
                    />
                  </div>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-slate-400 mt-1" size={18} />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{clinicAddress || 'No Address Set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-slate-400" size={18} />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                      <p className="text-sm text-slate-700">{clinicPhone || 'No Phone Set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-slate-400" size={18} />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                      <p className="text-sm text-slate-700">{email || 'No Email Set'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="text-slate-400 mt-1" size={18} />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operating Hours</p>
                      <p className="text-sm text-slate-700 leading-relaxed">Mon - Fri: 9:00 AM - 10:00 PM, Sat - Sun: 10:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="text-slate-400" size={18} />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary PIC</p>
                      <p className="text-sm text-slate-700">{fullName || 'No PIC Set'} ({role || 'Staff'})</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                 <FileText size={24} />
               </div>
               <div>
                  <h3 className="font-bold text-slate-900">Purchase Order History</h3>
                  <p className="text-sm text-slate-500">View all previous transactions and receipts</p>
               </div>
             </div>
             <Link to="/orders" className="px-6 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all border border-slate-200">
               View All Orders
             </Link>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mt-8">
            <div className="p-8 border-b border-slate-100 flex items-center gap-3">
               <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <FileText size={20} />
               </div>
               <div>
                  <h2 className="font-bold text-slate-900">Financial & Tax Settings</h2>
                  <p className="text-xs text-slate-500 font-medium">Malaysia SST & Accounting integration</p>
               </div>
            </div>
            <div className="p-8 space-y-6">
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                     <p className="text-sm font-bold text-slate-900">SST Registration</p>
                     <p className="text-xs text-slate-500">Enable SST (Sales and Service Tax) calculation for all POs</p>
                  </div>
                  <div className="w-12 h-6 bg-medical-600 rounded-full relative cursor-pointer shadow-inner">
                     <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm" />
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">SST Number</label>
                    <input type="text" placeholder="W10-1808-32000000" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20" defaultValue="W10-1808-32000000" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Default Tax Rate</label>
                    <select className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20" defaultValue="6% (Standard Rate)">
                      <option>6% (Standard Rate)</option>
                      <option>0% (Zero Rated)</option>
                      <option>Exempted</option>
                    </select>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <StatCard 
            title="Total Suppliers" 
            value={supplierCount} 
            icon={Users} 
            color="bg-blue-500" 
          />
          <StatCard 
            title="POs This Month" 
            value={poThisMonth} 
            icon={TrendingUp} 
            color="bg-amber-500" 
          />
          <StatCard 
            title="Monthly Spending" 
            value={`RM ${spendingThisMonth.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
            icon={CreditCard} 
            color="bg-medical-600" 
          />
        </div>
      </div>
    </div>
  );
}
