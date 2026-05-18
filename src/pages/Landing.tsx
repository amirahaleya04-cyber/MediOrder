import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { 
  ShieldCheck, 
  Zap, 
  BarChart, 
  ArrowRight, 
  CheckCircle,
  Building2,
  Stethoscope,
  Globe
} from 'lucide-react';

const Nav = () => (
  <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full absolute top-0 left-0 right-0 z-50">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-medical-600 flex items-center justify-center text-white font-bold">M</div>
      <span className="text-xl font-display font-bold text-slate-900">MediOrder</span>
    </div>
    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
      <a href="#features" className="hover:text-medical-600 transition-colors">Features</a>
      <a href="#solutions" className="hover:text-medical-600 transition-colors">Solutions</a>
      <a href="#testimonials" className="hover:text-medical-600 transition-colors">Success Stories</a>
    </div>
    <div className="flex items-center gap-4">
      <Link to="/dashboard" className="text-sm font-semibold text-slate-900">Log In</Link>
      <Link to="/dashboard" className="bg-medical-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-medical-700 transition-all shadow-lg shadow-medical-600/20">
        Get Started
      </Link>
    </div>
  </nav>
);

const Hero = () => {
  const handleScheduleDemo = () => {
    toast.success('Demo request sent! Our team will contact you shortly.', {
      description: 'We will reach out to schedule a 15-minute walkthrough.'
    });
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-medical-600/30 blur-[120px] rounded-full" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-medical-50 text-medical-600 text-xs font-bold tracking-wider uppercase mb-6">
            Next-Gen Healthcare Logistics
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 mb-6 leading-tight">
            Precision Procurement <br />
            <span className="text-medical-600">for Modern Medicine</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            The all-in-one digital supply chain platform built specifically for Malaysian clinics. 
            Automate inventory, streamline purchase orders, and ensure zero-stockouts with AI-powered forecasting.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-medical-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-medical-700 transition-all shadow-xl shadow-medical-600/25">
              Launch Platform <ArrowRight size={20} />
            </Link>
            <button 
              onClick={handleScheduleDemo}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              Schedule Demo
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 relative px-4"
        >
          <div className="relative mx-auto max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 aspect-video group">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2000" 
              alt="Dashboard Preview"
              className="w-full h-full object-cover grayscale-[0.2] transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <button 
                onClick={() => toast.info('Playing platform overview video...')}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 cursor-pointer hover:scale-110 transition-transform"
              >
                <Zap fill="currentColor" size={32} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, description, color }: any) => (
  <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-medical-600/20 transition-all group">
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

const Features = () => (
  <section id="features" className="py-24 bg-slate-50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Built for Clinical Excellence</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          We handle the logistics so you can focus on patient care. MediOrder bridges the gap between suppliers and surgery.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={ShieldCheck}
          title="Compliance Built-in"
          description="Every PO meets KKM and local regulatory standards automatically. Audit-ready reports with one click."
          color="bg-medical-600"
        />
        <FeatureCard 
          icon={Zap}
          title="Instant Procurement"
          description="Connect directly to approved Malaysian distributors. No more phone calls or manual order tracking."
          color="bg-brand-cyan"
        />
        <FeatureCard 
          icon={BarChart}
          title="Inventory Insights"
          description="Predict when youll run out of critical supplies using our proprietary historical usage algorithms."
          color="bg-brand-blue"
        />
      </div>
    </div>
  </section>
);

const Stats = () => (
  <section className="py-20 bg-medical-600">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
        <div>
          <div className="text-4xl font-bold mb-2">500+</div>
          <div className="text-medical-50/70 text-sm font-medium uppercase tracking-wider">Clinics Onboarded</div>
        </div>
        <div>
          <div className="text-4xl font-bold mb-2">2M+</div>
          <div className="text-medical-50/70 text-sm font-medium uppercase tracking-wider">Items Delivered</div>
        </div>
        <div>
          <div className="text-4xl font-bold mb-2">99.9%</div>
          <div className="text-medical-50/70 text-sm font-medium uppercase tracking-wider">Order Accuracy</div>
        </div>
        <div>
          <div className="text-4xl font-bold mb-2">40%</div>
          <div className="text-medical-50/70 text-sm font-medium uppercase tracking-wider">Cost Reduction</div>
        </div>
      </div>
    </div>
  </section>
);

const Solutions = () => (
  <section id="solutions" className="py-24 bg-white relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-16">
        <span className="text-medical-600 font-bold text-sm tracking-widest uppercase">Tailored Solutions</span>
        <h2 className="text-4xl font-bold text-slate-900 mt-2">One Platform, Endless Possibilities</h2>
        <p className="text-slate-600 mt-4 max-w-2xl">
          Whether you are a solo practitioner or a multi-state hospital network, MediOrder scales with your clinical needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Large Featured Solutions */}
        <div className="md:col-span-2 p-10 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group">
          <div className="relative z-10 max-w-sm">
            <div className="w-12 h-12 rounded-2xl bg-medical-500/20 flex items-center justify-center text-medical-400 mb-6 border border-medical-500/30">
              <Building2 size={24} />
            </div>
            <h3 className="text-3xl font-bold mb-4">Enterprise Hub</h3>
            <p className="text-slate-400 leading-relaxed mb-8">
              Centralized procurement for hospital groups. Manage hundreds of clinics from a single dashboard with global inventory visibility.
            </p>
            <button className="flex items-center gap-2 font-bold text-medical-400 hover:text-white transition-colors">
              Explore Enterprise <ArrowRight size={18} />
            </button>
          </div>
          {/* Abstract UI Element */}
          <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-gradient-to-l from-medical-600/20 to-transparent pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-medical-600/10 blur-3xl rounded-full" />
        </div>

        {/* Square Solutions 1 */}
        <div className="p-10 rounded-[2.5rem] bg-medical-50 border border-medical-100 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-medical-600 flex items-center justify-center text-white mb-6">
              <Stethoscope size={24} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Private Practice</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Simplified ordering for independent GPs. Get the same wholesale rates as big hospitals without the volume requirements.
            </p>
          </div>
          <Link to="/dashboard" className="mt-8 text-medical-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>

        {/* Square Solutions 2 */}
        <div className="p-10 rounded-[2.5rem] bg-emerald-50 border border-emerald-100 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mb-6">
              <Globe size={24} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Pharmacy Link</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Direct-to-clinic distribution for pharmaceutical wholesalers. List your products and manage orders with real-time stock sync.
            </p>
          </div>
          <button className="mt-8 text-emerald-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
            Join as Supplier <ArrowRight size={16} />
          </button>
        </div>

        {/* Large Featured Solutions 2 */}
        <div className="md:col-span-2 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-200 relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Intelligence AI</h3>
            <p className="text-slate-600 leading-relaxed max-w-md mb-8">
              Predictive analytics that understand your clinic usage. MediOrder anticipates seasonal demand for medicines so you never run dry.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Demand Forecast</p>
                <p className="text-xl font-bold text-medical-600">+22%</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stock Health</p>
                <p className="text-xl font-bold text-emerald-600">Optimal</p>
              </div>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-medical-50 opacity-40 blur-3xl rounded-full" />
        </div>
      </div>
    </div>
  </section>
);

