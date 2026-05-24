import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  FileCheck, 
  Building2, 
  Info,
  Calendar,
  ChevronRight,
  Package,
  Mail,
  Phone,
  MapPin,
  User,
  Hash,
  CreditCard,
  FileText
} from 'lucide-react';
import { POItem } from '../types';
import { useAuth } from '../context/AuthContext';

export default function CreateOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  // Initialize draft helper from localStorage if any
  const [draft] = useState(() => {
    // Check if we specifically navigated here from "Add to PO" / "Restock"
    if (location.state?.fromAdd) {
      const saved = localStorage.getItem('mediorder_draft_po');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing draft:', e);
        }
      }
    } else {
      // Clear draft PO from localStorage if starting a new PO
      localStorage.removeItem('mediorder_draft_po');
    }
    return null;
  });

  // State elements
  const [clinicName, setClinicName] = useState(() => draft?.clinicName || user?.user_metadata?.clinic_name || 'City Clinic Kuala Lumpur');
  const [picName, setPicName] = useState(() => draft?.picName || user?.user_metadata?.full_name || 'Dr. Aisha Khan');
  const [clinicAddress, setClinicAddress] = useState(() => draft?.clinicAddress || '12-G, Block B, Centrio Pantai Hillpark, Jalan Pantai Murni, 59200 Kuala Lumpur');
  const [clinicEmail, setClinicEmail] = useState(() => draft?.clinicEmail || user?.email || 'contact@cityclinickl.com.my');

  const [supplierSelect, setSupplierSelect] = useState(() => draft?.supplierSelect || 'PharmaDirect');
  const [supplierName, setSupplierName] = useState(() => draft?.supplierName || 'PharmaDirect Malaysia Sdn Bhd');
  const [supplierContact, setSupplierContact] = useState(() => draft?.supplierContact || '+60 3-8890 1234');
  const [supplierAddress, setSupplierAddress] = useState(() => draft?.supplierAddress || 'Distribution Hub North, Lot 8, Industrial Estate Phase 3, 81100 Johor Bahru, Johor');
  const [supplierEmail, setSupplierEmail] = useState(() => draft?.supplierEmail || 'orders@pharmadirect.my');

  const [poNumber, setPoNumber] = useState(() => draft?.poNumber || `PO-2026-${Math.random().toString(36).substr(2, 4).toUpperCase()}`);
  const [orderDate, setOrderDate] = useState(() => draft?.orderDate || new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(() => draft?.expectedDeliveryDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState(() => draft?.paymentTerms || 'Net 30');
  const [specialInstructions, setSpecialInstructions] = useState(() => draft?.specialInstructions || 'Please ensure items are delivered before 2:00 PM on weekdays.');

  const [items, setItems] = useState<POItem[]>(() => draft?.items || []);

  // Synchronize clinic defaults if authenticated user becomes available later and there is no active draft
  useEffect(() => {
    if (user && !draft) {
      if (user.user_metadata?.clinic_name) {
        setClinicName(user.user_metadata.clinic_name);
      }
      if (user.user_metadata?.full_name) {
        setPicName(user.user_metadata.full_name);
      }
      if (user.email) {
        setClinicEmail(user.email);
      }
    }
  }, [user, draft]);

  // Auto-sync form changes into localStorage draft
  useEffect(() => {
    const draftData = {
      clinicName,
      picName,
      clinicAddress,
      clinicEmail,
      supplierSelect,
      supplierName,
      supplierContact,
      supplierAddress,
      supplierEmail,
      items,
      poNumber,
      orderDate,
      expectedDeliveryDate,
      paymentTerms,
      specialInstructions
    };
    localStorage.setItem('mediorder_draft_po', JSON.stringify(draftData));
  }, [
    clinicName,
    picName,
    clinicAddress,
    clinicEmail,
    supplierSelect,
    supplierName,
    supplierContact,
    supplierAddress,
    supplierEmail,
    items,
    poNumber,
    orderDate,
    expectedDeliveryDate,
    paymentTerms,
    specialInstructions
  ]);

  const handleSupplierChange = (val: string) => {
    setSupplierSelect(val);
    if (val === 'PharmaDirect') {
      setSupplierName('PharmaDirect Malaysia Sdn Bhd');
      setSupplierContact('+60 3-8890 1234');
      setSupplierAddress('Distribution Hub North, Lot 8, Industrial Estate Phase 3, 81100 Johor Bahru, Johor');
      setSupplierEmail('orders@pharmadirect.my');
    } else if (val === 'Medisupply') {
      setSupplierName('Medisupply KL Sdn Bhd');
      setSupplierContact('+60 3-7956 4531');
      setSupplierAddress('Level 3, Block C, Wisma Consplant, Jalan SS 16/1, 47500 Subang Jaya, Selangor');
      setSupplierEmail('procurement@medisupplykl.com');
    } else if (val === 'Global Health') {
      setSupplierName('Global Health Corp');
      setSupplierContact('+60 3-2161 8847');
      setSupplierAddress('Plaza Mont Kiara, 2 Jalan Kiara, Mont Kiara, 50480 Kuala Lumpur');
      setSupplierEmail('sales@globalhealth.com');
    }
  };

  const addItem = () => {
    const newItem: POItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      sku: '',
      quantity: 1,
      unit: 'Box',
      unitPrice: 0,
      total: 0
    };
    setItems([...items, newItem]);
    toast.success('New item row added');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast.info('Item removed');
  };

  const handleClearDraft = () => {
    localStorage.removeItem('mediorder_draft_po');
    setItems([]);
    toast.success('Draft PO data cleared from localStorage and all items removed!');
  };

  const handleResetForm = () => {
    localStorage.removeItem('mediorder_draft_po');
    setItems([]);
    
    // Reset/clear form fields
    setClinicName('');
    setPicName('');
    setClinicAddress('');
    setClinicEmail('');
    
    setSupplierSelect('Custom');
    setSupplierName('');
    setSupplierContact('');
    setSupplierAddress('');
    setSupplierEmail('');
    
    setPoNumber(`PO-2026-${Math.random().toString(36).substr(2, 4).toUpperCase()}`);
    setOrderDate(new Date().toISOString().split('T')[0]);
    setExpectedDeliveryDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setPaymentTerms('');
    setSpecialInstructions('');
    
    toast.success('Form reset completely! All fields and item rows have been cleared.');
  };

  const updateItem = (id: string, field: keyof POItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.05; // 5% example tax
  const total = subtotal + tax;

  const handleNext = () => {
    if (step === 1) {
      if (!clinicName.trim() || !supplierName.trim()) {
        toast.warning('Please complete clinic and supplier details before proceeding.');
        return;
      }
      toast.success('Supplier and clinic details verified');
    } else if (step === 2) {
      if (items.length === 0) {
        toast.warning('Please add at least one item to your Purchase Order.');
        return;
      }
      const hasEmptyItems = items.some(i => !i.description.trim() || i.quantity <= 0 || i.unitPrice <= 0);
      if (hasEmptyItems) {
        toast.warning('Please complete all details (Description, Qty, Price) for items.');
        return;
      }
      toast.success('Items verified successfully');
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
    // Force save before transition
    const draftData = {
      clinicName,
      picName,
      clinicAddress,
      clinicEmail,
      supplierSelect,
      supplierName,
      supplierContact,
      supplierAddress,
      supplierEmail,
      items,
      poNumber,
      orderDate,
      expectedDeliveryDate,
      paymentTerms,
      specialInstructions,
      subtotal,
      tax,
      total
    };
    localStorage.setItem('mediorder_draft_po', JSON.stringify(draftData));
    toast.success('Purchase Order generated! Taking you to preview...');
    setTimeout(() => navigate('/po-preview'), 1000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-medical-600 transition-colors mb-6 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-semibold text-sm">Back to Dashboard</span>
      </button>

      {/* Draft Utilities Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Info size={16} className="text-medical-600" />
          <span>Active Session PO Number: <strong className="font-mono text-medical-700">{poNumber}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearDraft}
            id="clear-draft-btn"
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-750 font-bold text-xs rounded-xl transition-all border border-red-200"
          >
            Clear Draft
          </button>
          <button
            onClick={handleResetForm}
            id="reset-form-btn"
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl transition-all"
          >
            Reset Form
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create MediOrder PO</h1>
          <p className="text-slate-500 mt-1">Draft a new request for medical supplies.</p>
        </div>
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === s ? 'bg-medical-600 text-white' : 
                step > s ? 'bg-medical-50 text-medical-600' : 'bg-slate-100 text-slate-400'
              }`}>
                {step > s ? <FileCheck size={16} /> : s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 mx-2 ${step > s ? 'bg-medical-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* From / Clinic Details Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 text-medical-600 border-b border-slate-100 pb-3">
                    <Building2 size={22} />
                    <h3 className="font-bold text-slate-800 text-lg">FROM: Clinic & PO Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Clinic Name</label>
                      <div className="relative">
                        <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          value={clinicName} 
                          onChange={(e) => setClinicName(e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all font-medium"
                          placeholder="My Clinic Name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Person In Charge (PIC)</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          value={picName} 
                          onChange={(e) => setPicName(e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all font-medium"
                          placeholder="Dr. Aisha Khan"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Clinic Address</label>
                      <div className="relative flex items-start">
                        <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <textarea 
                          rows={2}
                          value={clinicAddress} 
                          onChange={(e) => setClinicAddress(e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all font-medium"
                          placeholder="12-G, Block B, Centrio Pantai Hillpark..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Clinic Email</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="email"
                          value={clinicEmail} 
                          onChange={(e) => setClinicEmail(e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all font-medium"
                          placeholder="clinic@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">PO Number</label>
                      <div className="relative">
                        <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          value={poNumber} 
                          onChange={(e) => setPoNumber(e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all font-mono font-bold text-medical-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Order Date</label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="date"
                          value={orderDate} 
                          onChange={(e) => setOrderDate(e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Payment Terms</label>
                      <div className="relative">
                        <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          value={paymentTerms} 
                          onChange={(e) => setPaymentTerms(e.target.value)} 
                          placeholder="e.g. Net 30, COD"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* TO / Supplier Details Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 text-medical-600 border-b border-slate-100 pb-3">
                    <Building2 size={22} />
                    <h3 className="font-bold text-slate-800 text-lg">TO: Supplier Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Preset Supplier</label>
                      <select 
                        value={supplierSelect}
                        onChange={(e) => handleSupplierChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all font-medium"
                      >
                        <option value="PharmaDirect">PharmaDirect Malaysia (Preferred)</option>
                        <option value="Medisupply">Medisupply KL</option>
                        <option value="Global Health">Global Health Corp</option>
                        <option value="Custom">Custom Supplier</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Supplier Name</label>
                        <input 
                          value={supplierName} 
                          onChange={(e) => setSupplierName(e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all font-medium"
                          placeholder="Supplier Company Name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Supplier Contact Phone</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            value={supplierContact} 
                            onChange={(e) => setSupplierContact(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all font-medium"
                            placeholder="+60 3-XXXX XXXX"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Supplier Email</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="email"
                            value={supplierEmail} 
                            onChange={(e) => setSupplierEmail(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all font-medium"
                            placeholder="supplier@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expected Delivery Date</label>
                        <div className="relative">
                          <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="date"
                            value={expectedDeliveryDate} 
                            onChange={(e) => setExpectedDeliveryDate(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Supplier Address</label>
                        <div className="relative flex items-start">
                          <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <textarea 
                            rows={2}
                            value={supplierAddress} 
                            onChange={(e) => setSupplierAddress(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all font-medium"
                            placeholder="Distribution Hub North, Lot 8..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Instructions Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 text-medical-600 border-b border-slate-100 pb-3">
                    <FileText size={22} />
                    <h3 className="font-bold text-slate-800 text-lg">Special Instructions</h3>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Instructions / Notes for Delivery</label>
                    <textarea 
                      rows={2}
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g. Please ensure items are delivered before 2:00 PM..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all font-medium"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-3 text-medical-600">
                    <Package size={24} />
                    <h2 className="text-xl font-bold">Itemized Order</h2>
                  </div>
                  <button 
                    onClick={addItem}
                    className="flex items-center gap-2 text-medical-600 hover:text-medical-700 font-bold text-sm bg-medical-50 px-4 py-2 rounded-xl transition-all"
                  >
                    <Plus size={18} /> Add Item
                  </button>
                </div>
                
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 relative group">
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="absolute -top-2 -right-2 p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 md:col-span-4">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Product Description</label>
                          <input 
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            placeholder="e.g. Paracetamol 500mg" 
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600" 
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Qty</label>
                          <input 
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 font-mono" 
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Unit</label>
                          <select 
                            value={item.unit}
                            onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 font-medium"
                          >
                            <option value="Box">Box</option>
                            <option value="Vial">Vial</option>
                            <option value="Ampoule">Ampoule</option>
                            <option value="Tablet">Tablet</option>
                            <option value="Pack">Pack</option>
                            <option value="Bottle">Bottle</option>
                            <option value="Unit">Unit</option>
                          </select>
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Unit Price (RM)</label>
                          <input 
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', Math.max(0, Number(e.target.value)))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 font-mono" 
                          />
                          <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                            Price for one selected unit (e.g. 1 Box = RM25.00)
                          </p>
                        </div>
                        <div className="col-span-12 md:col-span-2 font-mono">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total</label>
                          <div className="w-full bg-slate-200/30 border border-transparent rounded-lg px-3 py-2 text-sm font-bold text-slate-700">
                            RM {item.total.toFixed(2)}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                            Quantity × Unit Price: {item.quantity} × RM{item.unitPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-medical-50 text-medical-600 flex items-center justify-center mx-auto mb-6">
                  <FileCheck size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Ready to Send?</h2>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Please review all items and supplier details before final submission. Approved orders will be sent immediately to the supplier.
                </p>
                <div className="pt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Items</p>
                    <p className="text-xl font-bold text-slate-900">{items.length}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Value</p>
                    <p className="text-xl font-bold text-medical-600">RM {total.toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between pt-6">
            <button 
              onClick={handleBack}
              disabled={step === 1}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                step === 1 ? 'text-slate-300 pointer-events-none' : 'text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Previous Step
            </button>
            <button 
              onClick={step === 3 ? handleSubmit : handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-medical-600 text-white rounded-xl font-bold text-sm hover:bg-medical-700 transition-all shadow-lg shadow-medical-600/25"
            >
              {step === 3 ? 'Generate Preview' : 'Next Step'} <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Live Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl sticky top-24">
            <h3 className="font-bold border-b border-white/10 pb-4 mb-6">Order Summary</h3>
            <div className="space-y-4 font-sans">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono">RM {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Tax (5% SST)</span>
                <span className="font-mono">RM {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Surcharge</span>
                <span className="font-mono text-emerald-400">FREE</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold">Grand Total</p>
                  <p className="text-2xl font-bold font-mono text-white">RM {total.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 text-xs">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 font-mono">Notice</p>
              <p className="text-slate-300 leading-relaxed italic">
                Prices include federal medical supply handling fees where applicable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
