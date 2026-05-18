import React, { useState } from 'react';
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
  Truck
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const orders = [
  { id: 'PO-2024-91F', supplier: 'MedCare Supplies', date: 'May 18, 2024', items: 12, amount: 1540.00, status: 'Sent', pic: 'Dr. Aisha' },
  { id: 'PO-2024-91E', supplier: 'Sabah Pharma', date: 'May 12, 2024', items: 5, amount: 820.50, status: 'Received', pic: 'Farah Lim' },
  { id: 'PO-2024-91D', supplier: 'Biotech Solutions', date: 'May 10, 2024', items: 8, amount: 240.00, status: 'Pending', pic: 'Dr. Aisha' },
  { id: 'PO-2024-91C', supplier: 'KlinikMed Wholesale', date: 'May 05, 2024', items: 15, amount: 3200.00, status: 'Cancelled', pic: 'Ahmad Hakim' },
  { id: 'PO-2024-91B', supplier: 'MedCare Supplies', date: 'Apr 28, 2024', items: 22, amount: 4500.00, status: 'Received', pic: 'Dr. Aisha' },
  { id: 'PO-2024-91A', supplier: 'Borneo Medical', date: 'Apr 25, 2024', items: 3, amount: 150.00, status: 'Received', pic: 'Siti Aminah' },
];

export default function OrderHistory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
                          o.supplier.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Received': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Sent': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Received': return <CheckCircle2 size={12} />;
      case 'Sent': return <Truck size={12} />;
      case 'Pending': return <Clock size={12} />;
      case 'Cancelled': return <XCircle size={12} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Purchase Order History</h1>
          <p className="text-slate-500 mt-1">Audit and track every transaction for your clinic.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => toast.info('Generating annual procurement report...')}
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
            placeholder="Search by PO number or supplier..."
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
          <button className="px-4 py-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all">
            <Calendar size={18} />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="py-4 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900 transition-colors">
                    PO Order <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supplier</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Items</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized By</th>
                <th className="py-4 px-8 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="py-5 px-8">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{order.id}</p>
                      <p className="text-xs text-slate-500">{order.date}</p>
                    </div>
                  </td>
                  <td className="py-5 px-4 text-xs font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" />
                      {order.supplier}
                    </div>
                  </td>
                  <td className="py-5 px-4 text-xs font-bold text-slate-500">
                    {order.items} Units
                  </td>
                  <td className="py-5 px-4">
                    <p className="text-sm font-bold text-slate-900">RM {order.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
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
                       <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                         {order.pic.charAt(0)}
                       </div>
                       <p className="text-xs font-medium text-slate-600">{order.pic}</p>
                    </div>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toast.info(`Opening ${order.id}...`)}
                        className="p-2 text-slate-400 hover:text-medical-600 rounded-lg hover:bg-medical-50 transition-all"
                        title="View PO"
                      >
                        <Eye size={16} />
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
          {filteredOrders.length === 0 && (
            <div className="py-20 text-center">
               <p className="text-slate-500 text-sm">No orders found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
