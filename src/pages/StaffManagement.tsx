import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical, 
  ShieldCheck, 
  Edit2, 
  Trash2,
  Mail,
  Phone,
  X,
  User,
  Camera,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { Staff } from '../types';

const defaultStaff: Staff[] = [
  { id: '1', name: 'Dr. Nur Aina', role: 'Clinic Owner', email: 'nuraina@cityclinic.com', phone: '+60 12-345 6789', clinic: 'City Clinic KL', isApprovalEnabled: true, isPrimaryPIC: true },
  { id: '2', name: 'Siti Aminah', role: 'Clinic Assistant', email: 'siti@cityclinic.com', phone: '+60 13-456 7890', clinic: 'City Clinic KL', isApprovalEnabled: false, isPrimaryPIC: false },
  { id: '3', name: 'Farah Lim', role: 'Procurement Officer', email: 'farah@cityclinic.com', phone: '+60 16-789 0123', clinic: 'City Clinic KL', isApprovalEnabled: true, isPrimaryPIC: false },
  { id: '4', name: 'Ahmad Hakim', role: 'Admin Staff', email: 'ahmad@cityclinic.com', phone: '+60 19-234 5678', clinic: 'City Clinic KL', isApprovalEnabled: false, isPrimaryPIC: false },
];

export default function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>(defaultStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newStaff, setNewStaff] = useState<Partial<Staff>>({
    role: 'Admin Staff',
    isApprovalEnabled: false
  });

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).substr(2, 9);
    const addedStaff = { ...newStaff, id, clinic: 'City Clinic KL', isPrimaryPIC: false } as Staff;
    setStaff([...staff, addedStaff]);
    setIsModalOpen(false);
    toast.success(`Staff ${addedStaff.name} added successfully!`);
    setNewStaff({ role: 'Admin Staff', isApprovalEnabled: false });
  };

  const handleRemove = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      setStaff(staff.filter(s => s.id !== id));
      toast.success(`${name} removed from registry.`);
    }
  };

  const setPrimary = (id: string) => {
    setStaff(staff.map(s => ({ ...s, isPrimaryPIC: s.id === id })));
    toast.success('Primary PIC updated');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-500 mt-1">Manage permissions and contact details for your clinic personnel.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-medical-600 text-white rounded-xl font-bold hover:bg-medical-700 transition-all shadow-lg shadow-medical-600/20"
        >
          <Plus size={20} />
          Add New Staff
        </button>
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-sans" size={18} />
        <input 
          type="text" 
          placeholder="Search by name or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all font-sans"
        />
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredStaff.map((person) => (
          <div key={person.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm relative group hover:shadow-md transition-all overflow-hidden flex flex-col">
            {/* Top Decoration */}
            <div className={`h-2 w-full ${person.isPrimaryPIC ? 'bg-medical-600' : 'bg-slate-100'}`} />
            
            <div className="p-6 flex flex-col items-center text-center space-y-4 flex-1">
              <div className="relative">
                <div className="w-20 h-20 rounded-[1.5rem] bg-medical-50 flex items-center justify-center text-medical-600 text-2xl font-bold border-4 border-white shadow-sm ring-1 ring-slate-100 uppercase">
                  {person.name.charAt(0)}
                </div>
                {person.isApprovalEnabled && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Approval Permissions On">
                    <ShieldCheck size={14} />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                   <h3 className="font-bold text-slate-900">{person.name}</h3>
                   {person.isPrimaryPIC && (
                     <span className="px-2 py-0.5 bg-medical-50 text-medical-600 text-[10px] font-bold rounded-full uppercase tracking-tighter">Primary</span>
                   )}
                </div>
                <p className="text-xs font-semibold text-medical-600 uppercase tracking-widest">{person.role}</p>
              </div>

              <div className="w-full pt-4 space-y-2 border-t border-slate-50">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                   <Mail size={14} className="shrink-0" />
                   <span className="truncate">{person.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                   <Phone size={14} className="shrink-0" />
                   <span>{person.phone}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/50 flex justify-between gap-2">
               <button 
                onClick={() => toast.info(`Editing ${person.name}...`)}
                className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:text-medical-600 hover:border-medical-600 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
               >
                 <Edit2 size={12} />
                 Edit
               </button>
               <div className="relative group/menu">
                  <button className="h-full px-3 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 hidden group-hover/menu:block z-20 overflow-hidden">
                    {!person.isPrimaryPIC && (
                      <button 
                        onClick={() => setPrimary(person.id)}
                        className="w-full text-left px-4 py-3 text-xs font-medium text-slate-600 hover:bg-medical-50 hover:text-medical-600 transition-colors"
                      >
                        Set as Primary PIC
                      </button>
                    )}
                    <button 
                      onClick={() => handleRemove(person.id, person.name)}
                      className="w-full text-left px-4 py-3 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Remove Staff
                    </button>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-medical-600">
                  <div className="p-2 bg-medical-50 rounded-xl">
                    <User size={24} />
                  </div>
                  <h2 className="text-xl font-bold">Add New Staff</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddStaff} className="p-8 space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 group-hover:bg-slate-50 group-hover:text-medical-600 group-hover:border-medical-600 transition-all">
                      <Camera size={24} />
                      <span className="text-[10px] font-bold uppercase mt-1">Upload</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Dr. Adam Haris"
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Role</label>
                    <div className="relative">
                      <select 
                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                        className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all"
                      >
                        <option>Admin Staff</option>
                        <option>Clinic Assistant</option>
                        <option>Procurement Officer</option>
                        <option>Clinic Specialist</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                    <input 
                      required
                      type="email" 
                      placeholder="name@cityclinic.com"
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      placeholder="+60 1x-xxx xxxx"
                      onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all" 
                    />
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <input 
                      type="checkbox" 
                      id="approval"
                      onChange={(e) => setNewStaff({ ...newStaff, isApprovalEnabled: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-medical-600 focus:ring-medical-600"
                    />
                    <label htmlFor="approval" className="text-sm font-medium text-slate-700">Can approve Purchase Orders</label>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-medical-600 text-white rounded-xl font-bold text-sm hover:bg-medical-700 transition-all shadow-lg shadow-medical-600/20"
                  >
                    Register Staff
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
