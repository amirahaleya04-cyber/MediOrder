import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Truck, 
  AlertCircle,
  Download,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

const monthlySpendData = [
  { name: 'Jan', amount: 12000 },
  { name: 'Feb', amount: 15000 },
  { name: 'Mar', amount: 13500 },
  { name: 'Apr', amount: 21000 },
  { name: 'May', amount: 24500 },
];

const categoryData = [
  { name: 'Pharmaceuticals', value: 45 },
  { name: 'Consumables', value: 25 },
  { name: 'Surgical', value: 15 },
  { name: 'Laboratory', value: 10 },
  { name: 'Others', value: 5 },
];

const COLORS = ['#008080', '#00A3A3', '#00B4D8', '#48CAE4', '#90E0EF'];

export default function Insights() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">MediOrder Insights</h1>
          <p className="text-slate-500 mt-1">Data-driven analysis of your clinic's supply chain.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => toast.info('Exporting analytical report (PDF)...')}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
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

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-sm font-medium text-slate-500">Cumulative Spend (YTD)</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">RM 86,000.00</h3>
          <div className="mt-4 flex items-center gap-1 text-emerald-600 text-xs font-bold">
            <TrendingUp size={14} /> +18.2% from last year
          </div>
          <div className="absolute -right-4 -bottom-4 text-emerald-50 opacity-50">
            <DollarSign size={100} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-sm font-medium text-slate-500">Order Fulfillment Rate</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">94.2%</h3>
          <div className="mt-4 flex items-center gap-1 text-emerald-600 text-xs font-bold">
             In line with KKM benchmarks
          </div>
          <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-50">
            <Truck size={100} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-sm font-medium text-slate-500">Inventory Turnover</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">4.5x / mo</h3>
          <div className="mt-4 flex items-center gap-1 text-rose-600 text-xs font-bold">
            <TrendingDown size={14} /> Slowdown in Consumables
          </div>
          <div className="absolute -right-4 -bottom-4 text-rose-50 opacity-50">
            <Package size={100} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending Trend */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Spending Trends (RM)</h3>
            <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded">Primary Trend: Upward</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySpendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#008080" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900">Spending by Category</h3>
          <div className="h-[300px] w-full flex flex-col md:flex-row items-center">
            <div className="flex-1 w-full h-[250px]">
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Performance */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 space-y-4">
          <div className="p-3 bg-amber-50 rounded-2xl inline-block text-amber-600">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 leading-tight">Optimization <br />Opportunity Found</h3>
          <p className="text-slate-500 text-sm">
            Based on our analysis, <b>Sabah Pharma</b> has increased prices by 7% this month. MedCare Supplies offers the same catalog at 2% lower price with similar reliability scores.
          </p>
          <button 
            onClick={() => toast.success('Optimization request sent to procurement team')}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
          >
            Review Supplier Contract
          </button>
        </div>
        <div className="flex-1 w-full p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Top 3 Reliable Suppliers</p>
           <div className="space-y-4">
              {[
                { name: 'MedCare Supplies', score: 98, color: 'emerald' },
                { name: 'Borneo Medical', score: 94, color: 'blue' },
                { name: 'Biotech Solutions', score: 91, color: 'blue' },
              ].map((s) => (
                <div key={s.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">{s.name}</span>
                    <span className="text-slate-500 font-bold">{s.score}/100</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full bg-${s.color}-500 rounded-full`}
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
