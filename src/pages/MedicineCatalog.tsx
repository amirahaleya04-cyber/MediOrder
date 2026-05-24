import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  ShoppingBag, 
  ChevronDown, 
  AlertTriangle,
  ArrowUpDown,
  Building2,
  Tag,
  X,
  Loader2,
  CheckCircle2,
  Layers,
  Check,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SupplierMedicine } from '../data/defaultData';

export default function MedicineCatalog() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [medicines, setMedicines] = useState<SupplierMedicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Preset fallbacks
  const presetSuppliers = [
    'PharmaDirect Malaysia Sdn Bhd',
    'Sabah Pharma Distributions',
    'MediSupply KL Sdn Bhd',
    'Global Health Corp'
  ];

  const standardCategories = [
    'Pain Relief',
    'Antibiotics',
    'Allergy',
    'Respiratory',
    'Diabetes Care',
    'Medical Supplies',
    'Wound Care',
    'Clinic Consumables'
  ];

  // Filters & Searching
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All Categories');
  const [supplierFilter, setSupplierFilter] = useState('All Suppliers');
  const [availFilter, setAvailFilter] = useState('All');
  const [suppliersList, setSuppliersList] = useState<string[]>(presetSuppliers);

  // Pre-filter supplier selection if navigated from Supplier Network
  useEffect(() => {
    if (location.state?.supplierFilter) {
      setSupplierFilter(location.state.supplierFilter);
    }
  }, [location.state]);

  // Checklist for Bulk PO Creation
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State for Adding Medicine
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newCategory, setNewCategory] = useState('Pain Relief');
  const [newSupplier, setNewSupplier] = useState('PharmaDirect Malaysia Sdn Bhd');
  const [newUnit, setNewUnit] = useState('Box');
  const [newUnitPrice, setNewUnitPrice] = useState('');
  const [newAvailability, setNewAvailability] = useState<string>('Available');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Supplier Medicines & Seed DB if empty
  const fetchMedicines = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        // Try fetching suppliers to populate supplier dropdown correctly
        try {
          const { data: dbSuppliers } = await supabase.from('suppliers').select('name');
          if (dbSuppliers && dbSuppliers.length > 0) {
            const list = Array.from(new Set(dbSuppliers.map((s: any) => s.name).filter(Boolean))) as string[];
            setSuppliersList(list);
          } else {
            // Get active clinic name
            let activeClinic = 'City Clinic KL';
            try {
              const { data: profileRow } = await supabase
                .from('profiles')
                .select('clinic_name')
                .eq('id', user?.id)
                .maybeSingle();
              if (profileRow?.clinic_name) {
                activeClinic = profileRow.clinic_name;
              } else if (user?.user_metadata?.clinic_name) {
                activeClinic = user.user_metadata.clinic_name;
              }
            } catch (err) {
              console.warn('Could not load profile inside medicine seeding:', err);
            }

            // Seed suppliers table
            const presetSuppliersData = [
              { name: 'PharmaDirect Malaysia Sdn Bhd', categories: ['Pain Relief', 'Antibiotics', 'Respiratory'], clinic_name: activeClinic, user_id: user?.id || null },
              { name: 'Sabah Pharma Distributions', categories: ['Allergy', 'Respiratory', 'Diabetes Care'], clinic_name: activeClinic, user_id: user?.id || null },
              { name: 'MediSupply KL Sdn Bhd', categories: ['Medical Supplies', 'Clinic Consumables'], clinic_name: activeClinic, user_id: user?.id || null },
              { name: 'Global Health Corp', categories: ['Wound Care', 'Medical Equipment'], clinic_name: activeClinic, user_id: user?.id || null }
            ];
            await supabase.from('suppliers').insert(presetSuppliersData);
            setSuppliersList(presetSuppliers);
          }
        } catch (e) {
          console.warn('Could not check or seed suppliers:', e);
        }

        const { data, error: fetchErr } = await supabase
          .from('supplier_medicines')
          .select('*')
          .order('medicine_name', { ascending: true });

        if (fetchErr) {
          console.warn('supplier_medicines table failed or empty. Error:', fetchErr.message);
          setMedicines([]);
        } else if (!data || data.length === 0) {
          setMedicines([]);
        } else {
          // Map boolean availability database field to human-readable string values
          const mapped = data.map((m: any) => {
            let availString = 'Available';
            if (m.availability === false || m.availability === 'Temporarily Unavailable') {
              availString = 'Temporarily Unavailable';
            } else if (m.availability === 'Low Availability') {
              availString = 'Low Availability';
            }
            return {
              ...m,
              availability: availString
            };
          });
          setMedicines(mapped);
        }
      } else {
        // Supabase is not configured yet - show empty states
        setMedicines([]);
      }
    } catch (err: any) {
      console.error('Error loading medicines:', err);
      setMedicines([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [user]);

  // Load standard static search and dynamic category fallback options
  const loadedCategories = ['All Categories', ...standardCategories];

  // Dynamic filter lists sorted alphabetically
  const sortedMedicines = [...medicines].sort((a, b) => 
    (a.medicine_name || '').localeCompare(b.medicine_name || '')
  );

  const filtered = sortedMedicines.filter(m => {
    const medName = m.medicine_name || '';
    const medSupplier = m.supplier_name || '';
    const medCat = m.category || '';

    // Search by name, supplier, or category
    const matchesSearch = medName.toLowerCase().includes(search.toLowerCase()) || 
                          medSupplier.toLowerCase().includes(search.toLowerCase()) ||
                          medCat.toLowerCase().includes(search.toLowerCase());
    
    const matchesCat = catFilter === 'All Categories' || medCat === catFilter;
    const matchesSup = supplierFilter === 'All Suppliers' || medSupplier === supplierFilter;
    
    let matchesAvail = true;
    if (availFilter === 'Available') {
      matchesAvail = m.availability === 'Available' || m.availability === true;
    } else if (availFilter === 'Low Availability') {
      matchesAvail = m.availability === 'Low Availability';
    } else if (availFilter === 'Unavailable') {
      matchesAvail = m.availability === 'Temporarily Unavailable' || m.availability === false;
    }
    
    return matchesSearch && matchesCat && matchesSup && matchesAvail;
  });

  // Toggle single item selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle select all visible items
  const handleToggleSelectAll = () => {
    const visibleIds = filtered.map(m => m.id);
    const allVisibleSelected = visibleIds.every(id => selectedIds.includes(id));

    if (allVisibleSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => {
        const union = [...prev];
        visibleIds.forEach(id => {
          if (!union.includes(id)) union.push(id);
        });
        return union;
      });
    }
  };

  // Add individual asset to Active Draft
  const handleAddToPO = (medicine: SupplierMedicine) => {
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
        draft.specialInstructions = 'Please ensure items are delivered before 2:00 PM on weekdays.';
        draft.clinicName = user?.user_metadata?.clinic_name || 'City Clinic Kuala Lumpur';
        draft.picName = user?.user_metadata?.full_name || 'Dr. Aisha Khan';
        draft.clinicAddress = '12-G, Block B, Centrio Pantai Hillpark, Jalan Pantai Murni, 59200 Kuala Lumpur';
        draft.clinicEmail = user?.email || 'contact@cityclinickl.com.my';
      }

      draft.supplierSelect = 'Custom';
      draft.supplierName = medicine.supplier_name || 'Generic Supplier';

      const newItem = {
        id: Math.random().toString(36).substr(2, 4).toUpperCase(),
        description: medicine.dosage ? `${medicine.medicine_name} (${medicine.dosage})` : medicine.medicine_name,
        sku: '',
        quantity: 1,
        unit: medicine.unit || 'Box',
        unitPrice: Number(medicine.unit_price || 0),
        total: Number(medicine.unit_price || 0)
      };

      let items = draft.items || [];
      if (items.length === 1 && !items[0].description && items[0].unitPrice === 0) {
        items = [newItem];
      } else {
        items.push(newItem);
      }

      draft.items = items;
      localStorage.setItem('mediorder_draft_po', JSON.stringify(draft));

      toast.success(`${medicine.medicine_name} prefilled in Draft Purchase Order!`, {
        description: `Supplier: ${medicine.supplier_name || 'N/A'} • RM ${Number(medicine.unit_price || 0).toFixed(2)}`
      });
      navigate('/create-po', { state: { fromAdd: true } });
    } catch (err) {
      console.error(err);
      toast.error('Could not load purchase order.');
    }
  };

  // Bulk Create PO from checkboxes
  const handleBulkCreatePO = () => {
    if (selectedIds.length === 0) {
      return;
    }

    const selectedMeds = medicines.filter(m => selectedIds.includes(m.id));
    if (selectedMeds.length === 0) {
      toast.error('Selected medicines could not be mapped.');
      return;
    }

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
        draft.specialInstructions = 'Please ensure items are delivered before 2:00 PM on weekdays.';
        draft.clinicName = user?.user_metadata?.clinic_name || 'City Clinic Kuala Lumpur';
        draft.picName = user?.user_metadata?.full_name || 'Dr. Aisha Khan';
        draft.clinicAddress = '12-G, Block B, Centrio Pantai Hillpark, Jalan Pantai Murni, 59200 Kuala Lumpur';
        draft.clinicEmail = user?.email || 'contact@cityclinickl.com.my';
      }

      draft.supplierSelect = 'Custom';
      draft.supplierName = selectedMeds[0]?.supplier_name || 'Multiple Suppliers';

      let items = draft.items || [];
      if (items.length === 1 && !items[0].description && items[0].unitPrice === 0) {
        items = [];
      }

      selectedMeds.forEach(m => {
        items.push({
          id: Math.random().toString(36).substr(2, 4).toUpperCase(),
          description: m.dosage ? `${m.medicine_name} (${m.dosage})` : m.medicine_name,
          sku: '',
          quantity: 1,
          unit: m.unit || 'Box',
          unitPrice: Number(m.unit_price || 0),
          total: Number(m.unit_price || 0)
        });
      });

      draft.items = items;
      localStorage.setItem('mediorder_draft_po', JSON.stringify(draft));

      toast.success(`Successfully prefilled ${selectedMeds.length} items into Draft PO!`);
      navigate('/create-po', { state: { fromAdd: true } });
    } catch (err) {
      console.error(err);
      toast.error('Bulk order initialization failed.');
    }
  };

  // CSV Audit Export
  const handleExportCatalogCSV = () => {
    if (medicines.length === 0) {
      toast.error('No supplier catalog items to export.');
      return;
    }

    const headers = ['ID', 'Medicine Name', 'Dosage', 'Category', 'Supplier', 'Unit', 'Unit Price (RM)', 'Availability'];
    const rows = medicines.map(m => [
      m.id || 'N/A',
      m.medicine_name || '',
      m.dosage || 'N/A',
      m.category || 'General',
      m.supplier_name || 'N/A',
      m.unit || 'Box',
      `RM ${Number(m.unit_price || 0).toFixed(2)}`,
      m.availability ? 'Available' : 'Unavailable'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mediorder_supplier_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Supplier Catalog downloaded successfully!');
  };

  // Submit Modal
  const handleAddMedicineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Please enter a medicine name.');
      return;
    }
    if (!newSupplier.trim()) {
      toast.error('Please specify a supplier.');
      return;
    }

    setIsSaving(true);
    try {
      const unitPriceInput = Number(newUnitPrice || 0);

      if (isSupabaseConfigured && supabase) {
        // Try to get authenticated user if available
        let currentUserId = user?.id || null;
        try {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            currentUserId = authData.user.id;
          }
        } catch (e) {
          console.warn('Could not get actual auth user:', e);
        }

        // Help resolve supplier_id from the suppliers table if possible
        let resolvedSupplierId: string | null = null;
        try {
          const { data: matchedSupplier } = await supabase
            .from('suppliers')
            .select('id')
            .eq('name', newSupplier)
            .maybeSingle();
          if (matchedSupplier?.id) {
            resolvedSupplierId = matchedSupplier.id;
          }
        } catch (supplierLookupErr) {
          console.warn('Could not lookup supplier id:', supplierLookupErr);
        }

        // Map availability string state to database boolean
        const dbAvailability = newAvailability !== 'Temporarily Unavailable';
        const { error: insertErr } = await supabase
          .from('supplier_medicines')
          .insert([{
            user_id: currentUserId,
            supplier_id: resolvedSupplierId,
            supplier_name: newSupplier,
            medicine_name: newName,
            dosage: newDosage,
            category: newCategory || 'Pain Relief',
            unit: newUnit,
            unit_price: unitPriceInput,
            availability: dbAvailability,
            description: ''
          }]);

        if (insertErr) {
          throw insertErr;
        }
        toast.success(`Registered ${newName} successfully in database!`);
      } else {
        // Localstorage fallback
        const savedMedsJson = localStorage.getItem('mediorder_supplier_catalog');
        const medsList = savedMedsJson ? JSON.parse(savedMedsJson) : [];
        const newRecord: SupplierMedicine = {
          id: `SC-MED-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          medicine_name: newName,
          dosage: newDosage,
          category: newCategory || 'Pain Relief',
          supplier_name: newSupplier,
          unit: newUnit,
          unit_price: unitPriceInput,
          availability: newAvailability
        };
        const updated = [newRecord, ...medsList];
        localStorage.setItem('mediorder_supplier_catalog', JSON.stringify(updated));
        toast.success(`Registered ${newName} locally in Supplier Catalog.`);
      }

      // Reset form & state
      setNewName('');
      setNewDosage('');
      setNewCategory('Pain Relief');
      setNewSupplier('PharmaDirect Malaysia Sdn Bhd');
      setNewUnit('Box');
      setNewUnitPrice('');
      setNewAvailability('Available');
      setShowAddModal(false);

      // Reload
      fetchMedicines();
    } catch (err: any) {
      console.error('Error saving supplier medicine:', err);
      const exactMsg = err?.message || JSON.stringify(err);
      const codeInfo = err?.code ? ` [Code: ${err.code}]` : '';
      const detailsInfo = err?.details ? ` - Details: ${err.details}` : '';
      toast.error(`Supabase Save Error: ${exactMsg}${codeInfo}${detailsInfo}`);
    } finally {
      setIsSaving(false);
    }
  };

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

  const allVisibleSelected = filtered.length > 0 && filtered.every(m => selectedIds.includes(m.id));

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">MediOrder Supplier Catalog</h1>
          <p className="text-slate-500 mt-1">Shows medicines supplied by suppliers. Pre-fill purchase orders directly from the catalog database.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
           onClick={handleExportCatalogCSV}
           className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Layers size={18} />
            Export Catalog
          </button>
          
          {/* Add Medicine Trigger Button */}
          <button 
           onClick={() => setShowAddModal(true)}
           className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <Plus size={18} />
            Add Supplier Product
          </button>

          {/* Bulk Create PO Button */}
          <button 
            disabled={selectedIds.length === 0}
            onClick={handleBulkCreatePO}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg ${
              selectedIds.length === 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
              : 'bg-medical-600 text-white hover:bg-medical-700 shadow-medical-600/20'
            }`}
          >
            <ShoppingBag size={18} />
            Add Selected to PO {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-sans" size={18} />
            <input 
              type="text" 
              placeholder="Search by medicine name, supplier, or category catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-medical-600/20 focus:ring-4 focus:ring-medical-600/5 transition-all outline-none font-sans"
            />
         </div>
         <div className="flex gap-4 w-full lg:w-auto flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 lg:w-48">
               <select 
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="w-full appearance-none pl-10 pr-10 py-3 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-700 outline-none focus:bg-white transition-all cursor-pointer"
               >
                 {loadedCategories.map(c => <option key={c}>{c}</option>)}
               </select>
               <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            <div className="relative flex-1 lg:w-48">
               <select 
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="w-full appearance-none pl-10 pr-10 py-3 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-700 outline-none focus:bg-white transition-all cursor-pointer truncate"
               >
                 <option value="All Suppliers">All Suppliers</option>
                 {suppliersList.map(sup => (
                   <option key={sup} value={sup}>{sup}</option>
                 ))}
               </select>
               <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            <div className="relative flex-1 lg:w-48">
               <select 
                value={availFilter}
                onChange={(e) => setAvailFilter(e.target.value)}
                className="w-full appearance-none pl-10 pr-10 py-3 bg-slate-50 border border-transparent rounded-xl text-sm font-semibold text-slate-700 outline-none focus:bg-white transition-all cursor-pointer"
               >
                 <option value="All">All Availability</option>
                 <option value="Available">Available</option>
                 <option value="Low Availability">Low Availability</option>
                 <option value="Unavailable">Temporarily Unavailable</option>
               </select>
               <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
         </div>
      </div>

      {selectedIds.length > 0 && (
         <div className="p-3.5 bg-medical-50/70 border border-medical-100 rounded-xl flex items-center justify-between text-xs font-bold text-medical-800">
            <div className="flex items-center gap-2">
              <ShoppingBag size={14} className="text-medical-600 animate-bounce" />
              <span>{selectedIds.length} medicines selected. Click "Add Selected to PO" above to prefill them directly in your Draft Purchase Order.</span>
            </div>
            <button 
              onClick={() => setSelectedIds([])}
              className="text-[10px] text-slate-500 hover:text-slate-950 underline mr-2"
            >
              Clear Selection
            </button>
         </div>
      )}

      {/* Product List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-20 text-center space-y-4">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <Package size={32} />
               </div>
               <div className="space-y-1 max-w-md mx-auto">
                 <p className="font-bold text-slate-900 text-lg">No medicines found</p>
                 <p className="text-sm text-slate-500 leading-relaxed">
                   Try resetting your search filter options, or add a brand new supplier product to the catalog.
                 </p>
               </div>
               <div className="flex justify-center gap-3">
                 <button 
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-400/10"
                 >
                   Add New Supplier Medicine
                 </button>
                 <button 
                  onClick={() => {setSearch(''); setCatFilter('All Categories'); setSupplierFilter('All Suppliers'); setAvailFilter('All');}}
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
                  <th className="py-4 px-6 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-medical-600 focus:ring-medical-500 w-4 h-4 cursor-pointer align-middle"
                      checked={allVisibleSelected}
                      onChange={handleToggleSelectAll}
                    />
                  </th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     <div className="flex items-center gap-1">
                        Product Details
                     </div>
                  </th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supplier</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing (RM)</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Availability</th>
                  <th className="py-4 px-8 w-40"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((m) => {
                  const isChecked = selectedIds.includes(m.id);

                  return (
                    <tr key={m.id} className={`hover:bg-slate-50/30 transition-colors group ${isChecked ? 'bg-medical-50/20' : ''}`}>
                      <td className="py-5 px-6 text-center">
                        <input 
                           type="checkbox" 
                           className="rounded border-slate-300 text-medical-600 focus:ring-medical-500 w-4 h-4 cursor-pointer"
                           checked={isChecked}
                           onChange={() => handleToggleSelect(m.id)}
                        />
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-medical-50 flex items-center justify-center text-medical-600 group-hover:scale-110 transition-transform">
                             <Package size={20} />
                           </div>
                           <div>
                             <p className="font-bold text-slate-900">{m.medicine_name}</p>
                             <p className="text-xs text-slate-500">{m.dosage || 'No Dosage'} • {m.unit || 'Unit'}</p>
                           </div>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                         <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                           {m.category || 'General'}
                         </span>
                      </td>
                      <td className="py-5 px-4 text-xs font-medium text-slate-700">
                        <div className="flex items-center gap-2">
                           <Building2 size={14} className="text-slate-400" />
                           {m.supplier_name || 'N/A'}
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <p className="text-sm font-bold text-slate-900">RM {Number(m.unit_price || 0).toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Per {m.unit || 'Unit'}</p>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            (m.availability === 'Available' || m.availability === true)
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : (m.availability === 'Low Availability')
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            {(m.availability === 'Available' || m.availability === true) ? 'Available' :
                             (m.availability === 'Low Availability') ? 'Low Availability' :
                             'Temporarily Unavailable'}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button 
                            disabled={m.availability === 'Temporarily Unavailable' || m.availability === false}
                            onClick={() => handleAddToPO(m)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                              (m.availability !== 'Temporarily Unavailable' && m.availability !== false)
                              ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 cursor-pointer' 
                              : 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed'
                            }`}
                          >
                            Add to PO
                          </button>
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

      {/* Modal Layout for Adding Medicine */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-medical-600">
                <Package size={22} />
                <h3 className="font-bold text-slate-900 text-lg">Add Supplier Catalog Product</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-400 hover:text-slate-700 transition-all font-sans"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMedicineSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Medicine Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Paracetamol, Amoxicillin" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-medical-600 focus:ring-4 focus:ring-medical-600/5 outline-none rounded-xl px-4.5 py-3 text-sm font-medium transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dosage *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 500mg, 10ml, 50mcg" 
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-medical-600 outline-none rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category *</label>
                  <select 
                    required
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-medical-600 outline-none rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
                  >
                    {standardCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Supplier / Manufacturer *</label>
                <select 
                  required
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-medical-600 outline-none rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
                >
                  {suppliersList.map(sup => (
                    <option key={sup} value={sup}>{sup}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Unit *</label>
                  <select 
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all cursor-pointer"
                  >
                    <option value="Box">Box</option>
                    <option value="Bottle">Bottle</option>
                    <option value="Strip">Strip</option>
                    <option value="Vial">Vial</option>
                    <option value="Sachet">Sachet</option>
                    <option value="Unit">Unit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Unit Price (RM) *</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 24.50" 
                    value={newUnitPrice}
                    onChange={(e) => setNewUnitPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-medical-600 outline-none rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Availability Status</label>
                <div className="mt-2 flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                    <input 
                      type="radio"
                      name="newAvailability"
                      checked={newAvailability === 'Available'}
                      onChange={() => setNewAvailability('Available')}
                      className="text-medical-600 focus:ring-medical-500 cursor-pointer"
                    />
                    Available
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                    <input 
                      type="radio"
                      name="newAvailability"
                      checked={newAvailability === 'Low Availability'}
                      onChange={() => setNewAvailability('Low Availability')}
                      className="text-medical-600 focus:ring-medical-500 cursor-pointer"
                    />
                    Low Availability
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                    <input 
                      type="radio"
                      name="newAvailability"
                      checked={newAvailability === 'Temporarily Unavailable'}
                      onChange={() => setNewAvailability('Temporarily Unavailable')}
                      className="text-medical-600 focus:ring-medical-500 cursor-pointer"
                    />
                    Temporarily Unavailable
                  </label>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[11px] text-blue-800 leading-snug flex gap-2">
                <AlertCircle size={15} className="mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Notice: Creating a product here registers it globally in the supplier listing directory. Clinics do not track stock directly inside this catalogue.</span>
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
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={13} />
                      <span>Add Product</span>
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
