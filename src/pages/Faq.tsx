import React from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { 
  HelpCircle, 
  MessageSquare, 
  Globe, 
  ShieldCheck, 
  Truck, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => (
  <div 
    onClick={() => toast.info(`Help: ${question}`, { description: answer })}
    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <h3 className="font-bold text-slate-900 group-hover:text-medical-600 transition-colors">{question}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{answer}</p>
      </div>
      <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-medical-50 group-hover:text-medical-600 transition-all">
        <ChevronRight size={18} />
      </div>
    </div>
  </div>
);

export default function Faq() {
  const faqs = [
    {
      question: "Which suppliers are integrated with MediOrder?",
      answer: "We are currently integrated with major Malaysian distributors including PharmaDirect, Medisupply, and Zuellig Pharma. We are constantly adding new suppliers to the network."
    },
    {
      question: "How long does delivery typically take?",
      answer: "Standard delivery within Klang Valley is 24-48 hours. For other regions in West Malaysia, it usually takes 3-5 business days. East Malaysia deliveries depend on flight schedules."
    },
    {
      question: "Is the platform KKM compliant?",
      answer: "Yes, MediOrder is built to meet all Malaysian Ministry of Health (KKM) documentation requirements for clinic procurement. All digital POs are structured to be audit-ready."
    },
    {
      question: "Can I track my shipments in real-time?",
      answer: "Absolutely. Once a supplier marks an order as 'Sent', you will receive a tracking ID and can monitor the vehicle's progress directly from your dashboard."
    },
    {
      question: "Is there a limit to how many items I can order?",
      answer: "There are no platform limits, however, individual suppliers may have minimum order quantities (MOQ) or stock constraints which will be highlighted during the PO creation flow."
    }
  ];

  const handleResourceClick = (title: string) => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), {
      loading: `Opening ${title} portal...`,
      success: `${title} portal opened in a secure tab.`,
      error: 'Failed to open resource',
    });
  };

  const handleChat = () => {
    toast.success('Live chat initialized. A specialist will be with you shortly.', {
      icon: <MessageSquare className="text-medical-600" />
    });
  };

  const handleEmail = () => {
    toast.info('Opening your email client...', {
      description: 'Support email: help@mediorder.com.my'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-medical-50 text-medical-600 flex items-center justify-center mx-auto shadow-sm">
          <HelpCircle size={32} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900">MediOrder Support</h1>
        <p className="text-slate-500 max-w-xl mx-auto">
          Need help? Explore our frequently asked questions or contact our dedicated clinical logistics team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Globe size={24} />
          </div>
          <h3 className="font-bold">National Support</h3>
          <p className="text-xs text-slate-500">24/7 technical assistance for Malaysian clinics.</p>
          <button 
            onClick={() => handleResourceClick('Regional Centers')}
            className="text-xs font-bold text-blue-600 flex items-center gap-1 mx-auto hover:underline"
          >
            View Regional Centers <ExternalLink size={12} />
          </button>
        </div>
        <div className="p-6 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-medical-50 text-medical-600 flex items-center justify-center mx-auto">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-bold">Compliance</h3>
          <p className="text-xs text-slate-500">Documentation regarding KKM & SST standards.</p>
          <button 
            onClick={() => handleResourceClick('Compliance Docs')}
            className="text-xs font-bold text-medical-600 flex items-center gap-1 mx-auto hover:underline"
          >
            Read Docs <ExternalLink size={12} />
          </button>
        </div>
        <div className="p-6 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Truck size={24} />
          </div>
          <h3 className="font-bold">Logistics</h3>
          <p className="text-xs text-slate-500">Information on delivery hubs and partners.</p>
          <button 
            onClick={() => handleResourceClick('Logistics Network')}
            className="text-xs font-bold text-amber-600 flex items-center gap-1 mx-auto hover:underline"
          >
            Partner Network <ExternalLink size={12} />
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FaqItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-medical-600/20 blur-[80px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="space-y-2 relative z-10">
          <h3 className="text-2xl font-bold font-display">Still have questions?</h3>
          <p className="text-slate-400 max-w-sm">
            Our team of pharmaceutical logistics experts are ready to assist you.
          </p>
        </div>
        <div className="flex gap-4 relative z-10 w-full md:w-auto">
          <button 
            onClick={handleChat}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-medical-600 hover:bg-medical-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-medical-600/20"
          >
            <MessageSquare size={18} /> Chat with Us
          </button>
          <button 
            onClick={handleEmail}
            className="flex-1 md:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold transition-all"
          >
            Email Support
          </button>
        </div>
      </div>
    </div>
  );
}
