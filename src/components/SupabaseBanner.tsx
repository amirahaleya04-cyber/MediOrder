import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SupabaseBanner: React.FC = () => {
  const { isFallback } = useAuth();

  if (!isFallback) return null;

  return (
    <div className="bg-[#FFF9EB] border-b border-[#FBE3B8] px-6 py-2.5 flex items-center justify-between text-xs text-[#8A5C0E] gap-3 font-sans shrink-0">
      <div className="flex items-center gap-2">
        <AlertCircle size={14} className="text-[#D97706] shrink-0" />
        <span>
          <strong>Local Fallback Mode:</strong> Running simulation authentication. Back up your platform with real cloud auth by defining <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in project Settings.
        </span>
      </div>
    </div>
  );
};
