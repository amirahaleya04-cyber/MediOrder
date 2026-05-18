import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Package
} from 'lucide-react';
import { POItem } from '../types';

export default function CreateOrder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [items, setItems] = useState<POItem[]>([
    { id: '1', description: '', sku: '', quantity: 1, unit: 'Box', unitPrice: 0, total: 0 }
  ]);

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
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
      toast.info('Item removed');
    } else {
      toast.error('Order must have at least one item');
    }
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
      toast.success('Supplier details saved');
    } else if (step === 2) {
      const hasEmptyItems = items.some(i => !i.description.trim() || i.total === 0);
      if (hasEmptyItems) {
        toast.warning('Please complete all item details before proceeding');
        return;
      }
      toast.success('Items verified successfully');
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);
  const handleSubmit = () => {
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
                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center gap-3 text-medical-600 border-b border-slate-100 pb-4 mb-4">
                  <Building2 size={24} />
                  <h2 className="text-xl font-bold">Supplier Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                      Select Supplier
                      <Info size={14} className="text-slate-400" />
                    </label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all">
                      <option>PharmaDirect Malaysia (Preferred)</option>
                      <option>Medisupply KL</option>
                      <option>Global Health Corp</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expected Delivery</label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Order Priority</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all">
                        <option>Standard (3-5 Days)</option>
                        <option>Urgent (24 Hours)</option>
                        <option>Scheduled Monthly</option>
                      </select>
                    </div>
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
                    <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative group">
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="absolute -top-2 -right-2 p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-5">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Product Description</label>
                          <input 
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            placeholder="e.g. Paracetamol 500mg" 
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600" 
                          />
                        </div>
                        <div className="col-span-6 md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Qty</label>
                          <input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600" 
                          />
                        </div>
                        <div className="col-span-6 md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">RM/Unit</label>
                          <input 
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600" 
                          />
                        </div>
                        <div className="col-span-12 md:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total</label>
                          <div className="w-full bg-slate-200/30 rounded-lg px-3 py-2 text-sm font-bold text-slate-700">
                            RM {item.total.toFixed(2)}
                          </div>
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
            <div className="space-y-4">
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
                  <p className="text-2xl font-bold">RM {total.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Notice</p>
              <p className="text-xs text-slate-300 leading-relaxed italic italic">
                Prices include federal medical supply handling fees where applicable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
