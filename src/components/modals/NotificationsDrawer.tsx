import React from 'react';
import { ToastMessage } from '../../types';
import { X, Bell, AlertTriangle, Info, CheckCircle2, Trash2 } from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ToastMessage[];
  onClearAll: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#122131] border-l border-[#424754] h-full shadow-2xl flex flex-col font-inter animate-toast">
        <div className="p-4 border-b border-[#424754] flex justify-between items-center bg-[#1c2b3c]">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#adc6ff]" />
            <h3 className="font-bold text-[16px] text-[#d4e4fa]">Network Alerts & Events</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#8c909f] hover:text-[#d4e4fa]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 flex justify-between items-center border-b border-[#424754]/40 text-[11px] font-mono-data">
          <span className="text-[#8c909f]">Total Events ({notifications.length})</span>
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[#ffb4ab] hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear All
            </button>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 font-mono-data text-[12px]">
          {notifications.length === 0 ? (
            <div className="text-center text-[#8c909f] py-12">No active network alerts.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-lg border flex flex-col gap-1 ${
                  n.type === 'error'
                    ? 'bg-[#690005]/20 border-[#ffb4ab]/50 text-[#ffb4ab]'
                    : n.type === 'warning'
                    ? 'bg-[#502400]/20 border-[#ffb786]/50 text-[#ffb786]'
                    : 'bg-[#051424] border-[#424754] text-[#d4e4fa]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    {n.type === 'error' ? (
                      <AlertTriangle className="w-4 h-4 text-[#ffb4ab]" />
                    ) : (
                      <Info className="w-4 h-4 text-[#adc6ff]" />
                    )}
                    <span>{n.title}</span>
                  </div>
                  <span className="text-[10px] opacity-70">
                    {new Date(n.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-[#c2c6d6] leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