const Testimonials = () => (
  <section id="testimonials" className="py-24 bg-slate-50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-slate-900">Trusted by Malaysias Top Practices</h2>
        <p className="text-slate-500 mt-2">Hear from the surgeons and administrators using MediOrder daily.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            name: "Dr. Raymond Ng",
            role: "Chief Surgeon, Klinik Specialist Permai",
            quote: "MediOrder saved us 15 hours a week in manual coordination. Procurement is now a 5-minute task instead of a day-long headache.",
            image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200"
          },
          {
            name: "Siti Aminah",
            role: "Operations Manager, HealthFirst Group",
            quote: "Managing 12 clinics was impossible before MediOrder. Now we have total transparency on spend and stock across every location.",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
          },
          {
            name: "Dr. Ariff Ibrahim",
            role: "Founder, City Family Clinic",
            quote: "The interface is so clean. My nurses learned to use it in 10 minutes. It has completely modernized how we stock our pharmacy.",
            image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200"
          }
        ].map((t, i) => (
          <div key={i} className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all">
            <div className="flex gap-1 text-amber-400 mb-6">
              {[...Array(5)].map((_, i) => <CheckCircle key={i} size={16} fill="currentColor" />)}
            </div>
            <p className="text-slate-700 italic leading-relaxed mb-8">"{t.quote}"</p>
            <div className="flex items-center gap-4">
              <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover grayscale-[0.5] hover:grayscale-0 transition-all" />
              <div>
                <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <Hero />
      <Features />
      <Stats />
      <Solutions />
      <Testimonials />
      
      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-medical-600 flex items-center justify-center text-white font-bold text-xs">M</div>
            <span className="text-lg font-display font-bold text-slate-900">MediOrder</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-medical-600">Privacy</a>
            <a href="#" className="hover:text-medical-600">Terms</a>
            <a href="#" className="hover:text-medical-600">Contact</a>
          </div>
          <p className="text-sm text-slate-400">© 2024 MediOrder Malaysia. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
