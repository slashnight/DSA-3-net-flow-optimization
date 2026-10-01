import React, { useState } from 'react';
import {
  X,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Server,
  Globe,
  Radio,
  Clock,
  Gauge,
  Layers,
  Sparkles,
  Download,
  RotateCcw,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Award,
} from 'lucide-react';
import { CandidateRoute, CompletedTransferRouteInfo, TransmissionMode } from '../../types';

interface RouteAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeInfo: CompletedTransferRouteInfo | null;
  onSelectRouteForNextTransfer?: (routeId: string) => void;
  onRetestTransfer?: () => void;
}

export const RouteAnalysisModal: React.FC<RouteAnalysisModalProps> = ({
  isOpen,
  onClose,
  routeInfo,
  onSelectRouteForNextTransfer,
  onRetestTransfer,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    routeInfo?.selectedRoute.id || routeInfo?.fastestRoute.id || 'route-alpha'
  );
  const [activeTab, setActiveTab] = useState<'comparison' | 'hops' | 'insights'>('comparison');

  if (!isOpen || !routeInfo) return null;

  const isSending = routeInfo.mode === 'send';
  const activeRoute =
    routeInfo.allCandidateRoutes.find((r) => r.id === selectedRouteId) || routeInfo.fastestRoute;

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-fadeIn">
      <div className="bg-[#122131] border border-[#adc6ff]/40 rounded-2xl w-full max-w-4xl max-h-[92vh] shadow-[0_10px_50px_rgba(173,198,255,0.2)] overflow-hidden flex flex-col font-inter">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0d1c2d] border-b border-[#424754] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#003824] border border-[#4edea3]/50 text-[#4edea3] shadow-[0_0_15px_rgba(78,222,163,0.3)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-data uppercase px-2 py-0.5 rounded bg-[#003824] text-[#4edea3] font-bold border border-[#4edea3]/30">
                  Transfer Completed Successfully
                </span>
                <span className="text-[11px] font-mono-data text-[#adc6ff] flex items-center gap-1">
                  {isSending ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#adc6ff]" />
                  ) : (
                    <ArrowDownLeft className="w-3.5 h-3.5 text-[#4edea3]" />
                  )}
                  {isSending ? 'Tx Uplink Process' : 'Rx Downlink Process'}
                </span>
                <span className="text-[10px] font-mono-data text-[#8c909f]">
                  at {routeInfo.completedAt}
                </span>
              </div>
              <h2 className="font-bold text-[18px] text-[#d4e4fa] mt-0.5 flex items-center gap-2">
                Node-to-Node Route & Fastest Path Analytics
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8c909f] hover:text-[#d4e4fa] hover:bg-[#1c2b3c] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Node to Node Header Banner */}
        <div className="bg-[#051424] px-6 py-3.5 border-b border-[#424754]/80 flex flex-col md:flex-row items-center justify-between gap-3 font-mono-data text-[12px]">
          {/* Source Node */}
          <div className="flex items-center gap-3 w-full md:w-auto bg-[#122131] px-4 py-2 rounded-lg border border-[#424754]">
            <div className="p-1.5 rounded bg-[#adc6ff]/20 text-[#adc6ff]">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-[#8c909f] uppercase font-bold">
                {isSending ? 'FROM SOURCE NODE (ORIGIN)' : 'FROM TARGET NODE (ORIGIN)'}
              </div>
              <div className="font-bold text-[#d4e4fa] text-[13px]">
                {routeInfo.sourceNode.nodeLabel}
              </div>
              <div className="text-[10px] text-[#adc6ff]">
                IP: {routeInfo.sourceNode.ip} ({routeInfo.sourceNode.dataCenter})
              </div>
            </div>
          </div>

          {/* Direction Arrow & Fastest Badge */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="flex items-center gap-2 text-[#4edea3] font-bold text-[11px] px-3 py-1 bg-[#003824] rounded-full border border-[#4edea3]/40 shadow-sm">
              <Zap className="w-3.5 h-3.5" />
              <span>{isSending ? 'Uplink Flow' : 'Downlink Flow'} ➔</span>
            </div>
            <span className="text-[9px] text-[#8c909f]">
              {routeInfo.totalTransferredMB.toFixed(1)} MB Payload Delivered
            </span>
          </div>

          {/* Target Node */}
          <div className="flex items-center gap-3 w-full md:w-auto bg-[#122131] px-4 py-2 rounded-lg border border-[#424754]">
            <div className="p-1.5 rounded bg-[#4edea3]/20 text-[#4edea3]">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-[#8c909f] uppercase font-bold">
                {isSending ? 'TO DESTINATION NODE (TARGET)' : 'TO CLIENT USER NODE (TARGET)'}
              </div>
              <div className="font-bold text-[#d4e4fa] text-[13px]">
                {routeInfo.targetNode.nodeLabel}
              </div>
              <div className="text-[10px] text-[#4edea3]">
                IP: {routeInfo.targetNode.ip} ({routeInfo.targetNode.dataCenter})
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-[#0d1c2d] border-b border-[#424754] flex gap-2">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 rounded-t-lg font-mono-data text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'comparison'
                ? 'bg-[#122131] text-[#adc6ff] border-[#adc6ff]'
                : 'text-[#8c909f] hover:text-[#d4e4fa] border-transparent'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Fastest Route Comparison & Benchmarks</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#003824] text-[#4edea3]">
              ⭐ 4 Candidates
            </span>
          </button>
          <button
            onClick={() => setActiveTab('hops')}
            className={`px-4 py-2 rounded-t-lg font-mono-data text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'hops'
                ? 'bg-[#122131] text-[#adc6ff] border-[#adc6ff]'
                : 'text-[#8c909f] hover:text-[#d4e4fa] border-transparent'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Hop-by-Hop Node Route Visualizer</span>
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 rounded-t-lg font-mono-data text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'insights'
                ? 'bg-[#122131] text-[#adc6ff] border-[#adc6ff]'
                : 'text-[#8c909f] hover:text-[#d4e4fa] border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fastest Optimization Insights (Send vs Receive)</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 bg-[#051424]/40 font-mono-data">
          {/* TAB 1: Route Comparison */}
          {activeTab === 'comparison' && (
            <div className="flex flex-col gap-4">
              {/* Highlight Banner: Fastest Path Identified */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#003824]/60 via-[#122131] to-[#002e6a]/40 border-2 border-[#4edea3] shadow-[0_0_25px_rgba(78,222,163,0.2)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-[#4edea3] text-[#003824] font-bold shadow-md flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#4edea3] text-[#003824]">
                        FASTEST PATH IDENTIFIED
                      </span>
                      <span className="text-[12px] text-[#4edea3] font-bold">
                        {routeInfo.fastestRoute.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#d4e4fa] font-inter mt-1">
                      Lowest round-trip latency (
                      <span className="text-[#4edea3] font-bold font-mono">
                        {routeInfo.fastestRoute.totalLatencyMs} ms
                      </span>
                      ) and highest capacity (
                      <span className="text-[#adc6ff] font-bold font-mono">
                        {routeInfo.fastestRoute.bottleneckCapacityMbps} Mbps
                      </span>
                      ). Saved{' '}
                      <span className="text-[#4edea3] font-bold">
                        {routeInfo.timeSavedVsAverageSec}s
                      </span>{' '}
                      transit time.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedRouteId(routeInfo.fastestRoute.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#4edea3] text-[#003824] hover:bg-[#6cfbc0] font-bold text-[11px] transition-all flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Inspect Fastest Path
                  </button>
                </div>
              </div>

              {/* Candidate Routes Cards & Comparison Grid */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-[11px] text-[#8c909f]">
                  <span className="uppercase font-bold tracking-wider">
                    Candidate Routes Evaluated between Nodes
                  </span>
                  <span>Click any route to inspect or lock as preferred path</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {routeInfo.allCandidateRoutes.map((route) => {
                    const isSelected = route.id === selectedRouteId;
                    const isFastest = route.isFastest;

                    return (
                      <div
                        key={route.id}
                        onClick={() => setSelectedRouteId(route.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                          isSelected
                            ? 'bg-[#1c2b3c] border-[#adc6ff] shadow-[0_0_15px_rgba(173,198,255,0.25)]'
                            : isFastest
                            ? 'bg-[#122131] border-[#4edea3]/60 hover:border-[#4edea3]'
                            : 'bg-[#122131] border-[#424754] hover:border-[#8c909f]'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[13px] text-[#d4e4fa]">
                                {route.name}
                              </span>
                              {isFastest && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#003824] text-[#4edea3] border border-[#4edea3]/40">
                                  ⭐ FASTEST
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#8c909f] font-inter line-clamp-1 mt-0.5">
                              {route.description}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-[14px] font-bold text-[#adc6ff]">
                              {route.estimatedTransitTimeSec}s
                            </div>
                            <div className="text-[9px] text-[#8c909f]">Transit Time</div>
                          </div>
                        </div>

                        {/* Hops preview */}
                        <div className="flex items-center gap-1.5 text-[10px] text-[#d4e4fa] bg-[#051424] p-2 rounded-lg border border-[#424754]/50 overflow-x-auto">
                          {route.hops.map((hop, idx) => (
                            <React.Fragment key={hop.nodeId + idx}>
                              <span
                                className={`px-1.5 py-0.5 rounded font-bold whitespace-nowrap ${
                                  hop.role === 'source'
                                    ? 'bg-[#adc6ff]/20 text-[#adc6ff]'
                                    : hop.role === 'target'
                                    ? 'bg-[#4edea3]/20 text-[#4edea3]'
                                    : 'bg-[#273647] text-[#c2c6d6]'
                                }`}
                              >
                                {hop.nodeLabel.split(' ')[0]}
                              </span>
                              {idx < route.hops.length - 1 && (
                                <ChevronRight className="w-3 h-3 text-[#424754] shrink-0" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Metrics Bar */}
                        <div className="grid grid-cols-3 gap-2 text-[10px] pt-1 border-t border-[#424754]/40">
                          <div>
                            <span className="text-[#8c909f]">Ping Latency:</span>{' '}
                            <span
                              className={`font-bold ${
                                route.totalLatencyMs < 10
                                  ? 'text-[#4edea3]'
                                  : route.totalLatencyMs < 18
                                  ? 'text-[#adc6ff]'
                                  : 'text-[#ffb786]'
                              }`}
                            >
                              {route.totalLatencyMs} ms
                            </span>
                          </div>
                          <div>
                            <span className="text-[#8c909f]">Bottleneck:</span>{' '}
                            <span className="font-bold text-[#d4e4fa]">
                              {route.bottleneckCapacityMbps} Mbps
                            </span>
                          </div>
                          <div>
                            <span className="text-[#8c909f]">Reliability:</span>{' '}
                            <span className="font-bold text-[#4edea3]">
                              {route.reliabilityPercent}%
                            </span>
                          </div>
                        </div>

                        {/* Action row */}
                        <div className="flex justify-between items-center pt-1 text-[10px]">
                          <div className="flex gap-1">
                            {route.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.2 rounded bg-[#1c2b3c] text-[#8c909f] text-[9px]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          <span
                            className={`font-bold ${
                              isSelected ? 'text-[#adc6ff]' : 'text-[#8c909f]'
                            }`}
                          >
                            {isSelected ? '✓ Selected Route' : 'Click to inspect'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Hop by Hop Visualizer */}
          {activeTab === 'hops' && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-[11px] text-[#8c909f]">
                <span className="uppercase font-bold">
                  Detailed Hop Sequence for: {activeRoute.name}
                </span>
                <span className="text-[#4edea3] font-bold">
                  Total End-to-End Latency: {activeRoute.totalLatencyMs} ms
                </span>
              </div>

              {/* Hop Chain Stepper */}
              <div className="flex flex-col gap-3">
                {activeRoute.hops.map((hop, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === activeRoute.hops.length - 1;

                  return (
                    <div
                      key={hop.nodeId + idx}
                      className="p-3.5 bg-[#122131] rounded-xl border border-[#424754] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] shadow ${
                            isFirst
                              ? 'bg-[#adc6ff] text-[#002e6a]'
                              : isLast
                              ? 'bg-[#4edea3] text-[#003824]'
                              : 'bg-[#273647] text-[#adc6ff] border border-[#adc6ff]/40'
                          }`}
                        >
                          {idx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[14px] text-[#d4e4fa]">
                              {hop.nodeLabel}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                hop.role === 'source'
                                  ? 'bg-[#002e6a] text-[#adc6ff]'
                                  : hop.role === 'target'
                                  ? 'bg-[#003824] text-[#4edea3]'
                                  : hop.role === 'user'
                                  ? 'bg-[#3b2d54] text-[#d0bcff]'
                                  : 'bg-[#1c2b3c] text-[#8c909f]'
                              }`}
                            >
                              {hop.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#8c909f]">
                            IP: <span className="text-[#adc6ff]">{hop.ip}</span> • Region:{' '}
                            <span className="text-[#c2c6d6]">{hop.dataCenter}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="text-[12px] font-bold text-[#4edea3]">
                            {hop.pingMs} ms
                          </div>
                          <div className="text-[9px] text-[#8c909f]">Node Ping</div>
                        </div>
                        {hop.linkSpeedMbps && (
                          <div className="hidden sm:block">
                            <div className="text-[12px] font-bold text-[#adc6ff]">
                              {hop.linkSpeedMbps} Mbps
                            </div>
                            <div className="text-[9px] text-[#8c909f]">Max Link Speed</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Optimization Insights */}
          {activeTab === 'insights' && (
            <div className="flex flex-col gap-4 font-inter text-[12px]">
              <div className="p-4 rounded-xl bg-[#122131] border border-[#424754] flex flex-col gap-3">
                <h3 className="font-bold text-[14px] text-[#d4e4fa] flex items-center gap-2 font-mono-data">
                  <Zap className="w-4 h-4 text-[#4edea3]" />
                  Why Route Alpha is the Fastest Way to Send & Receive
                </h3>
                <p className="text-[#c2c6d6] leading-relaxed">
                  Through algorithmic profiling (Dinic's level graph decomposition), Route Alpha
                  leverages the high-speed optical trunk connecting{' '}
                  <strong className="text-[#adc6ff]">Transit Node A (US-Central)</strong> directly to{' '}
                  <strong className="text-[#4edea3]">Transit Node C (EU-North)</strong>. This avoids the
                  high-jitter nodes (such as Node B and Node D) which introduce an additional 15.8 ms of
                  transit latency.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 font-mono-data text-[11px]">
                  <div className="p-3 bg-[#051424] rounded-lg border border-[#4edea3]/40 flex flex-col gap-1">
                    <span className="text-[#4edea3] font-bold uppercase flex items-center gap-1.5">
                      <ArrowUpRight className="w-3.5 h-3.5" /> For Send Process (Tx Uplink)
                    </span>
                    <span className="text-[#8c909f] text-[10px]">
                      Send packets via <strong>Route Alpha</strong> with MTU 1,500 for highest burst
                      bandwidth and instant packet acknowledgements.
                    </span>
                  </div>

                  <div className="p-3 bg-[#051424] rounded-lg border border-[#adc6ff]/40 flex flex-col gap-1">
                    <span className="text-[#adc6ff] font-bold uppercase flex items-center gap-1.5">
                      <ArrowDownLeft className="w-3.5 h-3.5" /> For Receive Process (Rx Downlink)
                    </span>
                    <span className="text-[#8c909f] text-[10px]">
                      Downlink flow via <strong>Route Alpha / Route Beta</strong> achieves lowest jitter
                      (0.8 ms variance) for continuous data integrity.
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantum Link Security & Multi-Path Fallback Note */}
              <div className="p-3.5 rounded-xl bg-[#0d1c2d] border border-[#adc6ff]/30 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#adc6ff] shrink-0" />
                <span className="text-[11px] text-[#adc6ff]">
                  All paths are protected with <strong>Kyber-768 Quantum-Safe Encryption</strong>. If
                  the primary route suffers packet drop, the system automatically reroutes to Route Beta
                  in 12 ms without losing in-flight payload.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 border-t border-[#424754] bg-[#0d1c2d] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-[#8c909f] font-mono-data">
            Current Preferred Route:{' '}
            <span className="text-[#adc6ff] font-bold">{activeRoute.name}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-transparent hover:bg-[#1c2b3c] border border-[#424754] text-[#8c909f] hover:text-[#d4e4fa] font-mono-data text-[11px] font-bold rounded-lg transition-all cursor-pointer"
            >
              Close
            </button>

            {onRetestTransfer && (
              <button
                onClick={() => {
                  if (onSelectRouteForNextTransfer) {
                    onSelectRouteForNextTransfer(selectedRouteId);
                  }
                  onRetestTransfer();
                  onClose();
                }}
                className="flex-1 sm:flex-none px-5 py-2 bg-[#4edea3] hover:bg-[#6cfbc0] text-[#003824] font-mono-data text-[12px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(78,222,163,0.4)] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Apply Fastest Route & Retest
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
