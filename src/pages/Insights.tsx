import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Truck, 
  AlertCircle,
  Download,
  Calendar,
  Loader2,
  Users,
  Layers,
  ShoppingBag,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const COLORS = ['#008080', '#00A3A3', '#00B4D8', '#48CAE4', '#90E0EF', '#1E293B', '#475569'];

export default function Insights() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Raw database data states
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [supplierMedicines, setSupplierMedicines] = useState<any[]>([]);
  const [purchaseOrderItems, setPurchaseOrderItems] = useState<any[]>([]);

  // Derived metrics states
  const [totalSpend, setTotalSpend] = useState(0);
  const [poCount, setPoCount] = useState(0);
  const [activeSuppliersCount, setActiveSuppliersCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);

  // Chart data states
  const [monthlySpendData, setMonthlySpendData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  const fetchInsightsData = async () => {
    if (!user) return;
    setIsLoading(true);
    setDbError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        // 1. Get Clinic name associated with the current user profiling
        const { data: profileRow, error: profileErr } = await supabase
          .from('profiles')
          .select('clinic_name')
          .eq('id', user.id)
          .maybeSingle();

        if (profileErr) {
          console.error('[Supabase Audit] Error fetching user profile:', profileErr.message);
          setDbError(`Profiles Table Search Failure: ${profileErr.message} (Code: ${profileErr.code})`);
        }

        const activeClinic = profileRow?.clinic_name || user?.user_metadata?.clinic_name || 'City Clinic KL';

        // 2. Query suppliers
        const { data: sups, error: supsErr } = await supabase
          .from('suppliers')
          .select('*')
          .eq('clinic_name', activeClinic);

        if (supsErr) {
          console.error('[Supabase Audit] Error fetching suppliers:', supsErr.message);
          setDbError(prev => (prev ? `${prev} | ` : '') + `Suppliers Select Failed: ${supsErr.message}`);
        }
        const loadedSuppliers = sups || [];
        setSuppliers(loadedSuppliers);

        // 3. Query purchase orders
        const { data: pos, error: posErr } = await supabase
          .from('purchase_orders')
          .select('*')
          .eq('clinic_name', activeClinic);

        if (posErr) {
          console.error('[Supabase Audit] Error fetching purchase orders:', posErr.message);
          setDbError(prev => (prev ? `${prev} | ` : '') + `Purchase Orders Select Failed: ${posErr.message}`);
        }
        const loadedPOs = pos || [];
        setPurchaseOrders(loadedPOs);

        // 4. Query clinic inventory
        const { data: invs, error: invErr } = await supabase
          .from('clinic_inventory')
          .select('*');

        if (invErr) {
          console.error('[Supabase Audit] Error fetching inventory:', invErr.message);
          setDbError(prev => (prev ? `${prev} | ` : '') + `Clinic Inventory Select Failed: ${invErr.message}`);
        }
        const loadedInvs = invs || [];
        setInventory(loadedInvs);

        // 5. Query supplier medicines catalog (to pull item categories & matching unit prices)
        const { data: meds, error: medsErr } = await supabase
          .from('supplier_medicines')
          .select('*');

        if (medsErr) {
          console.error('[Supabase Audit] Error fetching supplier medicines:', medsErr.message);
          setDbError(prev => (prev ? `${prev} | ` : '') + `Supplier Medicines Select Failed: ${medsErr.message}`);
        }
        const loadedMeds = meds || [];
        setSupplierMedicines(loadedMeds);

        // 6. Query purchase order items
        let loadedItems: any[] = [];
        if (loadedPOs.length > 0) {
          const poIds = loadedPOs.map((p: any) => p.id);
          const { data: items, error: itemsErr } = await supabase
            .from('purchase_order_items')
            .select('*')
            .in('po_id', poIds);

          if (itemsErr) {
            console.error('[Supabase Audit] Error fetching PO items:', itemsErr.message);
            setDbError(prev => (prev ? `${prev} | ` : '') + `PO Items Select Failed: ${itemsErr.message}`);
          } else {
            loadedItems = items || [];
          }
        }
        setPurchaseOrderItems(loadedItems);

        // Calculate Real Metrics & Aggregate Chart Coordinates
        computeAllMetrics(loadedPOs, loadedSuppliers, loadedInvs, loadedMeds, loadedItems);
      } else {
        // Fallback states if Supabase is offline
        setTotalSpend(0);
        setPoCount(0);
        setActiveSuppliersCount(0);
        setLowStockCount(0);
        setInventoryValue(0);
      }
    } catch (err: any) {
      console.error('Cascading search criteria error:', err);
      setDbError(`Fatal application thread crash: ${err?.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const computeAllMetrics = (
    pos: any[], 
    sups: any[], 
    invs: any[], 
    meds: any[], 
    items: any[]
  ) => {
    // 1. Total Spend
    const sumSpend = pos.reduce((sum, order) => sum + Number(order.grand_total || 0), 0);
    setTotalSpend(sumSpend);

    // 2. Purchase Orders Created COUNT
    setPoCount(pos.length);

    // 3. Active Suppliers COUNT
    setActiveSuppliersCount(sups.length);

    // 4. Low Stock Items COUNT (current_stock_quantity <= reorder_level)
    const lowStockNum = invs.filter(item => Number(item.current_stock_quantity || 0) <= Number(item.reorder_level || 0)).length;
    setLowStockCount(lowStockNum);

    // 5. Inventory Value: SUM(current_stock_quantity * unit_price)
    // Map supplier medicine price dictionary for fast lookup
    const priceLookup: Record<string, number> = {};
    meds.forEach(m => {
      if (m.medicine_name) {
        priceLookup[m.medicine_name.toLowerCase().trim()] = Number(m.unit_price || 0);
      }
    });

    const sumInvVal = invs.reduce((sum, item) => {
      const medNameKey = (item.medicine_name || '').toLowerCase().trim();
      const unitPrice = priceLookup[medNameKey] || 0;
      return sum + (Number(item.current_stock_quantity || 0) * unitPrice);
    }, 0);
    setInventoryValue(sumInvVal);

    // Spending Trends Chart Aggregation (Last 6 Calendar Months)
    const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const groupedMonthly: Record<string, number> = {};
    
    // Seed continuous 6 calendar months based on current local time
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = d.toLocaleString('en-US', { month: 'short' });
      groupedMonthly[mName] = 0;
    }

    pos.forEach(order => {
      const dateStr = order.order_date || order.created_at;
      if (!dateStr) return;
      const d = new Date(dateStr);
      const mName = d.toLocaleString('en-US', { month: 'short' });
      if (groupedMonthly[mName] !== undefined) {
        groupedMonthly[mName] += Number(order.grand_total || 0);
      }
    });

    const trendChart = Object.entries(groupedMonthly).map(([name, amount]) => ({
      name,
      amount: Number(amount.toFixed(2))
    }));
    setMonthlySpendData(trendChart);

    // Category Distribution Chart Aggregation
    const catTotals: Record<string, number> = {
      'Pharmaceuticals': 0,
      'Consumables': 0,
      'Surgical': 0,
      'Laboratory': 0,
      'Others': 0,
    };

    // Dictionary to resolve category from item description
    const catLookup: Record<string, string> = {};
    meds.forEach(m => {
      if (m.medicine_name && m.category) {
        catLookup[m.medicine_name.toLowerCase().trim()] = m.category;
      }
    });

    items.forEach(item => {
      const itemKey = (item.medicine_name || '').toLowerCase().trim();
      const catVal = catLookup[itemKey] || 'Pharmaceuticals';
      const itemTotal = Number(item.total || 0);
      if (catTotals[catVal] !== undefined) {
        catTotals[catVal] += itemTotal;
      } else {
        catTotals[catVal] = itemTotal;
      }
    });

    const totalCategorySpend = Object.values(catTotals).reduce((a, b) => a + b, 0);
    const categoryChart = Object.entries(catTotals)
      .map(([name, value]) => {
        const percentage = totalCategorySpend > 0 ? Math.round((value / totalCategorySpend) * 100) : 0;
        return { name, value: Number(value.toFixed(2)), percentage };
      })
      .filter(item => item.value > 0);

    setCategoryData(categoryChart);
  };

  useEffect(() => {
    fetchInsightsData();
  }, [user]);

  // If no suppliers and no purchase_orders, we consider the data empty!
  const hasNoData = purchaseOrders.length === 0 && suppliers.length === 0 && inventory.length === 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-medical-600 animate-duration-1000" size={36} />
        <p className="text-sm font-medium text-slate-500">Compiling real-time supply chain analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Dev mode detailed error alert */}
      {dbError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-mono space-y-1 shadow-sm">
          <p className="font-bold flex items-center gap-1.5 text-sm">
            <AlertCircle size={16} /> Supabase Server Diagnostic Active (Development Window)
          </p>
          <p>{dbError}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">MediOrder Insights</h1>
          <p className="text-slate-500 mt-1">Data-driven analysis of your clinic's supply chain.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => toast.info('Exporting analytical report (PDF)...')}
            disabled={hasNoData}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={18} />
            Download Summary
          </button>
          <div className="relative">
            <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2">
              <Calendar size={18} />
              Last 6 Months
            </button>
          </div>
        </div>
      </div>

      {hasNoData ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-16 text-center space-y-6 max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <FileSpreadsheet size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">No Analytics Available</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              No analytics available yet. Create suppliers, inventory, and purchase orders to generate insights.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Dynamic Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:border-slate-300">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spend</p>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                RM {totalSpend.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <div className="absolute -right-2 -bottom-2 text-slate-50 pointer-events-none select-none">
                <DollarSign size={80} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:border-slate-300">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchase Orders</p>
              <h3 className="text-xl font-bold text-slate-900 mt-2">{poCount} Created</h3>
              <div className="absolute -right-2 -bottom-2 text-slate-50 pointer-events-none select-none">
                <Layers size={80} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:border-slate-300">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suppliers Network</p>
              <h3 className="text-xl font-bold text-slate-900 mt-2">{activeSuppliersCount} Active</h3>
              <div className="absolute -right-2 -bottom-2 text-slate-50 pointer-events-none select-none">
                <Users size={80} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:border-slate-300">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Items</p>
              <h3 className={`text-xl font-bold mt-2 ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {lowStockCount} Items
              </h3>
              <div className="absolute -right-2 -bottom-2 text-slate-50 pointer-events-none select-none">
                <AlertCircle size={80} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:border-slate-300">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Value</p>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                RM {inventoryValue.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <div className="absolute -right-2 -bottom-2 text-slate-50 pointer-events-none select-none">
                <Package size={80} />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Spending Trend Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Spending Trends (RM)</h3>
              </div>
              <div className="h-[280px] w-full">
                {monthlySpendData.every(item => item.amount === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                    <Package size={28} className="mb-2 opacity-55" />
                    No transactions completed during this interval
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySpendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                      <Tooltip 
                        cursor={{ fill: '#F8FAFC' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="amount" fill="#008080" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Category Pie Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900">Spending by Category</h3>
              {categoryData.length === 0 ? (
                <div className="h-[280px] flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Layers size={28} className="mb-2 opacity-55" />
                  Please add items to your purchase orders to classify spending
                </div>
              ) : (
                <div className="h-[280px] w-full flex flex-col md:flex-row items-center">
                  <div className="flex-1 w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `RM ${Number(value).toLocaleString('en-MY')}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2.5 max-h-[220px] overflow-y-auto pr-2">
                    {categoryData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900">{item.percentage}%</span>
                          <p className="text-[10px] text-slate-400 font-medium">RM {item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
