import React from 'react';
import { X, BookOpen, Code2, Server, CheckCircle2, ShieldCheck } from 'lucide-react';

interface InfoModalProps {
  type: 'doc' | 'api' | 'status' | null;
  onClose: () => void;
}

export const InfoModals: React.FC<InfoModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#122131] border border-[#424754] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col font-inter animate-toast max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#424754] flex justify-between items-center bg-[#1c2b3c]">
          <div className="flex items-center gap-2">
            {type === 'doc' && <BookOpen className="w-5 h-5 text-[#adc6ff]" />}
            {type === 'api' && <Code2 className="w-5 h-5 text-[#4edea3]" />}
            {type === 'status' && <Server className="w-5 h-5 text-[#ffb786]" />}
            <h3 className="font-bold text-[16px] text-[#d4e4fa]">
              {type === 'doc' && 'Network Flow & Transmission Architecture Docs'}
              {type === 'api' && 'REST / gRPC Telemetry API Reference'}
              {type === 'status' && 'Global Edge Infrastructure Status'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#8c909f] hover:text-[#d4e4fa]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto font-inter text-[13px] leading-relaxed text-[#c2c6d6]">
          {type === 'doc' && (
            <div className="flex flex-col gap-3">
              <p>
                The <strong>Live Network Traffic - Secure Transmission Control System</strong> combines maximum-flow graph theory (Dinic's and Edmonds-Karp algorithms) with real-time post-quantum Kyber-768 key exchange and 3D virtual planet telemetry.
              </p>
              <h4 className="font-bold text-[#adc6ff] text-[14px]">Key Subsystems:</h4>
              <ul className="list-disc pl-5 flex flex-col gap-1.5 font-mono-data text-[12px]">
                <li><strong>3D Virtual Globe:</strong> Real-time orbital rendering of transatlantic fiber routes and orbital links using Three.js shader-based glow and quadratic bezier arcs.</li>
                <li><strong>2D Abstract Mesh:</strong> Real-time residual capacity solver displaying bottleneck alerts and shortest augmenting flow paths.</li>
                <li><strong>Automatic Rerouting:</strong> High-speed failover mitigation triggers sub-second reroutes upon dropped links or saturated packet queues.</li>
              </ul>
            </div>
          )}

          {type === 'api' && (
            <div className="flex flex-col gap-3 font-mono-data text-[12px]">
              <p className="text-[#8c909f]">Available gRPC / REST API Endpoints for external orchestration:</p>
              <div className="p-3 bg-[#051424] rounded border border-[#424754]">
                <div className="text-[#4edea3] font-bold">GET /api/v1/telemetry/live</div>
                <div className="text-[#8c909f] text-[11px] mt-1">Returns throughput (Gbps), packet loss (%), global latency (ms), and active bottleneck paths.</div>
              </div>
              <div className="p-3 bg-[#051424] rounded border border-[#424754]">
                <div className="text-[#adc6ff] font-bold">POST /api/v1/flow/optimize</div>
                <div className="text-[#8c909f] text-[11px] mt-1">Executes Dinic's blocking flow pass and generates updated BGP / WireGuard routing tables.</div>
              </div>
              <div className="p-3 bg-[#051424] rounded border border-[#424754]">
                <div className="text-[#ffb786] font-bold">POST /api/v1/security/rotate-keys</div>
                <div className="text-[#8c909f] text-[11px] mt-1">Initiates NIST Kyber-768 post-quantum key re-encapsulation across all 7 regional edge hubs.</div>
              </div>
            </div>
          )}

          {type === 'status' && (
            <div className="flex flex-col gap-3 font-mono-data text-[12px]">
              <div className="flex items-center justify-between p-3 bg-[#003824]/40 border border-[#4edea3]/40 rounded text-[#4edea3]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All Global Edge Hubs Operational (99.999% SLA)</span>
                </div>
                <span className="text-[11px] font-bold">NOMINAL</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-[#051424] rounded border border-[#424754]">US-EAST-01 (Virginia): <span className="text-[#4edea3]">45% Load</span></div>
                <div className="p-2 bg-[#051424] rounded border border-[#424754]">EU-WEST-02 (Frankfurt): <span className="text-[#4edea3]">62% Load</span></div>
                <div className="p-2 bg-[#051424] rounded border border-[#424754]">JP-EAST-03 (Tokyo): <span className="text-[#ffb786]">88% Load</span></div>
                <div className="p-2 bg-[#051424] rounded border border-[#424754]">SG-CENT-04 (Singapore): <span className="text-[#ffb4ab]">94% Load</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#424754] bg-[#0d1c2d] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#adc6ff] text-[#002e6a] font-mono-data font-bold text-[12px] rounded hover:bg-[#d8e2ff]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
