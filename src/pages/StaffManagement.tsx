import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  X, 
  User, 
  Briefcase,
  Building2,
  Trash2,
  Loader2,
  ShieldAlert,
  Info,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function StaffManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [staff, setStaff] = useState<any[]>([]);
  const [clinicName, setClinicName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for adding new staff members
  const [addFullName, setAddFullName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addRole, setAddRole] = useState('Doctor');
  const [addIsPrimaryPic, setAddIsPrimaryPic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPersonnel();
  }, [user]);

  const fetchPersonnel = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        // 1. Get currently authenticated main user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authUser) {
          // 2. Load their profile row to identify their clinic organization group
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

          const currentClinic = profileRow?.clinic_name || authUser?.user_metadata?.clinic_name || 'City Clinic KL';
          setClinicName(currentClinic);

          // 3. Query all profiles registered under this clinic from clinic_staff
          const { data: profiles, error: fetchError } = await supabase
            .from('clinic_staff')
            .select('*')
            .eq('clinic_name', currentClinic);

          if (fetchError) {
            throw fetchError;
          }

          // Strict database-only records to remove any demo/virtual injection records
          setStaff(profiles || []);
        } else {
          setStaff([]);
        }
      } else {
        // Fallback local storage state for live AI Studio previews when Supabase keys are not set yet
        const local = localStorage.getItem('mediorder_staff');
        if (local) {
          setStaff(JSON.parse(local));
        } else {
          const fallbackClinic = user?.user_metadata?.clinic_name || 'City Clinic KL';
          setClinicName(fallbackClinic);
          setStaff([]);
          localStorage.setItem('mediorder_staff', JSON.stringify([]));
        }
      }
    } catch (err: any) {
      console.error('Error fetching personnel:', err);
      toast.error(`Failed to load clinic personnel: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFullName.trim()) {
      toast.error('Full Name is required.');
      return;
    }
    if (!addEmail.trim()) {
      toast.error('Email Address is required.');
      return;
    }
    if (!addPhone.trim()) {
      toast.error('Phone Number is required.');
      return;
    }

    setIsSaving(true);
    try {
      const activeClinic = clinicName || 'City Clinic KL';

      if (isSupabaseConfigured && supabase) {
        // Safe check for user id, without blocking/redirecting
        let currentUserId = user?.id || null;
        try {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            currentUserId = authData.user.id;
          }
        } catch (e) {
          console.warn('Could not non-blockingly check auth user:', e);
        }

        const newProfile = {
          user_id: currentUserId,
          clinic_name: activeClinic,
          full_name: addFullName.trim(),
          email: addEmail.trim(),
          phone: addPhone.trim(),
          role: addRole,
          is_primary_pic: addIsPrimaryPic
        };

        const { error: insertError } = await supabase
          .from('clinic_staff')
          .insert([newProfile]);

        if (insertError) {
          throw insertError;
        }
      } else {
        // Save to LocalStorage
        const randomUUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        const freshStaff = {
          id: randomUUID,
          user_id: user?.id || 'demo-user-123',
          full_name: addFullName.trim(),
          email: addEmail.trim(),
          phone: addPhone.trim(),
          role: addRole,
          clinic_name: activeClinic,
          is_primary_pic: addIsPrimaryPic
        };
        const nextStaff = [...staff, freshStaff];
        setStaff(nextStaff);
        localStorage.setItem('mediorder_staff', JSON.stringify(nextStaff));
      }

      // 5. Success behavior: toast, close modal, refresh
      toast.success(`${addFullName.trim()} registered as ${addRole}!`);
      setIsModalOpen(false);

      // Reset form controls
      setAddFullName('');
      setAddEmail('');
      setAddPhone('');
      setAddRole('Doctor');
      setAddIsPrimaryPic(false);

      // Refresh listings instantly
      fetchPersonnel();
    } catch (err: any) {
      console.error('Error adding staff profile:', err);
      // 6. Show exact Supabase error message
      const exactMsg = err?.message || JSON.stringify(err);
      const codeInfo = err?.code ? ` [Code: ${err.code}]` : '';
      toast.error(`Could not onboard staff member: ${exactMsg}${codeInfo}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveStaff = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from your clinic roster?`)) {
      try {
        if (isSupabaseConfigured && supabase) {
          const { error } = await supabase
            .from('clinic_staff')
            .delete()
            .eq('id', id);

          if (error) {
            throw error;
          }
        } else {
          const list = staff.filter(s => s.id !== id);
          setStaff(list);
          localStorage.setItem('mediorder_staff', JSON.stringify(list));
        }

        toast.success(`${name} removed successfully.`);
        fetchPersonnel();
      } catch (err: any) {
        console.error('Error removing staff:', err);
        toast.error(`Could not remove personnel: ${err.message || err}`);
      }
    }
  };

  // Perform client filters on real data
  const filteredStaff = staff.filter(person => {
    const term = search.toLowerCase();
    const matchesName = (person.full_name || person.name || '').toLowerCase().includes(term);
    const matchesRole = (person.role || '').toLowerCase().includes(term);
    const matchesEmail = (person.email || '').toLowerCase().includes(term);
    return matchesName || matchesRole || matchesEmail;
  });

  const renderAddStaffModal = () => (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2.5rem] w-full max-w-xl relative z-10 shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-medical-50/50">
              <div className="flex items-center gap-3 text-medical-600">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Add New Staff member</h2>
                  <p className="text-xs text-slate-500 font-medium">Onboard trusted clinical or admin personnel</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStaffSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name *</label>
                  <input 
                    required 
                    type="text" 
                    value={addFullName}
                    onChange={(e) => setAddFullName(e.target.value)}
                    placeholder="e.g. Dr. Nur Aina" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 text-slate-800 font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address *</label>
                  <input 
                    required 
                    type="email" 
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="e.g. nuraina@cityclinic.com" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 text-slate-800 font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Phone Number *</label>
                  <input 
                    required 
                    type="tel" 
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="e.g. +60123456789" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 text-slate-800 font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Role / Designation *</label>
                  <div className="relative">
                    <select 
                      value={addRole}
                      onChange={(e) => setAddRole(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 text-slate-800 font-medium animate-none"
                    >
                      <option value="Clinic Owner">Clinic Owner</option>
                      <option value="Clinic Manager">Clinic Manager</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Pharmacist">Pharmacist</option>
                      <option value="Nurse">Nurse</option>
                      <option value="Medical Assistant">Medical Assistant</option>
                      <option value="Inventory Manager">Inventory Manager</option>
                      <option value="Procurement Officer">Procurement Officer</option>
                      <option value="Admin Staff">Admin Staff</option>
                      <option value="Receptionist">Receptionist</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-widest mb-2">Associated Clinic</label>
                  <div className="text-xs bg-slate-100/80 text-slate-650 px-4 py-[13px] rounded-xl font-bold flex items-center gap-2 border border-slate-200 h-[46px]">
                    <Building2 size={14} className="text-medical-600 shrink-0" />
                    <span className="truncate">{clinicName || 'City Clinic KL'}</span>
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_primary_pic"
                    checked={addIsPrimaryPic}
                    onChange={(e) => setAddIsPrimaryPic(e.target.checked)}
                    className="h-4 w-4 text-medical-600 focus:ring-medical-500 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="is_primary_pic" className="text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer select-none">
                    Set as Primary PIC (Person in Charge)
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm bg-white hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 py-4 bg-medical-600 text-white rounded-xl font-bold text-sm hover:bg-medical-700 transition-all shadow-lg shadow-medical-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving User...
                    </>
                  ) : (
                    'Add Staff member'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="h-10 w-10 text-medical-600 animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-medium">Synced with Supabase profiles database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">MediOrder Personnel</h1>
          <p className="text-slate-500 mt-1">Manage personnel and permissions registered under <strong className="text-slate-800">{clinicName || 'your practice'}</strong></p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          id="add-new-staff-btn"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-medical-600 text-white rounded-xl font-bold hover:bg-medical-700 transition-all shadow-lg shadow-medical-600/20 cursor-pointer text-sm"
        >
          <Plus size={18} />
          Add New Staff
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search staff by name or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all font-sans text-slate-800"
        />
      </div>

      {/* Roster Listing */}
      {staff.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-16 h-16 rounded-2xl bg-medical-50 text-medical-600 flex items-center justify-center mb-6">
            <Users size={32} />
          </div>
          <p className="text-slate-500 max-w-sm mb-6 font-medium">No personnel added yet. Click Add New Staff Member to begin.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-medical-600 hover:bg-medical-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Add New Staff Member
          </button>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-16 h-16 rounded-2xl bg-medical-50 text-medical-600 flex items-center justify-center mb-6">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Roster Members Match</h3>
          <p className="text-slate-500 max-w-sm mb-6">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredStaff.map((person) => {
            const displayName = person.full_name || person.name || 'Unnamed Staff';
            const displayRole = person.role || 'Staff Member';
            const displayEmail = person.email || 'No email saved';
            const displayClinic = person.clinic_name || clinicName || 'Your Practice';
            const isCurrentUser = person.isCurrentUser || (user && (person.id === user.id || person.user_id === user.id));

            return (
              <div 
                key={person.id} 
                className="bg-white rounded-[2rem] border border-slate-200 shadow-sm relative group hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                {/* Visual Accent */}
                <div className={`h-2 w-full ${isCurrentUser ? 'bg-medical-500' : 'bg-slate-100'}`} />
                
                <div className="p-6 flex flex-col items-center text-center space-y-4 flex-1">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-medical-50 flex items-center justify-center text-medical-600 text-2xl font-bold border-4 border-white shadow-sm ring-1 ring-slate-100 uppercase font-sans">
                      {displayName.charAt(0)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                       <h3 className="font-bold text-slate-900 line-clamp-1 truncate" title={displayName}>{displayName}</h3>
                       {isCurrentUser && (
                         <span className="px-2 py-0.5 bg-medical-100 text-medical-700 text-[9px] font-bold rounded-full uppercase tracking-wider shrink-0 font-sans">You</span>
                       )}
                       {person.is_primary_pic && (
                         <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded-full uppercase tracking-wider shrink-0 font-sans">Primary PIC</span>
                       )}
                    </div>
                    <p className="text-[10px] font-bold text-medical-600 uppercase tracking-widest">{displayRole}</p>
                  </div>

                  <div className="w-full pt-4 space-y-2.5 border-t border-slate-100/80">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                       <Mail size={14} className="shrink-0 text-slate-400" />
                       <span className="truncate font-sans font-medium" title={displayEmail}>{displayEmail}</span>
                    </div>
                    {person.phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                         <span className="text-[11px] shrink-0 text-slate-400 font-bold">☏</span>
                         <span className="truncate font-sans font-medium" title={person.phone}>{person.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                       <Building2 size={14} className="shrink-0 text-slate-400" />
                       <span className="truncate font-sans font-semibold text-slate-700" title={displayClinic}>{displayClinic}</span>
                    </div>
                  </div>
                </div>

                {/* Card Controls */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {isCurrentUser ? 'Active Node' : 'Enrolled'}
                  </span>
                  
                  {!isCurrentUser && (
                    <button 
                      onClick={() => handleRemoveStaff(person.id, displayName)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove Staff member"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {renderAddStaffModal()}
    </div>
  );
}
