import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  ShoppingBag, 
  ChevronDown, 
  AlertTriangle,
  ArrowUpDown,
  MoreVertical,
  Layers,
  Building2,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { Medicine } from '../types';
import { Link, useNavigate } from 'react-router-dom';

const defaultCatalog: Medicine[] = [
  { id: '1', name: 'Paracetamol', dosage: '500mg', category: 'General', supplier: 'MedCare Supplies', unit: 'Box of 100', unitPrice: 45.00, stockStatus: 'Low Stock', lastOrderedDate: 'May 02, 2026' },
  { id: '2', name: 'Amoxicillin', dosage: '250mg', category: 'Antibiotics', supplier: 'Sabah Pharma', unit: 'Bottle', unitPrice: 12.50, stockStatus: 'In Stock', lastOrderedDate: 'May 10, 2026' },
  { id: '3', name: 'Cough Syrup', dosage: '100ml', category: 'Respiratory', supplier: 'KlinikMed', unit: 'Bottle', unitPrice: 8.90, stockStatus: 'In Stock', lastOrderedDate: 'Apr 25, 2026' },
  { id: '4', name: 'Insulin Pen', dosage: '3ml', category: 'Diabetes', supplier: 'MedCare Supplies', unit: 'Pack of 5', unitPrice: 185.00, stockStatus: 'In Stock', lastOrderedDate: 'May 14, 2026' },
  { id: '5', name: 'Surgical Gloves', dosage: 'Size 7', category: 'Consumables', supplier: 'Borneo Medical', unit: 'Box of 50', unitPrice: 32.00, stockStatus: 'Out of Stock', lastOrderedDate: 'Apr 15, 2026' },
  { id: '6', name: 'Alcohol Swabs', dosage: '70% IPA', category: 'Consumables', supplier: 'Borneo Medical', unit: 'Box of 200', unitPrice: 15.00, stockStatus: 'In Stock', lastOrderedDate: 'May 12, 2026' },
  { id: '7', name: 'Syringes', dosage: '5ml', category: 'Consumables', supplier: 'KlinikMed', unit: 'Pack of 100', unitPrice: 28.00, stockStatus: 'Low Stock', lastOrderedDate: 'May 01, 2026' },
  { id: '8', name: 'Antiseptic Solution', dosage: '500ml', category: 'Topical', supplier: 'MedCare Supplies', unit: 'Bottle', unitPrice: 18.20, stockStatus: 'In Stock', lastOrderedDate: 'May 08, 2026' },
];

export default function MedicineCatalog() {
  const navigate = useNavigate();
  const [medicines] = useState<Medicine[]>(defaultCatalog);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All Categories');
  const [stockFilter, setStockFilter] = useState('All Stock');

  const categories = ['All Categories', ...Array.from(new Set(medicines.map(m => m.category)))];
  const stockOptions = ['All Stock', 'In Stock', 'Low Stock', 'Out of Stock'];

  const filtered = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.supplier.toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter === 'All Categories' || m.category === catFilter;
    const matchesStock = stockFilter === 'All Stock' || m.stockStatus === stockFilter;
    return matchesSearch && matchesCat && matchesStock;
  });

  const handleAddToPO = (medicine: Medicine) => {
    toast.success(`Default quantity of ${medicine.name} added to draft order`, {
      description: `Added to draft for ${medicine.supplier}`,
      action: {
        label: 'View Order',
        onClick: () => navigate('/create-po')
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Medicine Catalog</h1>
          <p className="text-slate-500 mt-1">Browse and search clinic inventory and supplies.</p>
        </div>
        <div className="flex gap-3">
          <button 
           onClick={() => toast.info('Inventory audit feature coming soon')}
           className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Layers size={18} />
            Inventory Audit
          </button>
          <Link 
            to="/create-po"
            className="px-6 py-3 bg-medical-600 text-white rounded-xl font-bold text-sm hover:bg-medical-700 transition-all flex items-center gap-2 shadow-lg shadow-medical-600/20"
          >
            <ShoppingBag size={18} />
            Bulk Create PO
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-sans" size={18} />
            <input 
              type="text" 
              placeholder="Search products, brands, or manufacturers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-medical-600/20 focus:ring-4 focus:ring-medical-600/5 transition-all outline-none font-sans"
            />
         </div>
         <div className="flex gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-48">
               <select 
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="w-full appearance-none pl-10 pr-10 py-3 bg-slate-50 border border-transparent rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white transition-all"
               >
                 {categories.map(c => <option key={c}>{c}</option>)}
               </select>
               <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
            <div className="relative flex-1 lg:w-48">
               <select 
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full appearance-none pl-10 pr-10 py-3 bg-slate-50 border border-transparent rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white transition-all"
               >
                 {stockOptions.map(o => <option key={o}>{o}</option>)}
               </select>
               <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
         </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="py-4 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900 transition-colors">
                     Product Details <ArrowUpDown size={12} />
                   </div>
                </th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supplier</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing (RM)</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Stock</th>
                <th className="py-4 px-8 w-40"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-medical-50 flex items-center justify-center text-medical-600 group-hover:scale-110 transition-transform">
                         <Package size={20} />
                       </div>
                       <div>
                         <p className="font-bold text-slate-900">{m.name}</p>
                         <p className="text-xs text-slate-500">{m.dosage} • {m.unit}</p>
                       </div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                     <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                       {m.category}
                     </span>
                  </td>
                  <td className="py-5 px-4 text-xs font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                       <Building2 size={14} className="text-slate-400" />
                       {m.supplier}
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <p className="text-sm font-bold text-slate-900">RM {m.unitPrice.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Per {m.unit.split(' ')[0]}</p>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex flex-col items-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        m.stockStatus === 'In Stock' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        m.stockStatus === 'Low Stock' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {m.stockStatus}
                      </span>
                      {m.stockStatus === 'Low Stock' && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600 font-bold">
                           <AlertTriangle size={10} /> Auto-refill active
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button 
                        onClick={() => handleAddToPO(m)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          m.stockStatus === 'Out of Stock' 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-medical-50 text-medical-600 hover:bg-medical-600 hover:text-white'
                        }`}
                        disabled={m.stockStatus === 'Out of Stock'}
                      >
                        Add to PO
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 text-center space-y-4">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <Search size={32} />
               </div>
               <div className="space-y-1">
                 <p className="font-bold text-slate-900">No products found</p>
                 <p className="text-sm text-slate-500">Try adjusting your search or filters to find what you are looking for.</p>
               </div>
               <button 
                onClick={() => {setSearch(''); setCatFilter('All Categories'); setStockFilter('All Stock');}}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
               >
                 Clear All Filters
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
