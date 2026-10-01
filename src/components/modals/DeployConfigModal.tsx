import React, { useState } from 'react';
import { X, Check, Copy, Download, Send, ShieldCheck, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DeployConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  throughput: number;
}

export const DeployConfigModal: React.FC<DeployConfigModalProps> = ({ isOpen, onClose, throughput }) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generatedConfig = {
    version: '2026.4.1-quantum',
    cluster_id: 'GLOBAL-CORE-EDGE-CLUSTER',
    timestamp: new Date().toISOString(),
    security: {
      encryption: 'Kyber-768-AES-256-GCM',
      zero_knowledge_attestation: true,
      forward_secrecy: 'ECDHE-Kyber768',
      hardware_acceleration: 'AVX-512-VAES',
    },
    flow_optimizer: {
      algorithm: 'Dinics-MaxFlow-SIMD',
      target_throughput_gbps: parseFloat(throughput.toFixed(1)),
      max_bottleneck_threshold_mbps: 1200,
      auto_failover_latency_ms: 25,
      multipath_quic_enabled: true,
    },
    routes: [
      { id: 'S-A', max_cap_mbps: 1000, priority: 'HIGH', safe_mode: true },
      { id: 'A-C', max_cap_mbps: 1200, priority: 'CRITICAL', safe_mode: true },
      { id: 'C-T', max_cap_mbps: 1000, priority: 'HIGH', safe_mode: true },
      { id: 'S-B', max_cap_mbps: 1000, priority: 'SECONDARY', safe_mode: true },
      { id: 'B-D', max_cap_mbps: 800, priority: 'NORMAL', safe_mode: true },
      { id: 'D-T', max_cap_mbps: 1000, priority: 'NORMAL', safe_mode: true },
    ],
  };

  const configText = JSON.stringify(generatedConfig, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(configText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      setIsDeployed(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#adc6ff', '#4edea3', '#ffb786'],
      });
      setTimeout(() => {
        setIsDeployed(false);
        onClose();
      }, 2500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#122131] border border-[#424754] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col font-inter animate-toast">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#424754] flex justify-between items-center bg-[#1c2b3c]">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-[#adc6ff]" />
            <h3 className="font-bold text-[16px] text-[#d4e4fa]">
              Deploy Edge Network Flow Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8c909f] hover:text-[#d4e4fa] hover:bg-[#273647]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          <p className="text-[13px] text-[#c2c6d6] leading-relaxed">
            Verify and deploy the current maximum-flow routing topology, Kyber-768 encryption credentials, and link capacity bounds to the 7 global edge data centers.
          </p>

          <div className="relative">
            <pre className="bg-[#051424] p-3.5 rounded border border-[#424754] font-mono-data text-[11px] text-[#adc6ff] max-h-64 overflow-y-auto leading-relaxed">
              {configText}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 px-2 py-1 bg-[#1c2b3c] border border-[#424754] hover:border-[#adc6ff] rounded text-[10px] font-mono-data text-[#d4e4fa] flex items-center gap-1 shadow transition-all"
            >
              {copied ? <Check className="w-3 h-3 text-[#4edea3]" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-[#003824]/40 border border-[#00a572]/40 rounded text-[12px] text-[#4edea3]">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>Cryptographic signature validated (SHA-512 Ed25519)</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#424754] bg-[#0d1c2d] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-[12px] font-mono-data text-[#8c909f] hover:text-[#d4e4fa] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeploy}
            disabled={isDeploying || isDeployed}
            className="px-5 py-2 bg-[#adc6ff] hover:bg-[#d8e2ff] text-[#002e6a] font-mono-data font-bold text-[12px] rounded flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isDeployed ? (
              <>
                <Check className="w-4 h-4 text-[#003824]" /> Deployed to 7 Edge Hubs!
              </>
            ) : isDeploying ? (
              <>
                <Send className="w-4 h-4 animate-bounce" /> Broadcasting Payload...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Deploy Configuration Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
