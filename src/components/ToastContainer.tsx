import React from 'react';
import { ToastMessage } from '../types';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-12 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';
        const isSuccess = toast.type === 'success';

        let bg = 'bg-[#1c2b3c]';
        let border = 'border-[#424754]';
        let text = 'text-[#adc6ff]';

        if (isError) {
          bg = 'bg-[#051424]';
          border = 'border-[#ffb4ab]';
          text = 'text-[#ffb4ab]';
        } else if (isWarning) {
          bg = 'bg-[#051424]';
          border = 'border-[#ffb786]';
          text = 'text-[#ffb786]';
        } else if (isSuccess) {
          bg = 'bg-[#051424]';
          border = 'border-[#4edea3]';
          text = 'text-[#4edea3]';
        }

        return (
          <div
            key={toast.id}
            className={`${bg} border ${border} rounded-lg p-3 shadow-2xl flex items-start gap-3 pointer-events-auto animate-toast font-mono-data text-[12px]`}
          >
            {isError ? (
              <AlertTriangle className={`w-4 h-4 ${text} mt-0.5 flex-shrink-0`} />
            ) : isSuccess ? (
              <CheckCircle className={`w-4 h-4 ${text} mt-0.5 flex-shrink-0`} />
            ) : (
              <Info className={`w-4 h-4 ${text} mt-0.5 flex-shrink-0`} />
            )}

            <div className="flex flex-col flex-1">
              <span className={`font-bold text-[11px] ${text} uppercase`}>{toast.title}</span>
              <span className="text-[#d4e4fa] text-[11px] leading-snug font-inter mt-0.5">
                {toast.message}
              </span>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#8c909f] hover:text-[#d4e4fa] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
