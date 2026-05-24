import React, { useState, useEffect } from 'react';
import { 
  Database,
  Search,
  Plus,
  Edit2,
  Check,
  X,
  AlertTriangle,
  ArrowUpDown,
  Building2,
  Calendar,
  Layers,
  ShoppingBag,
  Loader2,
  Save,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Sparkles,
  ClipboardList,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { InventoryItem } from '../data/defaultData';

export default function ClinicInventory() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and status thresholds
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addDosage, setAddDosage] = useState('');
  const [addSupplier, setAddSupplier] = useState('');
  const [addUnit, setAddUnit] = useState('Box');
  const [addQty, setAddQty] = useState('');
  const [addReorder, setAddReorder] = useState('10');
  const [isSaving, setIsSaving] = useState(false);

  // Inline Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editReorder, setEditReorder] = useState<number>(0);

  // Fetch Clinic Inventory details
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: fetchErr } = await supabase
          .from('clinic_inventory')
          .select('*')
          .order('medicine_name', { ascending: true });

        if (fetchErr) {
          console.warn('clinic_inventory table not found or empty. Error:', fetchErr.message);
          setInventory([]);
        } else {
          setInventory(data || []);
        }
      } else {
        // Supabase is not configured yet - show empty states
        setInventory([]);
      }
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setInventory([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [user]);

  // Automatic Stock Status Calculation helper
  const getCalculatedStatus = (qty: number, reorder: number) => {
    if (qty === 0) return 'Out of Stock';
    if (qty <= reorder) return 'Low Stock';
    return 'In Stock';
  };

  // Filter criteria
  const filtered = inventory.filter(item => {
    const nameMatch = (item.medicine_name || '').toLowerCase().includes(search.toLowerCase()) ||
                     (item.supplier_name || '').toLowerCase().includes(search.toLowerCase());

    const status = getCalculatedStatus(item.current_stock_quantity, item.reorder_level);
    const statusMatch = statusFilter === 'All' || status === statusFilter;

    return nameMatch && statusMatch;
  });

  // Activate inline editing mode
  const startEditing = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditQty(item.current_stock_quantity);
    setEditReorder(item.reorder_level);
  };

  // Cancel inline editing mode
  const cancelEditing = () => {
    setEditingId(null);
  };

  // Save inline edits (quantity + reorder level)
  const saveEdits = async (id: string) => {
    try {
      const parsedQty = Math.max(0, Number(editQty));
      const parsedReorder = Math.max(0, Number(editReorder));
      const nowString = new Date().toISOString();

      if (isSupabaseConfigured && supabase) {
        // Try to update clinic_inventory table directly
        const { error: updateErr } = await supabase
          .from('clinic_inventory')
          .update({
            current_stock_quantity: parsedQty,
            reorder_level: parsedReorder,
            updated_at: nowString
          })
          .eq('id', id);

        if (updateErr) {
          throw updateErr;
        }

        toast.success('Stock levels updated successfully in db!');
      } else {
        // Localstorage fallback updates
        const updated = inventory.map(item => {
          if (item.id === id) {
            return {
              ...item,
              current_stock_quantity: parsedQty,
              reorder_level: parsedReorder,
              updated_at: nowString
            };
          }
          return item;
        });

        localStorage.setItem('mediorder_clinic_inventory', JSON.stringify(updated));
        toast.success('Stock levels updated dynamically.');
      }

      setEditingId(null);
      fetchInventory();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to update stock metrics.');
    }
  };

  // Add Item to Clinic Inventory manually
  const handleAddNewItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      toast.error('Medicine name is required.');
      return;
    }
    setIsSaving(true);

    try {
      const parsedQty = Number(addQty || 0);
      const parsedReorder = Number(addReorder || 10);
      const nowString = new Date().toISOString();

      if (isSupabaseConfigured && supabase) {
        // Run optionally or not at all, just log if debug needed, without blocking or redirecting.
        try {
          const { data: authData } = await supabase.auth.getUser();
          console.log("Current auth state: ", authData?.user?.id || 'anonymous');
        } catch (e) {
          console.warn("Could not retrieve auth state non-blockingly:", e);
        }

        // Insert exactly the fields that exist in the database.
        const insertRow: any = {
          supplier_medicine_id: null,
          medicine_name: addName.trim(),
          dosage: addDosage.trim(),
          supplier_name: addSupplier || 'Generic Supplier',
          current_stock_quantity: parsedQty,
          reorder_level: parsedReorder,
          unit: addUnit,
          updated_at: nowString,
          last_updated: nowString
        };

        const { error: insertErr } = await supabase
          .from('clinic_inventory')
          .insert([insertRow]);

        if (insertErr) {
          throw insertErr;
        }
        toast.success(`Registered ${addName} in Inventory database!`);
      } else {
        const localInvJson = localStorage.getItem('mediorder_clinic_inventory');
        const invList = localInvJson ? JSON.parse(localInvJson) : [];
        
        const newRecord: InventoryItem = {
          id: `CI-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          medicine_name: addName,
          dosage: addDosage,
          supplier_name: addSupplier || 'Generic Supplier',
          current_stock_quantity: parsedQty,
          reorder_level: parsedReorder,
          unit: addUnit,
          updated_at: nowString
        };

        const updated = [newRecord, ...invList];
        localStorage.setItem('mediorder_clinic_inventory', JSON.stringify(updated));
        toast.success(`Added ${addName} to clinic inventory locally.`);
      }

      // reset & dismiss
      setAddName('');
      setAddDosage('');
      setAddSupplier('');
      setAddUnit('Box');
      setAddQty('');
      setAddReorder('10');
      setShowAddModal(false);
      // Refresh Clinic Inventory from Supabase after successful insert
      fetchInventory();
    } catch (err: any) {
      console.error(err);
      const detailedMessage = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      toast.error(`Database Error: ${detailedMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Add clinic inventory item straight to active draft PO for restocking!
  const handleRestockPO = (item: InventoryItem) => {
    try {
      const saved = localStorage.getItem('mediorder_draft_po');
      let draft: any = {};
      if (saved) {
        try {
          draft = JSON.parse(saved);
        } catch (e) {
          draft = {};
        }
      }

      if (!draft.poNumber) {
        draft.poNumber = `PO-2026-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        draft.orderDate = new Date().toISOString().split('T')[0];
        draft.expectedDeliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        draft.paymentTerms = 'Net 30';
        draft.specialInstructions = 'Please deliver items rapidly. Stock levels are critical.';
        draft.clinicName = user?.user_metadata?.clinic_name || 'City Clinic Kuala Lumpur';
        draft.picName = user?.user_metadata?.full_name || 'Dr. Aisha Khan';
        draft.clinicAddress = '12-G, Block B, Centrio Pantai Hillpark, Jalan Pantai Murni, 59200 Kuala Lumpur';
        draft.clinicEmail = user?.email || 'contact@cityclinickl.com.my';
      }

      draft.supplierSelect = 'Custom';
      draft.supplierName = item.supplier_name || 'Generic Supplier';

      // Estimate order quantity to restock nicely above the threshold
      const orderQty = Math.max(10, item.reorder_level * 2 - item.current_stock_quantity);

      // Try finding unit price from catalog or guess RM 20
      let estimatedUnitPrice = 25.0;
      const cachedCatalog = localStorage.getItem('mediorder_supplier_catalog');
      if (cachedCatalog) {
        try {
          const cat = JSON.parse(cachedCatalog) as any[];
          const match = cat.find(c => c.medicine_name.toLowerCase() === item.medicine_name.toLowerCase());
          if (match && match.unit_price) {
            estimatedUnitPrice = Number(match.unit_price);
          }
        } catch {}
      }

      const newItem = {
        id: Math.random().toString(36).substr(2, 4).toUpperCase(),
        description: item.dosage ? `${item.medicine_name} (${item.dosage})` : item.medicine_name,
        sku: '',
        quantity: orderQty,
        unit: item.unit || 'Box',
        unitPrice: estimatedUnitPrice,
        total: orderQty * estimatedUnitPrice
      };

      let items = draft.items || [];
      if (items.length === 1 && !items[0].description && items[0].unitPrice === 0) {
        items = [newItem];
      } else {
        items.push(newItem);
      }

      draft.items = items;
      localStorage.setItem('mediorder_draft_po', JSON.stringify(draft));

      toast.success(`${item.medicine_name} restocking quantity (${orderQty} ${item.unit || 'Units'}) added to Draft PO!`, {
        description: `Supplier: ${item.supplier_name || 'N/A'}`
      });
      navigate('/create-po', { state: { fromAdd: true } });
    } catch (error) {
      console.error(error);
      toast.error('Could not load purchase order dispatch.');
    }
  };

  // CSV Audit Log
  const downloadCSVReport = () => {
    if (inventory.length === 0) {
      toast.error('No inventory items to export.');
      return;
    }

    const headers = ['Inventory ID', 'Medicine Name', 'Dosage', 'Supplier Name', 'Current Stock Quantity', 'Reorder Level', 'Unit', 'Stock Status', 'Updated At'];
    const rows = inventory.map(m => {
      const status = getCalculatedStatus(m.current_stock_quantity, m.reorder_level);
      return [
        m.id || 'N/A',
        m.medicine_name || '',
        m.dosage || 'N/A',
        m.supplier_name || 'N/A',
        m.current_stock_quantity || 0,
        m.reorder_level || 0,
        m.unit || 'Box',
        status,
        m.updated_at ? new Date(m.updated_at).toLocaleString() : 'N/A'
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `clinic_inventory_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Inventory Audit Log downloaded successfully!');
  };

  const presetSuppliers = ['PharmaDirect Malaysia', 'Medisupply KL Sdn Bhd', 'Global Health Corp', 'Sabah Pharma Distributions'];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 space-y-6">
          <div className="h-12 w-full bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-14 w-full bg-slate-50 rounded-xl animate-pulse" />
          <div className="h-14 w-full bg-slate-50 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ClipboardList className="text-medical-600" size={32} />
            Clinic Inventory Manager
          </h1>
          <p className="text-slate-500 mt-1">Shows medicines owned by the clinic. Automatically calculates stock status and alerts on levels below threshold.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
           onClick={downloadCSVReport}
           className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Layers size={18} />
            Export Audit Log
          </button>
          
          <button 
           onClick={() => setShowAddModal(true)}
           className="px-6 py-3 bg-medical-600 text-white rounded-xl font-bold text-sm hover:bg-medical-700 transition-all flex items-center gap-2 shadow-lg shadow-medical-600/20"
          >
            <Plus size={18} />
            Record New Stock Item
          </button>
        </div>
      </div>

      {/* Overview Analytics Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50/60 border border-emerald-100 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Well Stocked Items</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">
              {inventory.filter(i => getCalculatedStatus(i.current_stock_quantity, i.reorder_level) === 'In Stock').length}
            </p>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <ShieldCheck size={20} />
          </div>
        </div>
        <div className="bg-amber-50/60 border border-amber-100 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Low Stock Items</p>
            <p className="text-2xl font-black text-amber-900 mt-1 animate-pulse">
              {inventory.filter(i => getCalculatedStatus(i.current_stock_quantity, i.reorder_level) === 'Low Stock').length}
            </p>
          </div>
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl animate-pulse">
            <AlertTriangle size={20} />
          </div>
        </div>
        <div className="bg-rose-50/60 border border-rose-100 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Out Of Stock</p>
            <p className="text-2xl font-black text-rose-900 mt-1">
              {inventory.filter(i => getCalculatedStatus(i.current_stock_quantity, i.reorder_level) === 'Out of Stock').length}
            </p>
          </div>
          <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
            <AlertTriangle size={20} className="text-rose-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-sans" size={18} />
            <input 
              type="text" 
              placeholder="Search local clinic stock by medicine name or registered supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-medical-600/20 focus:ring-4 focus:ring-medical-600/5 transition-all outline-none"
            />
         </div>
         <div className="flex gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-48">
               <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-10 pr-10 py-3 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-700 outline-none focus:bg-white transition-all cursor-pointer"
               >
                 <option value="All">All Statuses</option>
                 <option value="In Stock">In Stock</option>
                 <option value="Low Stock">Low Stock</option>
                 <option value="Out of Stock">Out of Stock</option>
               </select>
               <Sliders className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
         </div>
      </div>

      {/* Main Stock Inventory Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-20 text-center space-y-4">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <Database size={32} />
               </div>
               <div className="space-y-1 max-w-md mx-auto">
                 <p className="font-bold text-slate-900 text-lg">No stock records found</p>
                 <p className="text-sm text-slate-500 leading-relaxed">
                   Matches not found. Record new items or adjust filters to explore matches.
                 </p>
               </div>
               <div className="flex justify-center gap-3">
                 <button 
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-2.5 bg-medical-600 hover:bg-medical-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-medical-400/10"
                 >
                   Add New Stock
                 </button>
                 <button 
                  onClick={() => {setSearch(''); setStatusFilter('All');}}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                 >
                   Clear All Filters
                 </button>
               </div>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medicine & Dosage</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supplier</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Unit</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-40">Current Quantity</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-36">Reorder Threshold</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Last Updated</th>
                  <th className="py-4 px-6 w-56 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((item) => {
                  const status = getCalculatedStatus(item.current_stock_quantity, item.reorder_level);
                  const isEditing = editingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-medical-50 flex items-center justify-center text-medical-600">
                             <Database size={16} />
                           </div>
                           <div>
                             <p className="font-bold text-slate-900 leading-tight">{item.medicine_name}</p>
                             <p className="text-xs text-slate-400 font-medium">{item.dosage || 'No dosage specification'}</p>
                           </div>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-2">
                           <Building2 size={13} className="text-slate-400" />
                           {item.supplier_name || 'Generic Supplier'}
                        </div>
                      </td>
                      <td className="py-5 px-4 text-xs font-semibold text-slate-500 text-center">
                        {item.unit || 'Box'}
                      </td>
                      
                      {/* Interactive Edit inputs or normal text representations */}
                      <td className="py-5 px-4 text-center">
                        {isEditing ? (
                          <div className="inline-flex items-center">
                            <input 
                              type="number" 
                              min="0"
                              value={editQty}
                              onChange={(e) => setEditQty(Math.max(0, Number(e.target.value)))}
                              className="w-20 px-2 py-1 text-center bg-slate-50 border border-slate-300 rounded font-bold text-slate-950 focus:ring-2 focus:ring-medical-500 focus:bg-white outline-none"
                            />
                          </div>
                        ) : (
                          <span className="font-black text-slate-900">{item.current_stock_quantity}</span>
                        )}
                      </td>

                      <td className="py-5 px-4 text-center">
                        {isEditing ? (
                          <div className="inline-flex items-center">
                            <input 
                              type="number" 
                              min="0"
                              value={editReorder}
                              onChange={(e) => setEditReorder(Math.max(0, Number(e.target.value)))}
                              className="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-300 rounded font-bold text-slate-950 focus:ring-2 focus:ring-medical-500 focus:bg-white outline-none"
                            />
                          </div>
                        ) : (
                          <span className="font-semibold text-slate-500">{item.reorder_level}</span>
                        )}
                      </td>

                      <td className="py-5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          status === 'In Stock' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          status === 'Low Stock' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {status}
                        </span>
                      </td>

                      <td className="py-5 px-4 text-xs text-slate-400 text-center">
                        <div className="flex items-center justify-center gap-1.5 font-mono text-[10px]">
                          <Calendar size={12} />
                          {item.updated_at ? new Date(item.updated_at).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : 'N/A'}
                        </div>
                      </td>

                      <td className="py-5 px-6 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {isEditing ? (
                            <>
                              <button 
                                onClick={() => saveEdits(item.id)}
                                className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow"
                              >
                                <Save size={13} />
                                Save
                              </button>
                              <button 
                                onClick={cancelEditing}
                                className="p-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs font-bold transition-all"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => startEditing(item)}
                                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-bold transition-all mr-1 hover:bg-slate-50 flex items-center gap-1"
                              >
                                <Edit2 size={12} />
                                Manage
                              </button>
                              
                              {(status === 'Low Stock' || status === 'Out of Stock') && (
                                <button 
                                  onClick={() => handleRestockPO(item)}
                                  className="px-3 py-1.5 bg-medical-50 hover:bg-medical-100 text-medical-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border border-medical-100/50"
                                >
                                  <ShoppingBag size={12} />
                                  Restock PO
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Record Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-medical-600">
                <Database size={22} />
                <h3 className="font-bold text-slate-900 text-lg">Record Owned Medicine Stock</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-400 hover:text-slate-700 transition-all font-sans"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddNewItemSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Medicine Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Paracetamol, Cough Syrup" 
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-medical-600 outline-none rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dosage *</label>
                  <input 
                    type="text"
                    placeholder="e.g. 500mg, 100ml" 
                    value={addDosage}
                    onChange={(e) => setAddDosage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-medical-600 outline-none rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Unit Packaging *</label>
                  <select 
                    value={addUnit}
                    onChange={(e) => setAddUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all cursor-pointer"
                  >
                    <option value="Box">Box</option>
                    <option value="Bottle">Bottle</option>
                    <option value="Pack">Pack</option>
                    <option value="Vial">Vial</option>
                    <option value="Tube">Tube</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Manufacturer Supplier *</label>
                <input 
                  type="text"
                  placeholder="e.g. PharmaDirect Malaysia, Sabah Pharma" 
                  value={addSupplier}
                  onChange={(e) => setAddSupplier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-medical-600 outline-none rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
                  list="supplier-opts"
                />
                <datalist id="supplier-opts">
                  {presetSuppliers.map(p => <option key={p} value={p} />)}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Current Stock Qty *</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 15" 
                    value={addQty}
                    onChange={(e) => setAddQty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-medical-600 outline-none rounded-xl px-4 py-2.5 text-sm font-medium transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reorder Level Warning *</label>
                  <input 
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 10" 
                    value={addReorder}
                    onChange={(e) => setAddReorder(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-medical-600 outline-none rounded-xl px-4 py-2.5 text-sm font-medium transition-all font-sans"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[11px] text-blue-800 leading-snug flex gap-2">
                <Sparkles size={15} className="mt-0.5 text-blue-600 flex-shrink-0 animate-pulse" />
                <span>Notice: Stock Status calculates automatically here. Low stock items will generate dynamic dashboard priority alerts for restocking.</span>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-medical-600 hover:bg-medical-700 transition-all text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-medical-600/10"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Saving Record...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={13} />
                      <span>Record Item</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
