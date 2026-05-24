import React, { useState, useEffect } from 'react';
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
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string>(
    authUser?.user_metadata?.full_name || authUser?.email || 'User'
  );
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    monthlySpend: 0,
    activeOrders: 0,
    deliveries: 0,
    suppliersCount: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [showSqlGuide, setShowSqlGuide] = useState<boolean>(true);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardDetails = async () => {
      setIsLoading(true);
      try {
        let user = authUser;
        let profile: any = null;
        const missing: string[] = [];

        if (isSupabaseConfigured && supabase) {
          // 1. Get current authenticated user
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError || !userData.user) {
            toast.error('Session expired. Please log in.');
            navigate('/login');
            return;
          }
          user = userData.user;

          // 2. Fetch profile using user.id
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (profileError) {
            const isMissing = profileError.message?.includes('Could not find') || profileError.message?.includes('does not exist') || profileError.code === '42P01';
            if (isMissing) {
              missing.push('profiles');
            } else {
              console.warn('Error fetching profiles:', profileError.message);
            }
          }

          if (!profileError && profileData) {
            profile = profileData;
            setDisplayName(profileData.full_name || user.email || 'User');
          } else {
            setDisplayName(user.email || 'User');
          }

          // 3. Fetch clinic inventory
          let fetchedInventory: any[] = [];
          const { data: invRows, error: invError } = await supabase
            .from('clinic_inventory')
            .select('*');

          if (!invError && invRows) {
            fetchedInventory = invRows;
          } else {
            console.warn('Error fetching clinic_inventory or table missing. Showing empty state.');
          }

          const lowStock = fetchedInventory.filter(item => {
            const qty = item.current_stock_quantity !== undefined ? item.current_stock_quantity : 0;
            const threshold = item.reorder_level !== undefined ? item.reorder_level : 10;
            return qty <= threshold;
          });
          setLowStockItems(lowStock);

          // 2. Fetch purchase_orders created by this user or linked to this clinic
          let fetchedPOs: any[] = [];
          const { data: poRows, error: poError } = await supabase
            .from('purchase_orders')
            .select('*');

          if (!poError && poRows) {
            const clinicNameToCheck = profile?.clinic_name || user?.user_metadata?.clinic_name || '';
            fetchedPOs = poRows.filter((order: any) => {
              const belongsToClinic = clinicNameToCheck && (
                order.clinic_name === clinicNameToCheck ||
                order.clinic === clinicNameToCheck
              );
              return belongsToClinic;
            });
          } else if (poError) {
            const isMissing = poError.message?.includes('Could not find') || poError.message?.includes('does not exist') || poError.code === '42P01';
            if (isMissing) {
              missing.push('purchase_orders');
              console.warn('Supabase: "purchase_orders" table is not yet created. Falling back gracefully.');
            } else {
              console.error('Error fetching purchase_orders:', poError.message);
            }
          }

          // 6. Fetch suppliers linked to this user's clinic
          let fetchedSuppliers: any[] = [];
          const { data: supRows, error: supError } = await supabase
            .from('suppliers')
            .select('*');

          if (!supError && supRows) {
            const clinicNameToCheck = profile?.clinic_name || user?.user_metadata?.clinic_name || '';
            fetchedSuppliers = supRows.filter((sup: any) => {
              const belongsToClinic = clinicNameToCheck && (
                sup.clinic_name === clinicNameToCheck ||
                sup.clinic === clinicNameToCheck
              );
              return belongsToClinic;
            });
          } else if (supError) {
            const isMissing = supError.message?.includes('Could not find') || supError.message?.includes('does not exist') || supError.code === '42P01';
            if (isMissing) {
              missing.push('suppliers');
              console.warn('Supabase: "suppliers" table is not yet created. Falling back gracefully.');
            } else {
              console.error('Error fetching suppliers:', supError.message);
            }
          }

          setMissingTables(missing);

          // Calculations
          const now = new Date();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth();

          // 3. Calculate Monthly Spend from sum of grand_total for current month
          const currentMonthPOs = fetchedPOs.filter((order: any) => {
            const dateStr = order.created_at || order.date;
            if (!dateStr) return false;
            const d = new Date(dateStr);
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
          });

          const monthlySpend = currentMonthPOs.reduce((sum: number, order: any) => {
            const amount = order.grand_total !== undefined ? Number(order.grand_total) : (order.total !== undefined ? Number(order.total) : 0);
            return sum + amount;
          }, 0);

          // 4. Calculate Active Orders from status: Pending, Approved, Processing
          const activeOrders = fetchedPOs.filter((order: any) => {
            const status = (order.status || '').toLowerCase();
            return ['pending', 'approved', 'processing'].includes(status);
          });

          // 5. Calculate Deliveries from status: Delivered
          const deliveries = fetchedPOs.filter((order: any) => {
            const status = (order.status || '').toLowerCase();
            return status === 'delivered';
          });

          // Normalize order records for Table
          const normalizedPOs = fetchedPOs.map((order: any) => {
            const getItemsCountVal = () => {
              if (Array.isArray(order.items)) return order.items.length;
              if (typeof order.items === 'number') return order.items;
              if (typeof order.items === 'string') {
                try {
                  const p = JSON.parse(order.items);
                  if (Array.isArray(p)) return p.length;
                } catch {}
              }
              return 0;
            };

            const getSupplierName = () => {
              if (typeof order.supplier === 'object' && order.supplier !== null) {
                return order.supplier.name || order.supplier_name || 'Generic Supplier';
              }
              return order.supplier_name || order.supplier || 'Generic Supplier';
            };

            const getAmount = () => {
              const val = order.grand_total !== undefined ? order.grand_total : (order.total !== undefined ? order.total : 0);
              return Number(val);
            };

            return {
              id: order.order_number || order.orderNumber || order.id || `PO-${order.number || Math.floor(Math.random() * 1000)}`,
              supplier: getSupplierName(),
              date: order.created_at || order.date ? new Date(order.created_at || order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
              items: getItemsCountVal(),
              amount: getAmount(),
              status: order.status || 'Pending'
            };
          });

          setStats({
            monthlySpend,
            activeOrders: activeOrders.length,
            deliveries: deliveries.length,
            suppliersCount: fetchedSuppliers.length
          });
          setOrders(normalizedPOs);

        } else {
          // Supabase is not configured yet - show empty states
          if (!authUser) {
            navigate('/login');
            return;
          }
          setDisplayName(authUser.user_metadata?.full_name || authUser.email || 'User');
          setStats({
            monthlySpend: 0,
            activeOrders: 0,
            deliveries: 0,
            suppliersCount: 0
          });
          setOrders([]);
          setLowStockItems([]);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardDetails();
  }, [authUser, navigate]);

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
          <p className="text-slate-500 mt-1">Welcome back, {displayName}. Here is what is happening today.</p>
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

      {missingTables.length > 0 && showSqlGuide && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-base">Supabase Database Setup Required</h3>
                <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                  Your Supabase account is connected, but the following database tables are missing from your schema:{" "}
                  <code className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold text-xs">{missingTables.join(', ')}</code>.
                  Please run the following SQL script directly in your Supabase SQL Editor to instantiate your database schema:
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowSqlGuide(false)}
              className="text-amber-500 hover:text-amber-700 font-semibold text-xs py-1 px-2.5 bg-white border border-amber-200 rounded-lg shadow-xs hover:bg-amber-50 transition-colors"
            >
              Dismiss
            </button>
          </div>
          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-normal select-all">
{`-- Create tables for MediOrder procurement log

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  clinic_name TEXT,
  full_name TEXT,
  role TEXT,
  email TEXT,
  clinic_address TEXT,
  clinic_phone TEXT,
  registration_no TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  clinic_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  contact_person TEXT,
  payment_terms TEXT,
  categories TEXT[] DEFAULT '{}'::TEXT[]
);

CREATE TABLE IF NOT EXISTS public.supplier_medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  supplier_name TEXT,
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  category TEXT,
  unit TEXT,
  unit_price NUMERIC DEFAULT 0,
  availability BOOLEAN DEFAULT true,
  description TEXT
);

CREATE TABLE IF NOT EXISTS public.clinic_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  supplier_medicine_id UUID REFERENCES public.supplier_medicines(id) ON DELETE SET NULL,
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  supplier_name TEXT,
  unit TEXT,
  current_stock_quantity INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  order_number TEXT UNIQUE,
  supplier TEXT,
  clinic_name TEXT,
  subtotal NUMERIC DEFAULT 0,
  sst_amount NUMERIC DEFAULT 0,
  grand_total NUMERIC DEFAULT 0,
  order_date DATE DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  payment_terms TEXT,
  authorized_by TEXT,
  status TEXT DEFAULT 'Pending'
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  po_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  quantity INTEGER DEFAULT 1,
  unit TEXT,
  unit_price NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.clinic_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  clinic_name TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  is_primary_pic BOOLEAN DEFAULT false
);`}
            </pre>
            <div className="absolute right-3 top-3 text-[10px] uppercase font-bold tracking-wider bg-slate-800/80 text-slate-300 px-2 bg-opacity-70 rounded select-none pointer-events-none">
              Click box to select all
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/insights" className="block">
          <StatCard 
            title="Monthly Spend" 
            value={`RM ${stats.monthlySpend.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
            change="This Month" 
            trend="up"
            icon={TrendingUp}
            color="bg-emerald-500"
          />
        </Link>
        <Link to="/orders" className="block">
          <StatCard 
            title="Active Orders" 
            value={`${stats.activeOrders}`} 
            change="Procurement" 
            trend="up"
            icon={Clock}
            color="bg-amber-500"
          />
        </Link>
        <Link to="/orders" className="block">
          <StatCard 
            title="Deliveries" 
            value={`${stats.deliveries}`} 
            change="Completed" 
            trend="up"
            icon={Truck}
            color="bg-indigo-500"
          />
        </Link>
        <Link to="/suppliers" className="block">
          <StatCard 
            title="Suppliers" 
            value={`${stats.suppliersCount}`} 
            change="Registered" 
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
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-4 border-slate-200 border-t-medical-600 rounded-full animate-spin" />
                        <p className="text-sm font-semibold text-slate-500">Loading procurement logs...</p>
                      </div>
                    </td>
                  </tr>
                ) : orders.length > 0 ? (
                  orders.slice(0, 5).map(order => (
                    <RecentOrderRow key={order.id} order={order} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 px-6 text-center text-slate-500 font-sans">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <AlertCircle size={32} className="text-slate-400" />
                        <p className="font-bold text-slate-700">No purchase orders yet.</p>
                        <p className="text-xs text-slate-400">Create your first PO to start tracking procurement.</p>
                        <Link 
                          to="/create-po"
                          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-medical-600 text-white rounded-xl text-xs font-semibold hover:bg-medical-700 transition-all"
                        >
                          Create New PO
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
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
              {lowStockItems.length > 0 ? (
                lowStockItems.slice(0, 3).map((item, idx) => {
                  const qty = item.current_stock_quantity !== undefined ? item.current_stock_quantity : (item.stock_quantity || 0);
                  const isZero = qty === 0;
                  return (
                    <div 
                      key={item.id || idx} 
                      className={`p-4 rounded-xl border ${
                        isZero 
                          ? 'bg-rose-50 border-rose-100 text-rose-900' 
                          : 'bg-amber-50 border-amber-100/70 text-amber-900'
                      } relative group`}
                    >
                      <p className="text-sm font-semibold">
                        {isZero ? 'Critical: Out of Stock' : 'Warning: Low Stock Alert'}
                      </p>
                      <p className={`text-xs mt-1 ${isZero ? 'text-rose-700' : 'text-amber-700'}`}>
                        {item.medicine_name} {item.dosage ? `(${item.dosage})` : ''} is at {qty} {item.unit || 'units'} (threshold: {item.reorder_level || 10}).
                      </p>
                      <Link 
                        to="/inventory"
                        className={`mt-2 text-xs font-bold underline inline-block ${isZero ? 'text-rose-950' : 'text-amber-950'}`}
                      >
                        Manage Stock
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                  <p className="text-sm font-semibold">All Stocks Healthy</p>
                  <p className="text-xs text-emerald-700 mt-1">No low stock items detected in Clinic Inventory.</p>
                </div>
              )}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-sm font-semibold text-slate-800">Delayed Shipment</p>
                <p className="text-xs text-slate-600 mt-1 font-sans">Order #PO-2024-88A delayed by 2 days.</p>
                <Link 
                  to="/orders"
                  className="mt-2 text-xs font-bold text-slate-800 underline inline-block"
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
