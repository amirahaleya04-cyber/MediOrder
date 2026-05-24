import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { 
  BarChart3, 
  FilePlus, 
  FileText, 
  HelpCircle, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  Package, 
  Settings, 
  User, 
  X,
  Bell,
  Search,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ClipboardList
} from 'lucide-react';

// Context & Guards
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { SupabaseBanner } from './components/SupabaseBanner';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreateOrder from './pages/CreateOrder';
import OrderPreview from './pages/OrderPreview';
import Faq from './pages/Faq';
import ClinicProfile from './pages/ClinicProfile';
import StaffManagement from './pages/StaffManagement';
import SupplierManagement from './pages/SupplierManagement';
import MedicineCatalog from './pages/MedicineCatalog';
import ClinicInventory from './pages/ClinicInventory';
import OrderHistory from './pages/OrderHistory';
import Insights from './pages/Insights';
import Login from './pages/Login';
import Register from './pages/Register';

const Sidebar = ({ isOpen, toggle }: { isOpen: boolean, toggle: () => void }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BarChart3, label: 'Insights', path: '/insights' },
    { icon: FilePlus, label: 'Create PO', path: '/create-po' },
    { icon: FileText, label: 'Order History', path: '/orders' },
    { icon: ClipboardList, label: 'Clinic Inventory', path: '/inventory' },
    { icon: Package, label: 'Supplier Catalog', path: '/catalog' },
    { icon: User, label: 'Staff / PIC', path: '/staff' },
    { icon: Building2, label: 'Suppliers', path: '/suppliers' },
    { icon: Settings, label: 'Clinic Profile', path: '/profile' },
    { icon: HelpCircle, label: 'Support & FAQ', path: '/faq' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  const displayClinic = user?.user_metadata?.clinic_name || 'My Clinic';

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggle}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -300 }}
        className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-all duration-300 ease-in-out lg:relative lg:translate-x-0"
      >
        <div className="p-6 flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-medical-600 flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="text-xl font-display font-bold text-medical-700 tracking-tight">MediOrder</span>
          </Link>
          <button onClick={toggle} className="ml-auto lg:hidden text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-medical-50 text-medical-600 font-medium' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
                onClick={() => {
                  if (window.innerWidth < 1024) toggle();
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link 
            to="/profile"
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-700 cursor-pointer rounded-xl hover:bg-slate-50 transition-colors"
          >
            <User size={20} />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs truncate text-slate-400">{displayClinic}</p>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 transition-colors cursor-pointer rounded-xl hover:bg-red-50/50"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

const Header = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => {
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      toast.info(`Searching for: ${search}`);
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  
  // Get initials
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((name: string) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'US';

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6">
      <button onClick={onToggleSidebar} className="lg:hidden p-2 text-slate-500">
        <Menu size={20} />
      </button>
      <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders, suppliers, or products..."
          className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-medical-600/20 focus:border-medical-600 transition-all font-sans"
        />
      </form>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => toast.info('No new notifications')}
          className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button 
          onClick={() => toast.info(`User: ${displayName} (${user?.email || 'Demo session'})`)}
          className="w-8 h-8 rounded-full bg-medical-50 text-medical-600 flex items-center justify-center font-bold text-xs ring-2 ring-medical-600/10 hover:ring-medical-600/30 transition-all"
        >
          {initials}
        </button>
      </div>
    </header>
  );
};

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const isAuthOrLandingPage = ['/', '/login', '/register'].includes(location.pathname);

  if (isAuthOrLandingPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <SupabaseBanner />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <AppShell>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/faq" element={<Faq />} />

          {/* Guest Only Auth Pages */}
          <Route path="/login" element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          } />
          <Route path="/register" element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          } />

          {/* Secure Protected Clinical Pages */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/create-po" element={
            <ProtectedRoute>
              <CreateOrder />
            </ProtectedRoute>
          } />
          <Route path="/po-preview" element={
            <ProtectedRoute>
              <OrderPreview />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          } />
          <Route path="/insights" element={
            <ProtectedRoute>
              <Insights />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ClinicProfile />
            </ProtectedRoute>
          } />
          <Route path="/staff" element={
            <ProtectedRoute>
              <StaffManagement />
            </ProtectedRoute>
          } />
          <Route path="/suppliers" element={
            <ProtectedRoute>
              <SupplierManagement />
            </ProtectedRoute>
          } />
          <Route path="/inventory" element={
            <ProtectedRoute>
              <ClinicInventory />
            </ProtectedRoute>
          } />
          <Route path="/catalog" element={
            <ProtectedRoute>
              <MedicineCatalog />
            </ProtectedRoute>
          } />

          {/* Fallback Catch */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </AppShell>
    </AuthProvider>
  );
}
