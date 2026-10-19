import React from 'react';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`toast-card toast-${toast.type}`}
        >
          {toast.type === 'success' && <CheckCircle2 size={18} color="var(--primary)" />}
          {toast.type === 'info' && <Info size={18} color="var(--info)" />}
          {toast.type === 'error' && <AlertTriangle size={18} color="var(--danger)" />}
          <span>{toast.text}</span>
        </div>
      ))}
    </div>
  );
};
