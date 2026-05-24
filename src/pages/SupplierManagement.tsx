import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin, 
  Tag, 
  Calendar,
  ChevronDown,
  X,
  PlusCircle,
  Clock,
  Briefcase,
  Layers,
  Info,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function SupplierManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clinicName, setClinicName] = useState('');

  // Form states for onboarding a new supplier
  const [addName, setAddName] = useState('');
  const [addCategory, setAddCategory] = useState('Pharmaceuticals');
  const [addPhone, setAddPhone] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, [user]);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        // Query suppliers table only for the current clinic
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          // Get clinic name
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('clinic_name')
            .eq('id', currentUser.id)
            .maybeSingle();

          const activeClinic = profileRow?.clinic_name || currentUser?.user_metadata?.clinic_name || 'City Clinic KL';
          setClinicName(activeClinic);

          const { data, error } = await supabase
            .from('suppliers')
            .select('*')
            .eq('clinic_name', activeClinic);

          if (error) {
            throw error;
          }
          setSuppliers(data || []);
        } else {
          setSuppliers([]);
        }
      } else {
        // LocalStorage fallback if Supabase not configured
        const local = localStorage.getItem('mediorder_suppliers');
        if (local) {
          setSuppliers(JSON.parse(local));
        } else {
          setSuppliers([]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
      toast.error(`Error loading suppliers: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      toast.error('Company Name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const activeClinic = clinicName || user?.user_metadata?.clinic_name || 'City Clinic KL';
      
      if (isSupabaseConfigured && supabase) {
        let currentUserId = user?.id || null;
        try {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            currentUserId = authData.user.id;
          }
        } catch (e) {
          console.warn('Could not get actual auth user:', e);
        }

        const newRow = {
          user_id: currentUserId,
          name: addName.trim(),
          email: addEmail.trim() || null,
          phone: addPhone.trim() || null,
          clinic_name: activeClinic,
          categories: [addCategory],
          address: '',
          contact_person: '',
          payment_terms: 'COD'
        };

        const { error: insertError } = await supabase
          .from('suppliers')
          .insert([newRow]);

        if (insertError) {
          throw insertError;
        }
      } else {
        // Local fallback
        const newRow = {
          id: Math.random().toString(),
          name: addName.trim(),
          email: addEmail.trim() || null,
          phone: addPhone.trim() || null,
          clinic_name: activeClinic,
          categories: [addCategory],
          address: '',
          contact_person: '',
          payment_terms: 'COD',
          created_at: new Date().toISOString()
        };
        const currentLocal = [...suppliers, newRow];
        localStorage.setItem('mediorder_suppliers', JSON.stringify(currentLocal));
        setSuppliers(currentLocal);
      }

      toast.success('Supplier onboarded successfully!');
      setIsModalOpen(false);

      // Reset Form fields
      setAddName('');
      setAddCategory('Pharmaceuticals');
      setAddEmail('');
      setAddPhone('');

      // Refresh supplier list
      fetchSuppliers();
    } catch (err: any) {
      console.error('Error saving supplier:', err);
      const exactMsg = err?.message || JSON.stringify(err);
      const codeInfo = err?.code ? ` [Code: ${err.code}]` : '';
      const detailsInfo = err?.details ? ` - Details: ${err.details}` : '';
      const hintInfo = err?.hint ? ` - Hint: ${err.hint}` : '';
      const cacheReloadTip = "\nTip: If you recently changed the schema, please reload PostgREST schema cache by running 'NOTIFY pgrst, \"reload schema\";' in your Supabase SQL Editor and try again.";
      toast.error(`Supabase Save Error: ${exactMsg}${codeInfo}${detailsInfo}${hintInfo}${cacheReloadTip}`, {
        duration: 10000
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoToCatalog = (supplierLabel: string) => {
    navigate('/catalog', { state: { supplierFilter: supplierLabel } });
  };

  // Setup list search and filters
  const filteredSuppliers = suppliers.filter(s => {
    const sName = s.name || '';
    const sEmail = s.email || '';
    const sPhone = s.phone || '';
    const matchesSearch = sName.toLowerCase().includes(search.toLowerCase()) || 
                          sEmail.toLowerCase().includes(search.toLowerCase()) ||
                          sPhone.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'All Categories' || 
                            (s.categories && s.categories.includes(categoryFilter));

    return matchesSearch && matchesCategory;
  });

  const allCategories = ['All Categories', ...Array.from(new Set(suppliers.flatMap(s => s.categories || [])))];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const dt = new Date(dateStr);
      return dt.toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const renderOnboardModal = () => (
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
            className="bg-white rounded-[2.5rem] w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-medical-50/50">
              <div className="flex items-center gap-3 text-medical-600">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Building2 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Onboard New Supplier</h2>
                  <p className="text-xs text-slate-500 font-medium font-sans">Register a trusted distributor for your clinic</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSupplierSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Company Name *</label>
                <input 
                  required 
                  type="text" 
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. PharmaDirect Malaysia" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 text-slate-800 font-medium" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Business Category</label>
                <div className="relative">
                  <select 
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 text-slate-800 font-medium"
                  >
                    <option value="Pharmaceuticals">Pharmaceuticals</option>
                    <option value="Surgical Equipment">Surgical Equipment</option>
                    <option value="General Supplies">General Supplies</option>
                    <option value="Lab Consumables">Lab Consumables</option>
                    <option value="Vaccines">Vaccines</option>
                    <option value="Diagnostics">Diagnostics</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contact Email</label>
                <input 
                  type="email" 
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="e.g. sales@pharmadirect.com.my" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 text-slate-800 font-medium" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contact Phone</label>
                <input 
                  type="text" 
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  placeholder="e.g. +60 3-8000 1234" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 text-slate-800 font-medium" 
                />
              </div>
              
              <div className="md:col-span-2 pt-4 flex gap-4">
                <button 
                  type="button" 
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all cursor-pointer"
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
                      Saving...
                    </>
                  ) : (
                    'Onboard Supplier'
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
        <p className="text-slate-500 text-sm font-medium">Synced with Supabase suppliers directory...</p>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">MediOrder Supplier Network</h1>
            <p className="text-slate-500 mt-1">Direct connections to Malaysia's leading medical distributors.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            id="onboard-new-supplier-empty"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-medical-600 text-white rounded-xl font-bold hover:bg-medical-700 transition-all shadow-lg shadow-medical-600/20 cursor-pointer"
          >
            <Building2 size={20} />
            Onboard New Supplier
          </button>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px] overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-medical-50 text-medical-600 flex items-center justify-center mb-6">
            <Building2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Suppliers Found</h3>
          <p className="text-slate-500 max-w-md mb-8">No suppliers added yet. Onboard your first supplier to begin.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-medical-600 hover:bg-medical-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-medical-600/10 cursor-pointer"
          >
            Onboard Your First Supplier
          </button>
        </div>

        {renderOnboardModal()}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">MediOrder Supplier Network</h1>
          <p className="text-slate-500 mt-1">Direct connections to Malaysia's leading medical distributors.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          id="onboard-new-supplier"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-medical-600 text-white rounded-xl font-bold hover:bg-medical-700 transition-all shadow-lg shadow-medical-600/20 cursor-pointer"
        >
          <Building2 size={20} />
          Onboard New Supplier
        </button>
      </div>

      {/* Dynamic Featured Suppliers (Slice of first 4 real) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {suppliers.slice(0, 4).map((s) => (
          <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
             <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl bg-medical-50 text-medical-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                  {s.name ? s.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-sans">
                  Onboarded
                </div>
             </div>
             <h3 className="font-bold text-slate-900 truncate" title={s.name}>{s.name}</h3>
             <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">
               {s.categories?.[0] || 'Medical General'}
             </p>
             <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-xs text-slate-400 font-medium">Added: {formatDate(s.created_at)}</span>
                <button 
                  onClick={() => handleGoToCatalog(s.name)} 
                  className="text-medical-600 font-bold hover:underline hover:text-medical-700 cursor-pointer text-xs"
                >
                  Shop
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Main Filter & Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
           <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-72">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Search suppliers..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-600/20 text-slate-800"
               />
             </div>
             <div className="relative">
               <select 
                 value={categoryFilter}
                 onChange={(e) => setCategoryFilter(e.target.value)}
                 className="appearance-none pl-10 pr-10 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 text-slate-700 font-medium"
               >
                 {allCategories.map(cat => <option key={cat}>{cat}</option>)}
               </select>
               <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
             </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supplier Name</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Categories</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Email</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Phone</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Associated Clinic</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Onboarded</th>
                <th className="py-3 px-6 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold">
                        {s.name ? s.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate" title={s.name}>{s.name || 'Unnamed Supplier'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs font-sans">
                    <div className="flex flex-wrap gap-1">
                      {(s.categories || s.category ? (s.categories || [s.category]) : ['General Supplies']).map((cat: string) => (
                        <span key={cat} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs text-slate-600 font-medium font-sans flex items-center gap-1.5">
                      <Mail size={12} className="text-slate-400" />
                      {s.email || 'No email saved'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs text-slate-600 font-medium font-sans flex items-center gap-1.5">
                      <Phone size={12} className="text-slate-400" />
                      {s.phone || 'No phone saved'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs text-slate-600 font-semibold font-sans">
                      {s.clinic_name || 'Allied Practices'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-400 font-medium font-sans">
                     {formatDate(s.created_at)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => handleGoToCatalog(s.name)}
                      className="px-3.5 py-1.5 bg-medical-50 text-medical-700 hover:bg-medical-100 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer w-fit ml-auto"
                    >
                      <PlusCircle size={14} />
                      Shop
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <p className="text-xs text-slate-500 font-medium font-sans">Showing {filteredSuppliers.length} suppliers in Malaysia</p>
        </div>
      </div>

      {renderOnboardModal()}
    </div>
  );
}
