import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Tag, 
  Calendar,
  ExternalLink,
  ChevronDown,
  MoreVertical,
  X,
  PlusCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { Supplier } from '../types';
import { Link } from 'react-router-dom';

const defaultSuppliers: Supplier[] = [
  { 
    id: '1', 
    name: 'MedCare Supplies Sdn Bhd', 
    contactPerson: 'David Wong', 
    phone: '+60 3-8000 1234', 
    email: 'sales@medcare.com.my', 
    address: 'Lot 15, Industrial Area Section 51, 46050 Petaling Jaya, Selangor',
    categories: ['Consumables', 'Surgical'],
    reliabilityScore: 4.8,
    paymentTerms: 'Credit 30 Days',
    lastOrderDate: 'May 12, 2026',
    status: 'Active'
  },
  { 
    id: '2', 
    name: 'Sabah Pharma Distribution', 
    contactPerson: 'Fatimah Ali', 
    phone: '+60 88-123 456', 
    email: 'info@sabahpharma.com', 
    address: 'No. 8, Lorong Kilang C, Kolombong Industrial Estate, 88450 Kota Kinabalu',
    categories: ['Pharmaceuticals', 'Vaccines'],
    reliabilityScore: 4.5,
    paymentTerms: 'Prepaid',
    lastOrderDate: 'May 05, 2026',
    status: 'Active'
  },
  { 
    id: '3', 
    name: 'KlinikMed Wholesale', 
    contactPerson: 'Kenji Tan', 
    phone: '+60 3-5678 9012', 
    email: 'orders@klinikmed.com.my', 
    address: 'Level 2, Wisma KlinikMed, No 1, Jalan Semangar, 50470 Kuala Lumpur',
    categories: ['Diagnostic Equipment', 'Furniture'],
    reliabilityScore: 4.2,
    paymentTerms: 'Credit 15 Days',
    lastOrderDate: 'Apr 28, 2026',
    status: 'Pending'
  },
  { 
    id: '4', 
    name: 'Borneo Medical Supply', 
    contactPerson: 'Sarifah Hussin', 
    phone: '+60 82-445 566', 
    email: 'admin@borneomedical.com', 
    address: 'Ground Floor, Lot 2345, Bintawa Industrial Estate, 93450 Kuching, Sarawak',
    categories: ['General Medicine', 'Personal Care'],
    reliabilityScore: 4.6,
    paymentTerms: 'Cash on Delivery',
    lastOrderDate: 'May 15, 2026',
    status: 'Active'
  },
];

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(defaultSuppliers);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.contactPerson.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || s.categories.includes(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const allCategories = ['All Categories', ...Array.from(new Set(suppliers.flatMap(s => s.categories)))];

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Supplier application submitted for review');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">MediOrder Supplier Network</h1>
          <p className="text-slate-500 mt-1">Direct connections to Malayias leading medical distributors.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-medical-600 text-white rounded-xl font-bold hover:bg-medical-700 transition-all shadow-lg shadow-medical-600/20"
        >
          <Building2 size={20} />
          Onboard New Supplier
        </button>
      </div>

      {/* Quick Stats Featured Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {suppliers.slice(0, 4).map((s, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
             <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl bg-medical-50 text-medical-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                  {s.name.charAt(0)}
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                   <Star size={12} fill="currentColor" />
                   <span className="text-xs font-bold">{s.reliabilityScore}</span>
                </div>
             </div>
             <h3 className="font-bold text-slate-900 truncate">{s.name}</h3>
             <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">{s.categories[0]}</p>
             <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-500">Terms: <b>{s.paymentTerms}</b></span>
                <Link to="/create-po" className="text-medical-600 font-bold hover:underline">Shop</Link>
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
                 className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-600/20"
               />
             </div>
             <div className="relative">
               <select 
                 value={categoryFilter}
                 onChange={(e) => setCategoryFilter(e.target.value)}
                 className="appearance-none pl-10 pr-10 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20"
               >
                 {allCategories.map(cat => <option key={cat}>{cat}</option>)}
               </select>
               <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
             </div>
           </div>
           <button 
            onClick={() => toast.info('Exporting suppliers list...')}
            className="w-full md:w-auto px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 flex items-center justify-center gap-2"
           >
             <Tag size={16} />
             Manage Categories
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supplier</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Categories</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Information</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score / Terms</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="py-3 px-6 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold">
                        {s.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{s.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                           <Clock size={10} /> Last Order: {s.lastOrderDate}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {s.categories.map(cat => (
                        <span key={cat} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-700">{s.contactPerson}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Mail size={10} /> {s.email}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                     <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={10} 
                              className={i < Math.floor(s.reliabilityScore) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} 
                            />
                          ))}
                          <span className="text-[10px] font-bold text-slate-900 ml-1">{s.reliabilityScore}</span>
                        </div>
                        <p className="text-[10px] font-bold text-medical-600 bg-medical-50 inline-block px-1.5 rounded">
                          {s.paymentTerms.toUpperCase()}
                        </p>
                     </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      s.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : s.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-slate-50 text-slate-500 border border-slate-100'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toast.info(`Contacting ${s.contactPerson}...`)}
                        className="p-2 text-slate-400 hover:text-medical-600 rounded-lg hover:bg-medical-50 transition-all"
                        title="Contact"
                      >
                        <Mail size={16} />
                      </button>
                      <Link 
                        to="/create-po" 
                        className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all font-sans"
                        title="Quick Order"
                      >
                        <PlusCircle size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <p className="text-xs text-slate-500 font-medium">Showing {filteredSuppliers.length} suppliers across Malaysia</p>
          <div className="flex gap-2">
             <button className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-400 cursor-not-allowed">Previous</button>
             <button className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>

      {/* Onboard Modal */}
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
                    <h2 className="text-xl font-bold">New Supplier Application</h2>
                    <p className="text-xs text-slate-500 font-medium">Expand your procurement network</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddSupplier} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Company Name</label>
                  <input required type="text" placeholder="e.g. PharmaDirect Malaysia" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Business Category</label>
                  <select className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20">
                    <option>Pharmaceuticals</option>
                    <option>Surgical Equipment</option>
                    <option>General Supplies</option>
                    <option>Lab Consumables</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Primary Contact</label>
                  <input required type="text" placeholder="Full Name" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contact Email</label>
                  <input required type="email" placeholder="sales@supplier.com" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Registered Address (Malaysia)</label>
                  <textarea rows={2} placeholder="Full business address..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 resize-none"></textarea>
                </div>
                
                <div className="md:col-span-2 pt-4 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-medical-600 text-white rounded-xl font-bold text-sm hover:bg-medical-700 transition-all shadow-lg shadow-medical-600/20">Submit Application</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
