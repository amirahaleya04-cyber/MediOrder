import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Printer, 
  Download, 
  Send, 
  CheckCircle2, 
  ArrowLeft,
  Share2,
  Lock
} from 'lucide-react';

export default function OrderPreview() {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
      loading: 'Generating PDF...',
      success: 'Purchase Order PDF downloaded successfully',
      error: 'Failed to generate PDF',
    });
  };

  const handleSend = () => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
      loading: 'Sending PO to PharmaDirect Malaysia...',
      success: () => {
        setTimeout(() => navigate('/dashboard'), 1500);
        return 'Order sent successfully! Supplier confirmed receipt.';
      },
      error: 'Failed to send order. Please try again.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Document Header Decoration */}
        <div className="h-2 w-full bg-gradient-to-r from-medical-600 to-brand-cyan" />
        
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
              <div className="space-y-1">
                <p className="text-sm"><span className="text-slate-400 font-medium">PO Number:</span> <span className="font-mono font-bold text-medical-600">PO-2024-1024-X</span></p>
                <p className="text-sm"><span className="text-slate-400 font-medium">Order Date:</span> <span className="font-bold">Oct 26, 2024</span></p>
                <p className="text-sm"><span className="text-slate-400 font-medium">Valid Until:</span> <span className="font-bold">Nov 02, 2024</span></p>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                FROM (Clinic Details)
              </h3>
              <div className="space-y-1">
                <p className="font-bold text-lg text-slate-900">City Clinic Kuala Lumpur</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Attn: Dr. Aisha Khan<br />
                  12-G, Block B, Centrio Pantai Hillpark<br />
                  Jalan Pantai Murni, 59200 Kuala Lumpur
                </p>
                <p className="text-sm text-slate-500 pt-2 font-medium">Phone: +60 3-1234 5678</p>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                TO (Supplier Details)
              </h3>
              <div className="space-y-1">
                <p className="font-bold text-lg text-slate-900">PharmaDirect Malaysia Sdn Bhd</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Distribution Hub North<br />
                  Lot 8, Industrial Estate Phase 3<br />
                  81100 Johor Bahru, Johor
                </p>
                <p className="text-sm text-slate-500 pt-2 font-medium">Email: orders@pharmadirect.my</p>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden border border-slate-100 rounded-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item / SKU</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Qty</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Unit Price</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Total (RM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr>
                  <td className="py-5 px-6">
                    <p className="font-bold text-slate-900">Paracetamol 500mg Tablet</p>
                    <p className="text-xs text-slate-400 font-mono">SKU: PH-PARA-500</p>
                  </td>
                  <td className="py-5 px-6 text-right font-medium">10 Boxes</td>
                  <td className="py-5 px-6 text-right font-mono">25.00</td>
                  <td className="py-5 px-6 text-right font-bold text-slate-900">250.00</td>
                </tr>
                <tr>
                  <td className="py-5 px-6">
                    <p className="font-bold text-slate-900">N85 Surgical Mask (50s)</p>
                    <p className="text-xs text-slate-400 font-mono">SKU: EQ-MASK-N85</p>
                  </td>
                  <td className="py-5 px-6 text-right font-medium">50 Units</td>
                  <td className="py-5 px-6 text-right font-mono">4.50</td>
                  <td className="py-5 px-6 text-right font-bold text-slate-900">225.00</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50/30">
                <tr>
                  <td colSpan={2} rowSpan={4} className="py-8 px-6 align-top">
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-white/50">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Instructions / Notes</h4>
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        Please ensure items are delivered before 2:00 PM on weekdays. Urgent stock needed for upcoming health screening campaign.
                      </p>
                    </div>
                  </td>
                  <td className="py-2 px-6 text-right text-sm text-slate-500">Subtotal</td>
                  <td className="py-2 px-6 text-right text-sm font-semibold">475.00</td>
                </tr>
                <tr>
                  <td className="py-2 px-6 text-right text-sm text-slate-500">Tax (5% SST)</td>
                  <td className="py-2 px-6 text-right text-sm font-semibold">23.75</td>
                </tr>
                <tr>
                  <td className="py-2 px-6 text-right text-sm text-slate-500">Shipping</td>
                  <td className="py-2 px-6 text-right text-sm font-semibold text-emerald-600">0.00</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-right text-medical-600 font-bold border-t border-slate-100">Grand Total</td>
                  <td className="py-4 px-6 text-right text-xl font-bold text-medical-600 border-t border-slate-100">RM 498.75</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer of document */}
          <div className="flex justify-between items-end pt-12 border-t border-slate-100">
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
              <div className="flex gap-4">
                <Share2 size={18} className="text-slate-300" />
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-200">
                  QR
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-slate-400 text-xs">MediOrder Secure Document Cloud • Unique ID: 8829-1120-X921</p>
      </div>
    </div>
  );
}
