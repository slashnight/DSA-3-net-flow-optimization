import React from 'react';
import { LiveMetrics, AlgorithmMetric, CompletedTransferRouteInfo } from '../types';
import {
  AlertCircle,
  Activity,
  CheckCircle,
  RefreshCw,
  Zap,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft,
  Cpu,
  Layers,
  HardDrive,
  Award,
  ChevronRight,
  Globe,
  Server,
  Sparkles,
  History,
} from 'lucide-react';

interface RightPanelProps {
  metrics: LiveMetrics;
  algorithmMetrics: AlgorithmMetric[];
  healthReportText: string;
  onCollapse?: () => void;
  width?: number;
  onResize?: (newWidth: number) => void;
  onRetryTransfer?: () => void;
  onRerouteTransfer?: () => void;
  onResetTransfer?: () => void;
  routeInfo?: CompletedTransferRouteInfo | null;
  onOpenRouteAnalysis?: () => void;
  onOpenHistorySpace?: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  metrics,
  algorithmMetrics,
  healthReportText,
  onCollapse,
  width = 360,
  onResize,
  onRetryTransfer,
  onRerouteTransfer,
  onResetTransfer,
  routeInfo,
  onOpenRouteAnalysis,
  onOpenHistorySpace,
}) => {
  // Determine utilization color
  const getUtilColor = (val: number) => {
    if (val > 85) return 'text-[#ffb4ab]';
    if (val > 70) return 'text-[#ffb786]';
    return 'text-[#4edea3]';
  };

  // Determine packet loss color
  const getLossColor = (val: number) => {
    if (val > 0.1) return 'text-[#ffb4ab]';
    if (val > 0.03) return 'text-[#ffb786]';
    return 'text-[#4edea3]';
  };

  const isSending = metrics.mode === 'send';
  const throughputMBps = (metrics.totalThroughput * 1024) / 8;

  return (
    <aside className="w-full bg-[#122131] border-l border-[#424754] flex flex-col h-full flex-shrink-0 z-20 select-none overflow-y-auto relative">
      {/* Header with size presets and collapse */}
      <div className="p-3.5 border-b border-[#424754] flex items-center justify-between bg-[#1c2b3c]/50">
        <div>
          <h2 className="text-[16px] font-bold text-[#d4e4fa] tracking-tight font-inter mb-0.5 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shadow-[0_0_6px] ${
                metrics.isTransferring
                  ? isSending
                    ? 'bg-[#adc6ff] shadow-[#adc6ff] animate-pulse'
                    : 'bg-[#4edea3] shadow-[#4edea3] animate-pulse'
                  : 'bg-[#8c909f] shadow-[#8c909f]'
              }`}
            />
            Analytics & Profiler
          </h2>
          <div className="flex items-center gap-2">
            <p className="text-[11px] text-[#8c909f]">
              {isSending ? 'Tx Sending Process Telemetry' : 'Rx Receiving Process Telemetry'}
            </p>
            {onResize && (
              <span className="text-[9px] font-mono-data px-1.5 py-0.2 rounded bg-[#051424] text-[#4edea3] border border-[#424754]">
                {Math.round(width)}px
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick width presets */}
          {onResize && (
            <div className="hidden sm:flex items-center gap-1 bg-[#051424] p-0.5 rounded border border-[#424754]">
              <button
                onClick={() => onResize(300)}
                title="Compact Width (300px)"
                className={`px-1.5 py-0.5 text-[9px] font-mono-data rounded font-bold transition-all cursor-pointer ${
                  Math.abs(width - 300) < 15 ? 'bg-[#4edea3] text-[#003824]' : 'text-[#8c909f] hover:text-[#d4e4fa]'
                }`}
              >
                S
              </button>
              <button
                onClick={() => onResize(380)}
                title="Default Width (380px)"
                className={`px-1.5 py-0.5 text-[9px] font-mono-data rounded font-bold transition-all cursor-pointer ${
                  Math.abs(width - 380) < 15 ? 'bg-[#4edea3] text-[#003824]' : 'text-[#8c909f] hover:text-[#d4e4fa]'
                }`}
              >
                M
              </button>
              <button
                onClick={() => onResize(480)}
                title="Expanded Width (480px)"
                className={`px-1.5 py-0.5 text-[9px] font-mono-data rounded font-bold transition-all cursor-pointer ${
                  Math.abs(width - 480) < 15 ? 'bg-[#4edea3] text-[#003824]' : 'text-[#8c909f] hover:text-[#d4e4fa]'
                }`}
              >
                L
              </button>
            </div>
          )}

          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse Analytics Panel (Slide Right)"
              className="p-1.5 rounded-lg bg-[#1c2b3c] border border-[#424754] text-[#8c909f] hover:text-[#4edea3] hover:border-[#4edea3] hover:bg-[#273647] transition-all flex items-center justify-center group cursor-pointer"
            >
              <span className="text-[10px] font-mono-data font-bold text-[#8c909f] group-hover:text-[#4edea3] mr-1">Hide</span>
              <Zap className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 flex-1 flex flex-col gap-3.5">
        {/* Network Error Alert & Retry Prompt */}
        {metrics.hasError && (
          <div className="p-3 bg-[#93000a]/25 border-2 border-[#ffb4ab] rounded-lg flex flex-col gap-2 font-mono-data text-[11px] animate-pulse-slow">
            <div className="flex items-center gap-2 text-[#ffb4ab] font-bold">
              <ShieldAlert className="w-4 h-4 text-[#ffb4ab]" />
              <span>ERROR: NOT ABLE TO {isSending ? 'SEND' : 'RECEIVE'} STREAM</span>
            </div>
            <div className="text-[10px] text-[#ffdad6] bg-[#051424] p-2 rounded border border-[#ffb4ab]/30">
              {metrics.errorMessage || 'Link failure detected. Transmission stopped.'}
            </div>

            {/* Should we continue transfer again prompt */}
            <div className="pt-1 border-t border-[#ffb4ab]/30 flex flex-col gap-2">
              <div className="text-[11px] text-[#d4e4fa] font-bold font-inter flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-ping" />
                Should we continue the transfer again?
              </div>

              <div className="flex flex-col gap-1.5">
                {onRetryTransfer && (
                  <button
                    onClick={onRetryTransfer}
                    className="w-full py-1.5 bg-[#adc6ff] hover:bg-[#d8e2ff] text-[#002e6a] font-bold rounded flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer text-[10px]"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Continue / Retry Transfer
                  </button>
                )}
                {onRerouteTransfer && (
                  <button
                    onClick={onRerouteTransfer}
                    className="w-full py-1.5 bg-[#273647] hover:bg-[#1c2b3c] border border-[#4edea3]/50 text-[#4edea3] font-bold rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer text-[10px]"
                  >
                    <Zap className="w-3 h-3" />
                    Reroute via Alternate Path & Continue
                  </button>
                )}
                {onResetTransfer && (
                  <button
                    onClick={onResetTransfer}
                    className="w-full py-1 bg-transparent hover:bg-[#1c2b3c] border border-[#424754] text-[#8c909f] hover:text-[#d4e4fa] rounded flex items-center justify-center gap-1 transition-all cursor-pointer text-[9px]"
                  >
                    Cancel / Reset Transfer
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Process Status Banner */}
        <div className="p-2.5 bg-[#051424] rounded-lg border border-[#424754] flex items-center justify-between font-mono-data text-[11px]">
          <div className="flex items-center gap-2">
            {isSending ? (
              <span className="p-1 rounded bg-[#adc6ff]/20 text-[#adc6ff]">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span className="p-1 rounded bg-[#4edea3]/20 text-[#4edea3]">
                <ArrowDownLeft className="w-3.5 h-3.5" />
              </span>
            )}
            <div>
              <div className="font-bold text-[#d4e4fa]">
                {isSending ? 'SENDING PROCESS (Tx)' : 'RECEIVING PROCESS (Rx)'}
              </div>
              <div className="text-[9px] text-[#8c909f]">
                {metrics.isTransferring
                  ? `Active Stream: ${metrics.activePathCount} quantum paths`
                  : metrics.totalPayloadMB > 0
                  ? 'Queue armed & ready'
                  : 'Idle buffer (0 MB)'}
              </div>
            </div>
          </div>

          <span
            className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
              metrics.isCompleted
                ? 'bg-[#003824] text-[#4edea3] border border-[#4edea3]/40'
                : metrics.isTransferring
                ? isSending
                  ? 'bg-[#002e6a] text-[#adc6ff] border border-[#adc6ff]/40 animate-pulse'
                  : 'bg-[#003824] text-[#4edea3] border border-[#4edea3]/40 animate-pulse'
                : 'bg-[#1c2b3c] text-[#8c909f] border border-[#424754]'
            }`}
          >
            {metrics.isCompleted
              ? isSending
                ? 'SENT (100%)'
                : 'RECEIVED (100%)'
              : metrics.isTransferring
              ? isSending
                ? 'SENDING...'
                : 'RECEIVING...'
              : 'IDLE'}
          </span>
        </div>

        {/* Completed Route & Fastest Path Telemetry Card */}
        {metrics.isCompleted && routeInfo && (
          <div className="p-3.5 bg-gradient-to-b from-[#003824]/40 to-[#122131] border-2 border-[#4edea3] rounded-xl flex flex-col gap-2.5 font-mono-data text-[11px] shadow-[0_0_20px_rgba(78,222,163,0.15)] animate-slideDown">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#4edea3] font-bold text-[11px]">
                <Award className="w-4 h-4 text-[#4edea3]" />
                COMPLETED TRANSFER ROUTE
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#003824] text-[#4edea3] font-bold border border-[#4edea3]/30">
                ⭐ FASTEST PATH VERIFIED
              </span>
            </div>

            {/* From Node -> To Node Visual */}
            <div className="bg-[#051424] p-2.5 rounded-lg border border-[#424754]/80 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-[#8c909f] uppercase font-bold">From Node (Origin):</span>
                <span className="text-[#adc6ff] font-bold">{routeInfo.sourceNode.nodeLabel}</span>
              </div>
              <div className="text-[9px] text-[#8c909f] pl-2">
                IP: <span className="text-[#d4e4fa]">{routeInfo.sourceNode.ip}</span> • {routeInfo.sourceNode.dataCenter}
              </div>

              <div className="flex items-center justify-center my-0.5 text-[#4edea3] text-[10px] font-bold gap-1">
                <span>↓ Sent via {routeInfo.fastestRoute.name.split(' ')[0]}</span>
                <span className="text-[9px] text-[#8c909f]">({routeInfo.fastestRoute.totalLatencyMs} ms ping)</span>
              </div>

              <div className="flex justify-between items-center text-[10px]">
                <span className="text-[#8c909f] uppercase font-bold">To Node (Target):</span>
                <span className="text-[#4edea3] font-bold">{routeInfo.targetNode.nodeLabel}</span>
              </div>
              <div className="text-[9px] text-[#8c909f] pl-2">
                IP: <span className="text-[#d4e4fa]">{routeInfo.targetNode.ip}</span> • {routeInfo.targetNode.dataCenter}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 bg-[#1c2b3c]/80 rounded border border-[#424754]">
                <span className="text-[#8c909f] block text-[9px]">Fastest Transit Time:</span>
                <span className="text-[#4edea3] font-bold text-[12px]">{routeInfo.fastestRoute.estimatedTransitTimeSec}s</span>
                <span className="text-[8px] text-[#8c909f] block">(Saved {routeInfo.timeSavedVsAverageSec}s vs avg)</span>
              </div>
              <div className="p-2 bg-[#1c2b3c]/80 rounded border border-[#424754]">
                <span className="text-[#8c909f] block text-[9px]">Max Bottleneck:</span>
                <span className="text-[#adc6ff] font-bold text-[12px]">{routeInfo.fastestRoute.bottleneckCapacityMbps} Mbps</span>
                <span className="text-[8px] text-[#4edea3] block">Tier-1 Optical Link</span>
              </div>
            </div>

            {/* Open Full Comparison Modal Button & View in History */}
            <div className="flex flex-col gap-2 pt-1">
              {onOpenRouteAnalysis && (
                <button
                  onClick={onOpenRouteAnalysis}
                  className="w-full py-2 bg-[#4edea3] hover:bg-[#6cfbc0] text-[#003824] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(78,222,163,0.3)] cursor-pointer text-[11px]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Inspect Fastest Way & Compare 4 Routes
                </button>
              )}

              {onOpenHistorySpace && (
                <button
                  onClick={onOpenHistorySpace}
                  className="w-full py-1.5 bg-[#122131] hover:bg-[#1c2b3c] text-[#4edea3] border border-[#4edea3]/40 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer text-[10px]"
                >
                  <History className="w-3 h-3 text-[#4edea3]" />
                  Open in History Space (Restore / Audit)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Live Ingest Volume & Transfer Progress Card */}
        <div className="p-3 bg-[#051424] rounded-lg border border-[#424754] font-mono-data flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] text-[#8c909f]">
            <span className="font-bold uppercase flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-[#adc6ff]" />
              {isSending ? 'Transmitted Volume' : 'Received Volume'}
            </span>
            <span className="text-[#d4e4fa] font-bold">
              {metrics.transferProgress.toFixed(1)}%
            </span>
          </div>

          <div className="flex justify-between items-baseline">
            <div className="text-[20px] font-bold text-[#d4e4fa]">
              {metrics.transferredMB.toFixed(1)}{' '}
              <span className="text-[11px] text-[#8c909f] font-normal">
                / {metrics.totalPayloadMB.toFixed(1)} MB
              </span>
            </div>
            <div className="text-[11px] text-[#8c909f]">
              Remaining:{' '}
              <span className="text-[#adc6ff] font-bold">
                {metrics.remainingMB.toFixed(1)} MB
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-[#1c2b3c] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                metrics.isCompleted
                  ? 'bg-[#4edea3]'
                  : isSending
                  ? 'bg-[#4d8eff]'
                  : 'bg-[#4edea3]'
              }`}
              style={{ width: `${Math.min(100, metrics.transferProgress)}%` }}
            />
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Total Throughput */}
          <div className="bg-[#051424] p-3 rounded border border-[#424754]">
            <div className="font-mono-data text-[9px] text-[#8c909f] font-bold tracking-wider mb-0.5">
              {isSending ? 'TX THROUGHPUT (UPLINK)' : 'RX THROUGHPUT (DOWNLINK)'}
            </div>
            <div className="font-mono-data text-[19px] font-bold text-[#adc6ff]">
              {metrics.totalThroughput.toFixed(1)}{' '}
              <span className="text-[11px] text-[#8c909f] font-normal">Gbps</span>
            </div>
            <div className="text-[9px] font-mono-data text-[#8c909f] mt-0.5">
              ≈ {Math.round(throughputMBps)} MB/s
            </div>
          </div>

          {/* Network Utilization */}
          <div className="bg-[#051424] p-3 rounded border border-[#424754]">
            <div className="font-mono-data text-[9px] text-[#8c909f] font-bold tracking-wider mb-0.5">
              MESH UTILIZATION
            </div>
            <div className={`font-mono-data text-[19px] font-bold ${getUtilColor(metrics.utilization)}`}>
              {metrics.utilization.toFixed(1)}{' '}
              <span className="text-[11px] text-[#8c909f] font-normal">%</span>
            </div>
            <div className="text-[9px] font-mono-data text-[#8c909f] mt-0.5">
              Cap: {metrics.maxFlowCapGbps.toFixed(1)} Gbps
            </div>
          </div>

          {/* Packets Processed & In-Flight */}
          <div className="bg-[#051424] p-3 rounded border border-[#424754]">
            <div className="font-mono-data text-[9px] text-[#8c909f] font-bold tracking-wider mb-0.5">
              PACKETS PROCESSED
            </div>
            <div className="font-mono-data text-[17px] font-bold text-[#4edea3]">
              {metrics.packetsProcessed.toLocaleString()}{' '}
              <span className="text-[10px] text-[#8c909f] font-normal">
                / {metrics.totalPackets.toLocaleString()}
              </span>
            </div>
            <div className="text-[9px] font-mono-data text-[#8c909f] mt-0.5">
              In Flight: <span className="text-[#adc6ff] font-bold">{metrics.packetsInFlight.toLocaleString()}</span>
            </div>
          </div>

          {/* Packet Loss */}
          <div className="bg-[#051424] p-3 rounded border border-[#424754]">
            <div className="font-mono-data text-[9px] text-[#8c909f] font-bold tracking-wider mb-0.5">
              PACKET LOSS & FEC
            </div>
            <div className={`font-mono-data text-[19px] font-bold ${getLossColor(metrics.packetLoss)}`}>
              {metrics.packetLoss.toFixed(2)}{' '}
              <span className="text-[11px] text-[#8c909f] font-normal">%</span>
            </div>
            <div className="text-[9px] font-mono-data text-[#8c909f] mt-0.5">
              FEC RS(255,223) Active
            </div>
          </div>

          {/* Global Latency */}
          <div className="bg-[#051424] p-3 rounded border border-[#424754]">
            <div className="font-mono-data text-[9px] text-[#8c909f] font-bold tracking-wider mb-0.5">
              ROUND-TRIP LATENCY
            </div>
            <div className="font-mono-data text-[19px] font-bold text-[#adc6ff]">
              {Math.round(metrics.globalLatency)}{' '}
              <span className="text-[11px] text-[#8c909f] font-normal">ms</span>
            </div>
            <div className="text-[9px] font-mono-data text-[#8c909f] mt-0.5">
              Jitter: &lt; 1.2ms
            </div>
          </div>

          {/* Server Cluster Load */}
          <div className="bg-[#051424] p-3 rounded border border-[#424754]">
            <div className="font-mono-data text-[9px] text-[#8c909f] font-bold tracking-wider mb-0.5">
              CLUSTER CPU LOAD
            </div>
            <div className="font-mono-data text-[19px] font-bold text-[#adc6ff]">
              {metrics.serverClusterLoad.toFixed(1)}{' '}
              <span className="text-[11px] text-[#8c909f] font-normal">%</span>
            </div>
            <div className="text-[9px] font-mono-data text-[#8c909f] mt-0.5">
              Cores: 64 Active
            </div>
          </div>

          {/* Critical Bottleneck Value Card */}
          <div
            className={`col-span-2 p-3 rounded border transition-all ${
              metrics.criticalBottleneck.hasBottleneck
                ? 'bg-[#051424] border-[#ffb4ab] pulse-error'
                : 'bg-[#051424] border-[#424754]'
            }`}
          >
            <div
              className={`font-mono-data text-[9px] font-bold tracking-wider mb-0.5 ${
                metrics.criticalBottleneck.hasBottleneck ? 'text-[#ffb4ab]' : 'text-[#8c909f]'
              }`}
            >
              CRITICAL BOTTLENECK LINK VALUE
            </div>
            <div
              className={`font-mono-data text-[16px] font-bold ${
                metrics.criticalBottleneck.hasBottleneck ? 'text-[#ffb4ab]' : 'text-[#d4e4fa]'
              }`}
            >
              {metrics.criticalBottleneck.hasBottleneck ? (
                <>
                  {Math.round(metrics.criticalBottleneck.value)}{' '}
                  <span className="text-[11px] opacity-80 font-normal">
                    Mbps @ Link {metrics.criticalBottleneck.linkName} (Saturated)
                  </span>
                </>
              ) : (
                <>
                  NONE <span className="text-[11px] opacity-75 text-[#8c909f] font-normal">All channels stable & optimal</span>
                </>
              )}
            </div>
          </div>

          {/* Estimated Time To Completion Card */}
          <div className="col-span-2 bg-[#1c2b3c] p-3 rounded border border-[#424754] relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#4edea3] opacity-60" />
            <div className="flex justify-between items-center mb-0.5">
              <span className="font-mono-data text-[9px] text-[#8c909f] font-bold tracking-wider">
                ESTIMATED TIME TO COMPLETION (ETC)
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono-data text-[#4edea3] opacity-90 font-bold">
                <RefreshCw className={`w-2.5 h-2.5 ${metrics.isTransferring ? 'animate-spin' : ''}`} />
                {metrics.isTransferring ? 'CALCULATING' : 'READY'}
              </span>
            </div>
            <div className="font-mono-data text-[20px] font-bold text-[#d4e4fa]">
              {metrics.etcSeconds.toFixed(1)}s{' '}
              <span className="text-[11px] opacity-75 text-[#8c909f] font-normal">
                @ {metrics.etcThroughput.toFixed(1)} Gbps
              </span>
            </div>
          </div>
        </div>

        {/* Algorithm Profiler Table */}
        <div className="flex flex-col gap-1.5 mt-0.5">
          <div className="flex justify-between items-center">
            <label className="font-mono-data text-[10px] text-[#8c909f] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-[#adc6ff]" />
              Flow Algorithm Profiler
            </label>
            <span className="text-[9px] font-mono-data text-[#8c909f]">
              Graph |V|=10, |E|=15
            </span>
          </div>
          <div className="bg-[#051424] border border-[#424754] rounded overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#424754] bg-[#1c2b3c]">
                  <th className="p-2 font-mono-data text-[10px] text-[#8c909f] font-bold">Metric</th>
                  <th className="p-2 font-mono-data text-[10px] text-[#adc6ff] font-bold">Dinic's (Active)</th>
                  <th className="p-2 font-mono-data text-[10px] text-[#8c909f] font-bold">Edmonds-Karp</th>
                </tr>
              </thead>
              <tbody className="font-mono-data text-[11px]">
                {algorithmMetrics.map((item, idx) => (
                  <tr key={idx} className={idx !== algorithmMetrics.length - 1 ? 'border-b border-[#424754]' : ''}>
                    <td className="p-2 text-[#8c909f]">{item.name}</td>
                    <td className="p-2 text-[#adc6ff] font-semibold">{item.dinics}</td>
                    <td className="p-2 text-[#d4e4fa]">{item.edmondsKarp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Automated Health & Telemetry Report */}
        <div className="flex flex-col gap-1.5 mt-0.5">
          <label className="font-mono-data text-[10px] text-[#8c909f] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#ffb786]" /> Process Diagnostics
          </label>
          <div className="bg-[#273647]/70 p-3 rounded border-l-2 border-[#ffb786]">
            <p className="text-[12px] text-[#d4e4fa] leading-relaxed font-inter">
              {healthReportText}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

