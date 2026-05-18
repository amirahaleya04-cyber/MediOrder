import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Truck, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Download,
  Eye,
  FileEdit,
  Trash
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const StatCard = ({ title, value, change, trend, icon: Icon, color }: any) => (
  <button 
    onClick={() => toast.info(`Viewing details for ${title}`)}
    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md text-left w-full group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600 group-hover:scale-110 transition-transform`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
        {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        {change}
      </div>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </button>
);

const RecentOrderRow = ({ order }: any) => (
  <tr className="group hover:bg-slate-50/50 transition-colors">
    <td className="py-4 px-4 font-mono text-sm text-medical-600 font-medium">{order.id}</td>
    <td className="py-4 px-4">
      <div className="font-medium text-slate-900">{order.supplier}</div>
      <div className="text-xs text-slate-500">{order.date}</div>
    </td>
    <td className="py-4 px-4">
      <div className="text-sm text-slate-700">{order.items} Items</div>
    </td>
    <td className="py-4 px-4 text-right font-medium">RM {order.amount.toFixed(2)}</td>
    <td className="py-4 px-4 text-right">
      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
        order.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
        order.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
        'bg-slate-100 text-slate-700 border border-slate-200'
      }`}>
        {order.status}
      </span>
    </td>
    <td className="py-4 px-4 text-right">
      <div className="flex justify-end gap-1">
        <button 
          onClick={() => toast.info(`Viewing ${order.id}`)}
          className="p-2 text-slate-400 hover:text-medical-600 transition-colors rounded-lg hover:bg-medical-50"
          title="View"
        >
          <Eye size={18} />
        </button>
        <button 
          onClick={() => toast.info(`Action menu for ${order.id}`)}
          className="p-2 text-slate-400 hover:text-medical-600 transition-colors rounded-lg hover:bg-medical-50"
          title="More Actions"
        >
          <MoreVertical size={18} />
        </button>
      </div>
    </td>
  </tr>
);

export default function Dashboard() {
  const recentOrders = [
    { id: 'PO-2024-88A', supplier: 'PharmaDirect Malaysia', date: 'Oct 24, 2024', items: 12, amount: 4250.00, status: 'Approved' },
    { id: 'PO-2024-89B', supplier: 'Medisupply KL', date: 'Oct 25, 2024', items: 5, amount: 1100.00, status: 'Pending' },
    { id: 'PO-2024-90C', supplier: 'Global Health Corp', date: 'Oct 26, 2024', items: 25, amount: 8900.50, status: 'Sent' },
    { id: 'PO-2024-91D', supplier: 'Biotech Solutions', date: 'Oct 26, 2024', items: 8, amount: 240.00, status: 'Pending' },
  ];

  const handleExport = () => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: 'Preparing data export...',
      success: 'Dashboard data exported to CSV successfully',
      error: 'Failed to export data',
    });
  };

  const handleAutoOrder = () => {
    toast.success('Auto-order request sent for 15 units of Surgical Masks');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">MediOrder Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, Dr. Aisha. Here is what is happening today.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download size={18} />
            Export Data
          </button>
          <Link to="/create-po" className="flex items-center gap-2 px-4 py-2 bg-medical-600 text-white rounded-xl text-sm font-semibold hover:bg-medical-700 transition-all shadow-lg shadow-medical-600/20">
            <Package size={18} />
            Create New PO
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/insights" className="block">
          <StatCard 
            title="Monthly Spend" 
            value="RM 24,500.00" 
            change="+12.5%" 
            trend="up"
            icon={TrendingUp}
            color="bg-emerald-500"
          />
        </Link>
        <Link to="/orders" className="block">
          <StatCard 
            title="Active Orders" 
            value="18" 
            change="3 Pending" 
            trend="up"
            icon={Clock}
            color="bg-amber-500"
          />
        </Link>
        <Link to="/suppliers" className="block">
          <StatCard 
            title="Deliveries" 
            value="112" 
            change="8 Today" 
            trend="up"
            icon={Truck}
            color="bg-indigo-500"
          />
        </Link>
        <Link to="/suppliers" className="block">
          <StatCard 
            title="Suppliers" 
            value="42" 
            change="2 New" 
            trend="up"
            icon={CheckCircle2}
            color="bg-medical-600"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Recent Purchase Orders</h2>
            <Link 
              to="/orders"
              className="text-medical-600 text-sm font-semibold hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Items</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                  <th className="py-3 px-4 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map(order => (
                  <RecentOrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts & Inventory */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-500" />
              Critical Alerts
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 relative group">
                <p className="text-sm font-semibold text-rose-900">Low Stock Alert</p>
                <p className="text-xs text-rose-700 mt-1">Paracetamol 500mg is below 5% threshold.</p>
                <Link 
                  to="/catalog"
                  className="mt-2 text-xs font-bold text-rose-900 underline inline-block"
                >
                  Order Now
                </Link>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-sm font-semibold text-amber-900">Delayed Shipment</p>
                <p className="text-xs text-amber-700 mt-1">Order #PO-2024-88A delayed by 2 days.</p>
                <Link 
                  to="/catalog"
                  className="mt-2 text-xs font-bold text-amber-900 underline inline-block"
                >
                  Check Status
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-medical-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Automated Inventory</h3>
              <p className="text-medical-50/80 text-sm mb-4 leading-relaxed">
                Our AI suggests ordering 15 units of Surgical Masks based on your usage last month.
              </p>
              <Link 
                to="/create-po"
                className="inline-block bg-white text-medical-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-medical-50 transition-colors shadow-lg"
              >
                Approve Auto-Order
              </Link>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <Package size={120} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
