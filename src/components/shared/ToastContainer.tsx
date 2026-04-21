import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: { id: string; message: string; type: string }; onRemove: (id: string) => void }) {
  const config = {
    success: { icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon_color: 'text-green-500' },
    error: { icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon_color: 'text-red-500' },
    warning: { icon: AlertCircle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon_color: 'text-amber-500' },
    info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon_color: 'text-blue-500' },
  }[toast.type as 'success' | 'error' | 'warning' | 'info'] || { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon_color: 'text-blue-500' };

  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${config.bg} ${config.border} animate-fade-in`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.icon_color}`} />
      <p className={`flex-1 text-sm font-medium ${config.text}`}>{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className={`${config.text} hover:opacity-70 transition-opacity`}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
