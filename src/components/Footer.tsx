import React from 'react';
import { ShieldCheck, Activity, Terminal } from 'lucide-react';

interface FooterProps {
  latency: number;
  systemHealth: 'NOMINAL' | 'DEGRADED' | 'ERROR';
  onOpenDocModal: () => void;
  onOpenApiModal: () => void;
  onOpenStatusModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  latency,
  systemHealth,
  onOpenDocModal,
  onOpenApiModal,
  onOpenStatusModal,
}) => {
  return (
    <footer className="bg-[#010f1f] text-[#d4e4fa] w-full flex justify-between items-center px-4 py-1.5 z-40 border-t border-[#424754] flex-shrink-0 select-none text-[10px] font-mono-data">
      {/* Left Status string */}
      <div className="flex items-center gap-2 text-[#8c909f]">
        <span>SYSTEM HEALTH:</span>
        <span
          className={`font-bold flex items-center gap-1 ${
            systemHealth === 'NOMINAL'
              ? 'text-[#4edea3]'
              : systemHealth === 'DEGRADED'
              ? 'text-[#ffb786]'
              : 'text-[#ffb4ab]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {systemHealth}
        </span>
        <span className="text-[#424754]">•</span>
        <span>LATENCY:</span>
        <span className="text-[#adc6ff] font-bold">{Math.round(latency)} MS</span>
        <span className="text-[#424754]">•</span>
        <span className="text-[#4edea3] font-bold">OPTIMIZER ACTIVE</span>
        <span className="hidden sm:inline text-[#424754]">•</span>
        <span className="hidden sm:inline text-[#8c909f]">TLS 1.3 QUANTUM TUNNEL</span>
      </div>

      {/* Right Navigation / Info Links */}
      <div className="flex items-center gap-4 text-[#8c909f]">
        <button
          onClick={onOpenDocModal}
          className="hover:text-[#adc6ff] transition-colors cursor-pointer"
        >
          Documentation
        </button>
        <button
          onClick={onOpenApiModal}
          className="hover:text-[#adc6ff] transition-colors cursor-pointer"
        >
          API Reference
        </button>
        <button
          onClick={onOpenStatusModal}
          className="hover:text-[#adc6ff] transition-colors cursor-pointer"
        >
          Status
        </button>
      </div>
    </footer>
  );
};
