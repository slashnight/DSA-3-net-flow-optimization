import React from 'react';
import { DataCenterHub, LiveMetrics } from '../../types';
import { Activity, ShieldCheck, Zap, Server, Globe, ArrowUpRight, Cpu } from 'lucide-react';

interface AnalysisScreenProps {
  hubs: DataCenterHub[];
  metrics: LiveMetrics;
}

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ hubs, metrics }) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto bg-[#051424] flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#424754] pb-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#adc6ff] font-inter">
            Deep Telemetry & Flow Performance Profiler
          </h2>
          <p className="text-[12px] text-[#8c909f]">
            Comprehensive real-time analysis of packet streams, congestion windows, and regional latency.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#122131] border border-[#424754] rounded font-mono-data text-[11px] text-[#4edea3] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Kyber-768 Encryption Active
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#122131] p-4 rounded-lg border border-[#424754] font-mono-data">
          <div className="text-[10px] text-[#8c909f] font-bold uppercase mb-1">Global Ingress / Egress</div>
          <div className="text-[24px] font-bold text-[#adc6ff]">
            {metrics.totalThroughput.toFixed(1)} <span className="text-[12px] text-[#8c909f]">Gbps</span>
          </div>
          <div className="text-[11px] text-[#4edea3] flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +12.4% vs last interval
          </div>
        </div>

        <div className="bg-[#122131] p-4 rounded-lg border border-[#424754] font-mono-data">
          <div className="text-[10px] text-[#8c909f] font-bold uppercase mb-1">Network Jitter & Dispersion</div>
          <div className="text-[24px] font-bold text-[#4edea3]">
            1.4 <span className="text-[12px] text-[#8c909f]">ms</span>
          </div>
          <div className="text-[11px] text-[#8c909f] mt-1">Sigma &lt; 0.8ms (Optimal)</div>
        </div>

        <div className="bg-[#122131] p-4 rounded-lg border border-[#424754] font-mono-data">
          <div className="text-[10px] text-[#8c909f] font-bold uppercase mb-1">Packet Retransmission</div>
          <div className="text-[24px] font-bold text-[#4edea3]">
            {metrics.packetLoss.toFixed(2)} <span className="text-[12px] text-[#8c909f]">%</span>
          </div>
          <div className="text-[11px] text-[#4edea3] mt-1">Forward Error Correction active</div>
        </div>

        <div className="bg-[#122131] p-4 rounded-lg border border-[#424754] font-mono-data">
          <div className="text-[10px] text-[#8c909f] font-bold uppercase mb-1">Active TLS 1.3 Tunnels</div>
          <div className="text-[24px] font-bold text-[#adc6ff]">566</div>
          <div className="text-[11px] text-[#8c909f] mt-1">Zero dropped handshakes</div>
        </div>
      </div>

      {/* Regional Data Center Load Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#122131] p-5 rounded-lg border border-[#424754] flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-[#424754] pb-2">
            <h3 className="text-[14px] font-bold text-[#d4e4fa] font-inter flex items-center gap-2">
              <Server className="w-4 h-4 text-[#adc6ff]" /> Regional Data Center Capacity & Load
            </h3>
            <span className="font-mono-data text-[10px] text-[#8c909f]">7 Global Zones</span>
          </div>

          <div className="flex flex-col gap-3 font-mono-data">
            {hubs.map((hub) => (
              <div key={hub.id} className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#adc6ff] font-bold">{hub.name}</span>
                  <span className="text-[#8c909f]">
                    {hub.load}% Load • <span className="text-[#4edea3]">{hub.ping}ms</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-[#051424] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      hub.load > 85
                        ? 'bg-[#ffb4ab]'
                        : hub.load > 70
                        ? 'bg-[#ffb786]'
                        : 'bg-[#4edea3]'
                    }`}
                    style={{ width: `${hub.load}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Protocol & Routing Optimization breakdown */}
        <div className="bg-[#122131] p-5 rounded-lg border border-[#424754] flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-[#424754] pb-2">
            <h3 className="text-[14px] font-bold text-[#d4e4fa] font-inter flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#4edea3]" /> Transport Protocol Distribution
            </h3>
            <span className="font-mono-data text-[10px] text-[#4edea3]">100% Hardware Accelerated</span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 font-mono-data">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#adc6ff]">HTTP/3 & QUIC (BBRv3 Congestion)</span>
                <span className="font-bold text-[#adc6ff]">62.4%</span>
              </div>
              <div className="w-full h-2 bg-[#051424] rounded-full overflow-hidden">
                <div className="h-full bg-[#adc6ff] rounded-full" style={{ width: '62.4%' }} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 font-mono-data">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#4edea3]">WireGuard Kernel Tunnel</span>
                <span className="font-bold text-[#4edea3]">24.8%</span>
              </div>
              <div className="w-full h-2 bg-[#051424] rounded-full overflow-hidden">
                <div className="h-full bg-[#4edea3] rounded-full" style={{ width: '24.8%' }} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 font-mono-data">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#ffb786]">IPsec / Quantum Kyber Tunnel</span>
                <span className="font-bold text-[#ffb786]">12.8%</span>
              </div>
              <div className="w-full h-2 bg-[#051424] rounded-full overflow-hidden">
                <div className="h-full bg-[#ffb786] rounded-full" style={{ width: '12.8%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#051424] rounded border border-[#424754] text-[11px] text-[#c2c6d6] leading-relaxed">
            <span className="font-bold text-[#adc6ff]">Automated Traffic Engineering Rule:</span> Multipath TCP (MPTCP) is dynamically rerouting packet bursts from saturated transatlantic paths to sub-sea Indian Ocean fiber trunks with zero packet dropping.
          </div>
        </div>
      </div>
    </div>
  );
};
