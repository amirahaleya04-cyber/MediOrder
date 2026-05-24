import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MoreVertical, 
  Calendar,
  Building2,
  ChevronDown,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function OrderHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        // Fetch current user's profile to retrieve clinic details
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .maybeSingle();

        const clinicNameToCheck = currentProfile?.clinic_name || user?.user_metadata?.clinic_name || '';

        // Fetch purchase orders
        const { data: poRows, error: poError } = await supabase
          .from('purchase_orders')
          .select('*')
          .eq('clinic_name', clinicNameToCheck);

        if (poError) {
          throw poError;
        }

        let fetchedPOs = poRows || [];

        // Fetch all purchase order items for these PO IDs
        let finishedItems: any[] = [];
        if (fetchedPOs.length > 0) {
          const poIds = fetchedPOs.map((p: any) => p.id);
          const { data: itemRows, error: itemsError } = await supabase
            .from('purchase_order_items')
            .select('*')
            .in('po_id', poIds);
          
          if (!itemsError && itemRows) {
            finishedItems = itemRows;
          }
        }

        // Normalize PO rows to consistent format matching requirements
        const normalized = fetchedPOs.map((order: any) => {
          const matchingItems = finishedItems.filter((item: any) => item.po_id === order.id);
          
          // Map matchingItems to POItem structure
          const mappedItems = matchingItems.map((item: any) => ({
            id: item.id,
            description: item.medicine_name,
            sku: item.dosage,
            quantity: Number(item.quantity || 1),
            unit: item.unit || 'Box',
            unitPrice: Number(item.unit_price || 0),
            total: Number(item.total || 0)
          }));

          const getItemsCountVal = () => {
            return mappedItems.length;
          };

          const getSupplierName = () => {
            return order.supplier || 'Generic Supplier';
          };

          const getAmount = () => {
            return Number(order.grand_total || 0);
          };

          const getPICName = () => {
            return order.authorized_by || 'Authorized PIC';
          };

          return {
            id: order.order_number || order.id,
            supplier: getSupplierName(),
            date: order.order_date ? new Date(order.order_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
            createdTime: order.order_date ? new Date(order.order_date).getTime() : 0,
            items: getItemsCountVal(),
            amount: getAmount(),
            status: order.status || 'Pending',
            pic: getPICName(),

            clinic_name: order.clinic_name || clinicNameToCheck || 'City Clinic Kuala Lumpur',
            originalItems: mappedItems,
            payment_terms: order.payment_terms || 'Net 30',
            special_instructions: '',
            expected_delivery_date: order.expected_delivery_date || '',
          };
        });

        setOrders(normalized);
      } else {
        // Supabase is not configured yet - show empty states
        setOrders([]);
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to retrieve purchase orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortOrder === 'desc') {
      return b.createdTime - a.createdTime;
    } else {
      return a.createdTime - b.createdTime;
    }
  });

  const filteredOrders = sortedOrders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
                          o.supplier.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || o.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      toast.error('No purchase orders to export.');
      return;
    }

    const headers = ['PO Number', 'Supplier Name', 'Number of Items', 'Grand Total', 'Status', 'Authorized By / PIC Name', 'Order Date'];
    const rows = filteredOrders.map(o => [
      o.id,
      o.supplier,
      o.items,
      `RM ${o.amount.toFixed(2)}`,
      o.status,
      o.pic,
      o.date
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mediorder_purchase_orders_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Audit log CSV report download started successfully!');
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'received': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'sent': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'received':
      case 'approved': return <CheckCircle2 size={12} />;
      case 'sent': return <Truck size={12} />;
      case 'pending': return <Clock size={12} />;
      case 'cancelled': return <XCircle size={12} />;
      default: return null;
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
          <div className="h-14 w-full bg-slate-50 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Database Connection Error</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            {error}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-6 py-2.5 bg-rose-600 text-white font-bold text-sm rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 inline-flex items-center gap-2"
        >
          Check Again / Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">MediOrder Order History</h1>
          <p className="text-slate-500 mt-1">Audit and track every transaction for your clinic.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Download size={18} />
            Export Audit Log
          </button>
          <Link 
            to="/create-po"
            className="px-6 py-3 bg-medical-600 text-white rounded-xl font-bold text-sm hover:bg-medical-700 transition-all flex items-center gap-2 shadow-lg shadow-medical-600/20"
          >
            <FileText size={18} />
            New Purchase Order
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by PO number or supplier name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-medical-600/20 focus:ring-4 focus:ring-medical-600/5 transition-all outline-none font-sans"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative w-48">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none pl-10 pr-10 py-3 bg-slate-50 border border-transparent rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white transition-all"
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>Sent</option>
              <option>Received</option>
              <option>Cancelled</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
          <button 
            onClick={toggleSort}
            className="px-4 py-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 text-xs font-bold"
            title="Toggle Date Sorting"
          >
            Date
            <ArrowUpDown size={14} />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="py-20 text-center space-y-4">
               <p className="text-slate-500 text-sm">No purchase orders yet. Create your first PO to start tracking orders.</p>
               <button
                 onClick={() => navigate('/create-po')}
                 className="px-6 py-2.5 bg-medical-600 text-white rounded-xl text-sm font-bold hover:bg-medical-700 transition-all shadow-lg shadow-medical-600/20 inline-flex items-center gap-2"
               >
                 Create Purchase Order
               </button>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="py-4 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    PO Number
                  </th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supplier Name</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Number of Items</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grand Total</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized By / PIC Name</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Date</th>
                  <th className="py-4 px-8 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="py-5 px-8 font-mono text-sm text-medical-600 font-bold">
                      {order.id}
                    </td>
                    <td className="py-5 px-4 text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-slate-400" />
                        {order.supplier}
                      </div>
                    </td>
                    <td className="py-5 px-4 text-xs font-bold text-slate-500">
                      {order.items} Items
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-sm font-bold text-slate-900">RM {order.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${getStatusStyle(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                           {order.pic.charAt(0)}
                         </div>
                         <p className="text-xs font-medium text-slate-600">{order.pic}</p>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-xs font-medium text-slate-500">
                      {order.date}
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            localStorage.setItem('mediorder_draft_po', JSON.stringify({
                              clinicName: order.clinic_name,
                              picName: order.pic,
                              items: order.originalItems,
                              poNumber: order.id,
                              orderDate: order.date,
                              expectedDeliveryDate: order.expected_delivery_date,
                              paymentTerms: order.payment_terms,
                              specialInstructions: order.special_instructions,
                              supplierName: order.supplier,
                            }));
                            navigate('/po-preview');
                          }}
                          className="p-2 text-slate-400 hover:text-medical-600 rounded-lg hover:bg-medical-50 transition-all font-bold text-xs inline-flex items-center gap-1"
                          title="View PO printable preview"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
