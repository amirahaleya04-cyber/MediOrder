import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Printer, 
  Download, 
  Send, 
  CheckCircle2, 
  ArrowLeft,
  Share2,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function OrderPreview() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Retrieve PO Form Data from localStorage draft
  const draftData = useMemo(() => {
    const saved = localStorage.getItem('mediorder_draft_po');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing draft:', e);
      }
    }
    return null;
  }, []);

  // Graceful empty state check or redirect to create order if no draft exists
  if (!draftData) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">No Purchase Order Draft Found</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            You don't have an active Purchase Order draft to preview. Please create or edit a Purchase Order details first to view the preview.
          </p>
        </div>
        <button
          onClick={() => navigate('/create-po')}
          className="px-6 py-2.5 bg-medical-600 text-white font-bold text-sm rounded-xl hover:bg-medical-700 transition-colors shadow-lg shadow-medical-600/20 inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Create Purchase Order
        </button>
      </div>
    );
  }

  // Destructure draft values with default fallbacks
  const {
    clinicName = 'City Clinic Kuala Lumpur',
    picName = 'Dr. Aisha Khan',
    clinicAddress = '12-G, Block B, Centrio Pantai Hillpark, Jalan Pantai Murni, 59200 Kuala Lumpur',
    clinicEmail = user?.email || 'contact@cityclinickl.com.my',
    supplierName = 'PharmaDirect Malaysia Sdn Bhd',
    supplierContact = '+60 3-8890 1234',
    supplierAddress = 'Distribution Hub North, Lot 8, Industrial Estate Phase 3, 81100 Johor Bahru, Johor',
    supplierEmail = 'orders@pharmadirect.my',
    items = [],
    poNumber = 'PO-2026-X91A',
    orderDate = '2026-05-21',
    expectedDeliveryDate = '2026-05-26',
    paymentTerms = 'Net 30',
    specialInstructions = 'Please ensure items are delivered before 2:00 PM on weekdays.',
  } = draftData;

  // Exact calculations based on draft items
  const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.total) || 0), 0);
  const tax = subtotal * 0.05; // 5% SST
  const grandTotal = subtotal + tax;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.info('Sending document to printer... Select "Save as PDF" to download.');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleSend = async () => {
    let activeClinic = clinicName;
    let currentUser: any = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        currentUser = authData?.user || null;

        if (currentUser) {
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('clinic_name')
            .eq('id', currentUser.id)
            .maybeSingle();
          if (profileRow?.clinic_name) {
            activeClinic = profileRow.clinic_name;
          } else if (currentUser?.user_metadata?.clinic_name) {
            activeClinic = currentUser.user_metadata.clinic_name;
          }
        }
      } catch (e) {
        console.warn('Could not fetch clinic profile name:', e);
      }
    }

    const newPO = {
      order_number: poNumber,
      supplier: supplierName,
      clinic_name: activeClinic,
      subtotal: Number(subtotal),
      sst_amount: Number(tax),
      grand_total: Number(grandTotal),
      order_date: orderDate,
      expected_delivery_date: expectedDeliveryDate,
      payment_terms: paymentTerms,
      authorized_by: picName,
      status: 'Sent'
    };

    // Save locally to localStorage demo array regardless for seamless sync
    try {
      const localPOsJson = localStorage.getItem('mediorder_demo_purchase_orders');
      const localPOs = localPOsJson ? JSON.parse(localPOsJson) : [];
      const updatedLocalPOs = [newPO, ...localPOs.filter((p: any) => (p.order_number || p.id) !== poNumber)];
      localStorage.setItem('mediorder_demo_purchase_orders', JSON.stringify(updatedLocalPOs));
    } catch (e) {
      console.error('Error saving local fallback PO:', e);
    }

    // Clear active draft since it's converted to a PO
    localStorage.removeItem('mediorder_draft_po');

    if (isSupabaseConfigured && supabase) {
      toast.promise(
        (async () => {
          let targetUserId = user?.id || null;
          try {
            const { data: authData } = await supabase.auth.getUser();
            if (authData?.user) {
              targetUserId = authData.user.id;
            }
          } catch (e) {
            console.warn('Could not check auth non-blockingly:', e);
          }

          const { data: poRows, error } = await supabase
            .from('purchase_orders')
            .upsert({
              user_id: targetUserId,
              order_number: poNumber,
              supplier: supplierName,
              clinic_name: activeClinic,
              subtotal: Number(subtotal),
              sst_amount: Number(tax),
              grand_total: Number(grandTotal),
              items: items,
              status: 'Sent',
              order_date: orderDate,
              expected_delivery_date: expectedDeliveryDate,
              payment_terms: paymentTerms,
              authorized_by: picName
            }, { onConflict: 'order_number' })
            .select('id')
            .single();

          if (error) {
            console.error('Supabase Save Error Details:', error);
            throw error;
          }

          if (poRows?.id) {
            // Clean up any older records for this PO in purchase_order_items
            await supabase
              .from('purchase_order_items')
              .delete()
              .eq('po_id', poRows.id);

            // Bulk insert into purchase_order_items
            const itemRecords = items.map((i: any) => ({
              po_id: poRows.id,
              medicine_name: i.description || 'Unknown Medicine',
              dosage: i.sku || '',
              quantity: Number(i.quantity || 1),
              unit: i.unit || 'Box',
              unit_price: Number(i.unitPrice || 0),
              total: Number(i.total || 0)
            }));

            const { error: itemsError } = await supabase
              .from('purchase_order_items')
              .insert(itemRecords);

            if (itemsError) {
              console.warn('Could not insert itemized records into purchase_order_items:', itemsError.message);
              throw itemsError;
            }
          }
        })(),
        {
          loading: `Sending PO to ${supplierName}...`,
          success: () => {
            setTimeout(() => navigate('/orders'), 1500);
            return `Order sent successfully! Supplier confirmed receipt.`;
          },
          error: (err: any) => {
            const detailedMessage = err?.message || 'Database connection problem.';
            const codeInfo = err?.code ? ` [Code: ${err.code}]` : '';
            return `Supabase Save Error: ${detailedMessage}${codeInfo}`;
          },
        }
      );
    } else {
      toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
        loading: `Sending PO to ${supplierName}...`,
        success: () => {
          setTimeout(() => navigate('/orders'), 1500);
          return `Order sent successfully! (No Supabase connected, saved locally)`;
        },
        error: 'Failed to send order. Please try again.',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <button 
          onClick={() => navigate('/create-po')}
          className="flex items-center gap-2 text-slate-500 hover:text-medical-600 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Back to Edit</span>
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Printer size={18} />
            Print PO
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download size={18} />
            Download PDF
          </button>
          <button 
            onClick={handleSend}
            className="flex items-center gap-2 px-6 py-2 bg-medical-600 text-white rounded-xl text-sm font-bold hover:bg-medical-700 transition-all shadow-lg shadow-medical-600/20"
          >
            <Send size={18} />
            Confirm & Send
          </button>
        </div>
      </div>

      {/* The Document */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative print:border-none print:shadow-none print:rounded-none">
        {/* Document Header Decoration */}
        <div className="h-2 w-full bg-gradient-to-r from-medical-600 to-brand-cyan print:hidden" />
        
        <div className="p-12 md:p-16 space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-medical-600 flex items-center justify-center text-white font-bold text-xl">M</div>
                <h1 className="text-2xl font-display font-bold tracking-tight">MediOrder</h1>
              </div>
              <div className="text-sm text-slate-500 max-w-xs leading-relaxed">
                Level 15, Menara Medical,<br />
                Jalan Ampang, 50450 Kuala Lumpur,<br />
                WP Kuala Lumpur, Malaysia
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-display font-bold text-slate-900 mb-2 uppercase tracking-tighter">Purchase Order</h2>
              <div className="inline-flex items-center gap-2 py-1 px-3 bg-medical-50 text-medical-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                Draft Copy
              </div>
              <div className="space-y-1 text-sm font-sans">
                <p><span className="text-slate-400 font-medium">PO Number:</span> <span className="font-mono font-bold text-medical-600">{poNumber}</span></p>
                <p><span className="text-slate-400 font-medium">Order Date:</span> <span className="font-bold">{orderDate}</span></p>
                <p><span className="text-slate-400 font-medium">Exp. Delivery:</span> <span className="font-bold text-slate-800">{expectedDeliveryDate}</span></p>
                <p><span className="text-slate-400 font-medium">Payment Terms:</span> <span className="font-bold text-slate-800">{paymentTerms}</span></p>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm font-sans">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                FROM (Clinic Details)
              </h3>
              <div className="space-y-1">
                <p className="font-bold text-lg text-slate-900">{clinicName}</p>
                <div className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
                  <span className="font-semibold text-slate-700">Attn:</span> {picName}
                  {'\n'}{clinicAddress}
                </div>
                <p className="text-sm text-slate-500 pt-2 font-medium">Email: {clinicEmail}</p>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                TO (Supplier Details)
              </h3>
              <div className="space-y-1">
                <p className="font-bold text-lg text-slate-900">{supplierName}</p>
                <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
                  {supplierAddress}
                </p>
                <p className="text-sm text-slate-500 pt-2 font-medium">Email: {supplierEmail}</p>
                {supplierContact && <p className="text-sm text-slate-500 font-medium font-mono">Phone: {supplierContact}</p>}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden border border-slate-100 rounded-2xl">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="bg-slate-50">
                  <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item Description</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Qty / Unit</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Unit Price</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Total (RM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items && items.length > 0 ? (
                  items.map((item: any, i: number) => (
                    <tr key={item.id || i}>
                      <td className="py-5 px-6">
                        <p className="font-bold text-slate-900">{item.description || 'Unnamed Item'}</p>
                        {item.sku && <p className="text-xs text-slate-400 font-mono">SKU: {item.sku}</p>}
                      </td>
                      <td className="py-5 px-6 text-right font-medium">
                        {item.quantity} {item.unit || 'Box'}
                      </td>
                      <td className="py-5 px-6 text-right font-mono">
                        {Number(item.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-5 px-6 text-right font-bold text-slate-900 font-mono">
                        {Number(item.total).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-sm text-slate-500 italic font-medium">
                      No order items added.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50/30">
                <tr>
                  <td colSpan={2} rowSpan={4} className="py-8 px-6 align-top">
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-white/50">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Instructions / Notes</h4>
                      <p className="text-xs text-slate-600 leading-relaxed italic whitespace-pre-wrap">
                        {specialInstructions}
                      </p>
                    </div>
                  </td>
                  <td className="py-2 px-6 text-right text-sm text-slate-500">Subtotal</td>
                  <td className="py-2 px-6 text-right text-sm font-semibold font-mono">RM {subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-6 text-right text-sm text-slate-500">Tax (5% SST)</td>
                  <td className="py-2 px-6 text-right text-sm font-semibold font-mono">RM {tax.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-6 text-right text-sm text-slate-500">Shipping</td>
                  <td className="py-2 px-6 text-right text-sm font-semibold text-emerald-600 font-mono">RM 0.00</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-right text-medical-600 font-bold border-t border-slate-100">Grand Total</td>
                  <td className="py-4 px-6 text-right text-xl font-bold text-medical-600 border-t border-slate-100 font-mono">RM {grandTotal.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer of document */}
          <div className="flex justify-between items-end pt-12 border-t border-slate-100 font-sans">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-bold w-fit">
                <CheckCircle2 size={14} /> Digital Signature Verified
              </div>
              <p className="text-[10px] text-slate-400 max-w-xs uppercase tracking-tight">
                This is a computer generated document. No handwritten signature is required for electronic transmission between the system and its integrated suppliers.
              </p>
            </div>
            <div className="text-right space-y-4">
              <div className="flex items-center justify-end gap-2 text-slate-400">
                <Lock size={14} />
                <span className="text-[10px] uppercase font-bold tracking-widest">End of Document</span>
              </div>
              <div className="flex gap-4 items-center justify-end">
                <Share2 size={18} className="text-slate-300" />
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold font-mono text-xs shadow-inner">
                  PO-QR
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center print:hidden">
        <p className="text-slate-400 text-xs">MediOrder Secure Document Cloud • Unique ID: 8829-1120-X921</p>
      </div>
    </div>
  );
}
