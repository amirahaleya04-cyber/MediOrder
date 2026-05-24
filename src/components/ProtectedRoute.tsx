import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            {/* Spinning ring */}
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-medical-600 border-t-transparent rounded-full animate-spin" />
            <span className="font-display font-black text-xs text-medical-600">M</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 text-sm">Validating Session...</h4>
            <p className="text-xs text-slate-400">Verifying secure clinical logs</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save current location as state for post-login redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-medical-600 border-t-transparent rounded-full animate-spin" />
            <span className="font-display font-black text-xs text-medical-600">M</span>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
