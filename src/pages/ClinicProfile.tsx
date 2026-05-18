import React from 'react';
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
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

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
  const clinic = {
    name: 'City Clinic Kuala Lumpur',
    regNumber: 'KKM/2024/08812',
    address: '12-G, Block B, Centrio Pantai Hillpark, Jalan Pantai Murni, 59200 Kuala Lumpur',
    phone: '+60 3-1234 5678',
    email: 'contact@cityclinickl.com.my',
    operatingHours: 'Mon - Fri: 9:00 AM - 10:00 PM, Sat - Sun: 10:00 AM - 4:00 PM',
    pic: 'Dr. Aisha Khan',
    activeSuppliers: 42,
    poThisMonth: 18,
    spendingThisMonth: 'RM 24,500.00'
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-medical-600 relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-3xl shadow-lg border border-slate-100">
            <div className="w-24 h-24 rounded-[1.25rem] bg-medical-50 flex items-center justify-center text-medical-600 text-4xl font-bold">
              C
            </div>
          </div>
        </div>
        <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">{clinic.name}</h1>
            <p className="text-slate-500 font-medium">Reg No: {clinic.regNumber}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => toast.info('Edit mode enabled')}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Edit3 size={18} />
              Edit Clinic Details
            </button>
            <button 
              onClick={() => toast.info('Redirecting to staff management...')}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-slate-400 mt-1" size={18} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{clinic.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-slate-400" size={18} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                    <p className="text-sm text-slate-700">{clinic.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="text-slate-400" size={18} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                    <p className="text-sm text-slate-700">{clinic.email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="text-slate-400 mt-1" size={18} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operating Hours</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{clinic.operatingHours}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="text-slate-400" size={18} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary PIC</p>
                    <p className="text-sm text-slate-700">{clinic.pic}</p>
                  </div>
                </div>
              </div>
            </div>
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
                    <input type="text" placeholder="W10-1808-32000000" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Default Tax Rate</label>
                    <select className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20">
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
            value={clinic.activeSuppliers} 
            icon={Users} 
            color="bg-blue-500" 
          />
          <StatCard 
            title="POs This Month" 
            value={clinic.poThisMonth} 
            icon={TrendingUp} 
            color="bg-amber-500" 
          />
          <StatCard 
            title="Monthly Spending" 
            value={clinic.spendingThisMonth} 
            icon={CreditCard} 
            color="bg-medical-600" 
          />
        </div>
      </div>
    </div>
  );
}
