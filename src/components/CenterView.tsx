import React, { useState } from 'react';
import {
  DataCenterHub,
  NetworkNode,
  NetworkPath,
  TransmissionMode,
  UserSource,
  IngestedFile,
} from '../types';
import { Globe3DView } from './Globe3DView';
import { Topology2DView } from './Topology2DView';
import {
  RotateCcw,
  RotateCw,
  Play,
  Pause,
  Box,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Activity,
  SlidersHorizontal,
  BarChart3,
  Radio,
  Compass,
  AlertTriangle,
  RefreshCw,
  GitFork,
  CheckCircle2,
  Sparkles,
  History,
  Signal,
  Wifi,
  FileText,
} from 'lucide-react';
import { CompletedTransferRouteInfo } from '../types';

interface CenterViewProps {
  viewMode: '3D' | '2D';
  onToggleViewMode: () => void;
  hubs: DataCenterHub[];
  nodes: NetworkNode[];
  paths: NetworkPath[];
  selectedHub: DataCenterHub | null;
  onSelectHub: (hub: DataCenterHub | null) => void;
  selectedNode: NetworkNode | null;
  onSelectNode: (node: NetworkNode) => void;
  activeUserSource: UserSource;
  transmissionMode: TransmissionMode;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  isLeftCollapsed: boolean;
  onToggleLeft: () => void;
  isRightCollapsed: boolean;
  onToggleRight: () => void;
  ingestedFiles: IngestedFile[];
  onOpenTransmissionDetails: () => void;
  isSimulating: boolean;
  bestPathId?: string;
  progressPercent: number;
  hasError?: boolean;
  errorMessage?: string;
  onRetryTransfer?: () => void;
  onRerouteTransfer?: () => void;
  onOpenErrorModal?: () => void;
  isCompleted?: boolean;
  routeInfo?: CompletedTransferRouteInfo | null;
  onOpenRouteAnalysis?: () => void;
  onOpenHistorySpace?: () => void;
}

export const CenterView: React.FC<CenterViewProps> = ({
  viewMode,
  onToggleViewMode,
  hubs,
  nodes,
  paths,
  selectedHub,
  onSelectHub,
  selectedNode,
  onSelectNode,
  activeUserSource,
  transmissionMode,
  autoRotate,
  onToggleAutoRotate,
  isLeftCollapsed,
  onToggleLeft,
  isRightCollapsed,
  onToggleRight,
  ingestedFiles,
  onOpenTransmissionDetails,
  isSimulating,
  bestPathId,
  progressPercent,
  hasError = false,
  errorMessage,
  onRetryTransfer,
  onRerouteTransfer,
  onOpenErrorModal,
  isCompleted = false,
  routeInfo,
  onOpenRouteAnalysis,
  onOpenHistorySpace,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isLogCollapsed, setIsLogCollapsed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1);
  const [rotationDirection, setRotationDirection] = useState<'left' | 'right'>('left');
  
  // Custom resizable size for bottom transmission log box
  const [logBoxWidth, setLogBoxWidth] = useState<number>(360);
  const [logBoxHeight, setLogBoxHeight] = useState<number>(260);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(2.5, prev + 0.2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.6, prev - 0.2));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <main className="flex-1 relative overflow-hidden flex flex-col z-10 bg-[#051424]">
      {/* Simulation Top Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#273647] z-30">
        <div
          className={`h-full transition-all duration-300 ${
            hasError ? 'bg-[#ffb4ab] shadow-[0_0_8px_#ffb4ab]' : 'bg-[#4d8eff] shadow-[0_0_8px_#adc6ff]'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Floating Network Error Notice & Prompt on Canvas */}
      {hasError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-xl bg-[#122131]/95 backdrop-blur-md border-2 border-[#ffb4ab] rounded-xl p-3 shadow-[0_8px_30px_rgba(255,180,171,0.3)] flex flex-col gap-2 font-mono-data text-[11px] animate-slideDown">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#ffb4ab] font-bold">
              <AlertTriangle className="w-4 h-4 text-[#ffb4ab] animate-pulse" />
              <span>Error: Not able to {transmissionMode === 'send' ? 'send' : 'receive'} stream</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-[#93000a] text-[#ffdad6] font-bold uppercase">
              Transfer Interrupted
            </span>
          </div>

          <p className="text-[10px] text-[#ffdad6] bg-[#051424] px-2.5 py-1.5 rounded border border-[#ffb4ab]/30">
            {errorMessage || 'Primary link dropped (Timeout). Packet transmission failed.'}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-[#ffb4ab]/30">
            <span className="text-[11px] font-bold text-[#d4e4fa] font-inter flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-ping" />
              Should we continue the transfer again?
            </span>

            <div className="flex items-center gap-2">
              {onRerouteTransfer && (
                <button
                  onClick={onRerouteTransfer}
                  className="px-2.5 py-1 bg-[#273647] hover:bg-[#1c2b3c] border border-[#4edea3]/50 text-[#4edea3] font-bold rounded flex items-center gap-1 text-[10px] cursor-pointer"
                >
                  <GitFork className="w-3 h-3" /> Reroute & Continue
                </button>
              )}
              {onRetryTransfer && (
                <button
                  onClick={onRetryTransfer}
                  className="px-3 py-1 bg-[#adc6ff] hover:bg-[#d8e2ff] text-[#002e6a] font-bold rounded flex items-center gap-1 text-[10px] cursor-pointer shadow-[0_0_10px_rgba(173,198,255,0.4)]"
                >
                  <RefreshCw className="w-3 h-3" /> Continue Transfer
                </button>
              )}
              {onOpenErrorModal && (
                <button
                  onClick={onOpenErrorModal}
                  className="px-2 py-1 bg-[#1c2b3c] hover:bg-[#273647] border border-[#424754] text-[#8c909f] hover:text-[#d4e4fa] rounded text-[10px] cursor-pointer"
                >
                  Options
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Completed Transfer Route & Fastest Way Notice on Canvas */}
      {!hasError && isCompleted && routeInfo && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl bg-[#122131]/95 backdrop-blur-md border-2 border-[#4edea3] rounded-xl p-3 shadow-[0_8px_30px_rgba(78,222,163,0.3)] flex flex-col gap-2 font-mono-data text-[11px] animate-slideDown">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#4edea3] font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
              <span>
                Transfer Completed:{' '}
                {transmissionMode === 'send'
                  ? `Sent from ${routeInfo.sourceNode.nodeLabel} ➔ ${routeInfo.targetNode.nodeLabel}`
                  : `Received from ${routeInfo.sourceNode.nodeLabel} ➔ ${routeInfo.targetNode.nodeLabel}`}
              </span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-[#003824] text-[#4edea3] font-bold border border-[#4edea3]/40 uppercase">
              ⭐ FASTEST PATH VERIFIED
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#051424] px-3 py-1.5 rounded border border-[#4edea3]/30 text-[10px]">
            <div className="text-[#d4e4fa] flex items-center gap-2">
              <span className="text-[#8c909f]">Fastest Route:</span>
              <span className="text-[#4edea3] font-bold">{routeInfo.fastestRoute.name}</span>
              <span className="text-[#adc6ff]">({routeInfo.fastestRoute.totalLatencyMs} ms ping • {routeInfo.fastestRoute.bottleneckCapacityMbps} Mbps)</span>
            </div>
            <span className="text-[#8c909f] text-[9px]">
              Transit: <strong className="text-[#4edea3]">{routeInfo.fastestRoute.estimatedTransitTimeSec}s</strong> (Saved {routeInfo.timeSavedVsAverageSec}s)
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#4edea3]/30">
            <span className="text-[10px] text-[#8c909f] font-inter">
              Check all 4 evaluated candidate routes and hop latencies.
            </span>

            <div className="flex items-center gap-2">
              {onOpenHistorySpace && (
                <button
                  onClick={onOpenHistorySpace}
                  className="px-3 py-1.5 bg-[#122131] hover:bg-[#1c2b3c] text-[#4edea3] border border-[#4edea3]/50 font-bold rounded-lg flex items-center gap-1.5 text-[11px] cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-[#4edea3]" /> View Saved in History Space
                </button>
              )}
              {onOpenRouteAnalysis && (
                <button
                  onClick={onOpenRouteAnalysis}
                  className="px-3.5 py-1.5 bg-[#4edea3] hover:bg-[#6cfbc0] text-[#003824] font-bold rounded-lg flex items-center gap-1.5 text-[11px] cursor-pointer shadow-[0_0_12px_rgba(78,222,163,0.4)]"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Inspect Fastest Way & Node Hops
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDING BOX 1: Left Parameters Handle (Always visible & interactive)       */}
      {/* ========================================================================= */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-40">
        {isLeftCollapsed ? (
          <button
            onClick={onToggleLeft}
            title="Open Parameters & Controls (Slide Right)"
            className="group px-2.5 py-4 bg-[#122131]/95 backdrop-blur-md border border-[#adc6ff]/50 border-l-0 rounded-r-xl shadow-[0_4px_24px_rgba(0,0,0,0.7),0_0_12px_rgba(173,198,255,0.25)] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#1c2b3c] hover:border-[#adc6ff] hover:shadow-[0_0_20px_rgba(173,198,255,0.4)] transition-all animate-pulse-slow"
          >
            <div className="w-2 h-2 rounded-full bg-[#adc6ff] shadow-[0_0_6px_#adc6ff]" />
            <SlidersHorizontal className="w-4 h-4 text-[#adc6ff] group-hover:scale-110 transition-transform" />
            <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-mono-data font-bold tracking-wider text-[#d4e4fa] group-hover:text-white">
              PARAMETERS
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#adc6ff] group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <button
            onClick={onToggleLeft}
            title="Collapse Parameters (Slide Left)"
            className="group w-6 h-16 bg-[#122131]/90 hover:bg-[#1c2b3c] border border-[#424754] hover:border-[#adc6ff] border-l-0 rounded-r-lg flex flex-col items-center justify-center gap-1 text-[#8c909f] hover:text-[#adc6ff] transition-all cursor-pointer shadow-lg"
          >
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <SlidersHorizontal className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SLIDING BOX 2: Right Analytics Handle (Always visible & interactive)       */}
      {/* ========================================================================= */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-40">
        {isRightCollapsed ? (
          <button
            onClick={onToggleRight}
            title="Open Analytics & Profiler (Slide Left)"
            className="group px-2.5 py-4 bg-[#122131]/95 backdrop-blur-md border border-[#4edea3]/50 border-r-0 rounded-l-xl shadow-[0_4px_24px_rgba(0,0,0,0.7),0_0_12px_rgba(78,222,163,0.25)] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#1c2b3c] hover:border-[#4edea3] hover:shadow-[0_0_20px_rgba(78,222,163,0.4)] transition-all animate-pulse-slow"
          >
            <div className="w-2 h-2 rounded-full bg-[#4edea3] shadow-[0_0_6px_#4edea3] animate-pulse" />
            <BarChart3 className="w-4 h-4 text-[#4edea3] group-hover:scale-110 transition-transform" />
            <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-mono-data font-bold tracking-wider text-[#d4e4fa] group-hover:text-white">
              ANALYTICS
            </span>
            <ChevronLeft className="w-3.5 h-3.5 text-[#4edea3] group-hover:-translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <button
            onClick={onToggleRight}
            title="Collapse Analytics (Slide Right)"
            className="group w-6 h-16 bg-[#122131]/90 hover:bg-[#1c2b3c] border border-[#424754] hover:border-[#4edea3] border-r-0 rounded-l-lg flex flex-col items-center justify-center gap-1 text-[#8c909f] hover:text-[#4edea3] transition-all cursor-pointer shadow-lg"
          >
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            <BarChart3 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Floating Top Toolbar Overlay */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-30 pointer-events-none">
        {/* Left Legend */}
        <div className="bg-[#1c2b3c]/90 backdrop-blur border border-[#424754] rounded-lg px-3 py-1.5 flex gap-4 pointer-events-auto shadow-lg text-[11px] font-mono-data">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#adc6ff] shadow-[0_0_4px_#adc6ff]" />
            <span className="text-[#c2c6d6]">Global Backbone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4edea3] shadow-[0_0_4px_#4edea3]" />
            <span className="text-[#c2c6d6]">User Stream</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ffb4ab] pulse-error shadow-[0_0_6px_#ffb4ab]" />
            <span className="text-[#c2c6d6]">High Latency</span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="bg-[#1c2b3c]/90 backdrop-blur border border-[#424754] rounded-lg p-1 flex items-center gap-1 pointer-events-auto shadow-lg font-mono-data text-[10px]">
          {/* Quick Auto-Rotate status button */}
          <button
            onClick={onToggleAutoRotate}
            title={autoRotate ? 'Click to Stop Globe Rotation' : 'Click to Resume Globe Rotation'}
            className={`px-2.5 py-1 flex items-center gap-1.5 rounded transition-all font-bold ${
              autoRotate
                ? 'text-[#4edea3] bg-[#003824]/60 border border-[#4edea3]/40'
                : 'text-[#ffb786] bg-[#3a1a0f]/40 border border-[#ffb786]/30 hover:text-white'
            }`}
          >
            {autoRotate ? (
              <RotateCcw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: `${6 / rotationSpeed}s` }} />
            ) : (
              <Pause className="w-3.5 h-3.5 text-[#ffb786]" />
            )}
            <span>{autoRotate ? 'Rotating' : 'Stopped'}</span>
          </button>

          <div className="w-px h-4 bg-[#424754] mx-0.5" />

          {/* 2D / 3D Toggle */}
          <button
            onClick={onToggleViewMode}
            className="px-2.5 py-1 flex items-center gap-1.5 text-[#adc6ff] bg-[#051424] border border-[#424754] rounded hover:bg-[#122131] transition-all font-bold"
          >
            {viewMode === '3D' ? <Box className="w-3.5 h-3.5 text-[#4edea3]" /> : <Layers className="w-3.5 h-3.5 text-[#adc6ff]" />}
            <span>{viewMode === '3D' ? '3D Virtual' : '2D Abstract'}</span>
          </button>

          <div className="w-px h-4 bg-[#424754] mx-0.5" />

          {/* Zoom controls */}
          <button
            onClick={handleZoomIn}
            title="Zoom In (scroll up)"
            className="p-1 text-[#8c909f] hover:text-[#adc6ff] hover:bg-[#273647] rounded transition-all"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Reset Zoom to 100%"
            className={`px-1.5 py-0.5 rounded transition-all text-[9px] font-bold ${
              zoomLevel === 1
                ? 'text-[#8c909f] hover:text-[#adc6ff] hover:bg-[#273647]'
                : 'bg-[#adc6ff]/20 text-[#adc6ff] border border-[#adc6ff]/40'
            }`}
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out (scroll down)"
            className="p-1 text-[#8c909f] hover:text-[#adc6ff] hover:bg-[#273647] rounded transition-all"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-[#424754] mx-0.5" />

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-1 text-[#8c909f] hover:text-[#adc6ff] hover:bg-[#273647] rounded transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOP RIGHT CORNER: Dedicated Globe Rotation Controller Widget              */}
      {/* ========================================================================= */}
      {viewMode === '3D' && (
        <div className="absolute top-14 right-4 z-30 flex flex-col gap-1.5 font-mono-data pointer-events-auto animate-toast">
          <div className="bg-[#122131]/95 backdrop-blur-md border border-[#424754] hover:border-[#adc6ff]/60 rounded-xl p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col gap-2 w-56 transition-all">
            {/* Header / Rotation Status */}
            <div className="flex items-center justify-between border-b border-[#424754]/60 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#adc6ff]" />
                <span className="text-[11px] font-bold text-[#d4e4fa]">Globe Rotation</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    autoRotate
                      ? 'bg-[#4edea3] shadow-[0_0_6px_#4edea3] animate-pulse'
                      : 'bg-[#ffb786] shadow-[0_0_6px_#ffb786]'
                  }`}
                />
                <span
                  className={`text-[9px] font-bold uppercase ${
                    autoRotate ? 'text-[#4edea3]' : 'text-[#ffb786]'
                  }`}
                >
                  {autoRotate ? 'Running' : 'Stopped'}
                </span>
              </div>
            </div>

            {/* Big Primary Control Button: Stop / Rotate Globe */}
            <button
              onClick={onToggleAutoRotate}
              className={`w-full py-1.5 px-3 rounded-lg font-bold text-[11px] flex items-center justify-center gap-2 transition-all shadow-md ${
                autoRotate
                  ? 'bg-[#ffb4ab]/15 border border-[#ffb4ab]/40 text-[#ffb4ab] hover:bg-[#ffb4ab]/25 hover:border-[#ffb4ab]'
                  : 'bg-[#4edea3]/20 border border-[#4edea3]/50 text-[#4edea3] hover:bg-[#4edea3]/30 hover:border-[#4edea3]'
              }`}
            >
              {autoRotate ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-[#ffb4ab]" />
                  <span>Stop Globe Rotation</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#4edea3] fill-[#4edea3]" />
                  <span>Start Globe Rotation</span>
                </>
              )}
            </button>

            {/* Fine Controls: Direction & Speed */}
            <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#424754]/40 text-[10px]">
              {/* Direction selector */}
              <div className="flex items-center gap-0.5 bg-[#051424] p-0.5 rounded border border-[#424754]">
                <button
                  onClick={() => setRotationDirection('left')}
                  title="Rotate Counter-Clockwise (Left)"
                  className={`px-1.5 py-0.5 rounded flex items-center gap-0.5 transition-all ${
                    rotationDirection === 'left'
                      ? 'bg-[#273647] text-[#adc6ff] font-bold'
                      : 'text-[#8c909f] hover:text-[#d4e4fa]'
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>⟲</span>
                </button>
                <button
                  onClick={() => setRotationDirection('right')}
                  title="Rotate Clockwise (Right)"
                  className={`px-1.5 py-0.5 rounded flex items-center gap-0.5 transition-all ${
                    rotationDirection === 'right'
                      ? 'bg-[#273647] text-[#adc6ff] font-bold'
                      : 'text-[#8c909f] hover:text-[#d4e4fa]'
                  }`}
                >
                  <span>⟳</span>
                  <RotateCw className="w-3 h-3" />
                </button>
              </div>

              {/* Speed selector */}
              <div className="flex items-center gap-0.5 bg-[#051424] p-0.5 rounded border border-[#424754]">
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setRotationSpeed(spd)}
                    title={`Set Rotation Speed to ${spd}x`}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                      rotationSpeed === spd
                        ? 'bg-[#adc6ff] text-[#051424]'
                        : 'text-[#8c909f] hover:text-[#d4e4fa]'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[9px] text-[#8c909f] flex items-center justify-between">
              <span>Double-click globe to orient</span>
              <span className="text-[#adc6ff]">3D WebGL</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Visualizer Area */}
      <div className="flex-1 w-full h-full relative">
        {viewMode === '3D' ? (
          <Globe3DView
            hubs={hubs}
            selectedHub={selectedHub}
            onSelectHub={onSelectHub}
            transmissionMode={transmissionMode}
            autoRotate={autoRotate}
            onToggleAutoRotate={onToggleAutoRotate}
            zoomLevel={zoomLevel}
            rotationSpeed={rotationSpeed}
            rotationDirection={rotationDirection}
          />
        ) : (
          <Topology2DView
            nodes={nodes}
            paths={paths}
            activeUserSource={activeUserSource}
            transmissionMode={transmissionMode}
            onSelectNode={onSelectNode}
            selectedNode={selectedNode}
            bestPathId={bestPathId}
            isSimulating={isSimulating}
          />
        )}

        {/* Selected Hub Telemetry Card in 3D Mode */}
        {selectedHub && (
          <div className="absolute top-16 left-4 z-30 bg-[#122131]/95 backdrop-blur border border-[#adc6ff] rounded-xl p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_16px_rgba(173,198,255,0.2)] w-64 font-mono-data text-[11px] animate-toast">
            {/* Hub Header */}
            <div className="flex justify-between items-start border-b border-[#424754] pb-2 mb-2.5">
              <div>
                <div className="font-bold text-[#adc6ff] text-[13px] leading-tight">{selectedHub.name}</div>
                <div className="text-[9px] text-[#8c909f] mt-0.5 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    selectedHub.status === 'healthy' ? 'bg-[#4edea3]' :
                    selectedHub.status === 'warning' ? 'bg-[#ffb786]' : 'bg-[#ffb4ab]'
                  }`} />
                  <span className={`uppercase font-bold ${
                    selectedHub.status === 'healthy' ? 'text-[#4edea3]' :
                    selectedHub.status === 'warning' ? 'text-[#ffb786]' : 'text-[#ffb4ab]'
                  }`}>{selectedHub.status}</span>
                  <span className="text-[#424754]">•</span>
                  <span>{selectedHub.code}</span>
                </div>
              </div>
              <button
                onClick={() => onSelectHub(null)}
                className="text-[#424754] hover:text-[#d4e4fa] hover:bg-[#273647] w-5 h-5 rounded flex items-center justify-center transition-colors text-[12px] mt-0.5"
              >
                ✕
              </button>
            </div>

            {/* Metrics */}
            <div className="flex flex-col gap-1.5 text-[#c2c6d6]">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1 text-[#8c909f]"><Signal className="w-3 h-3" /> Direct Ping:</span>
                <span className={`font-bold ${
                  selectedHub.ping < 50 ? 'text-[#4edea3]' : selectedHub.ping < 120 ? 'text-[#ffb786]' : 'text-[#ffb4ab]'
                }`}>{selectedHub.ping} ms</span>
              </div>

              {/* Load bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#8c909f]">Cluster Load:</span>
                  <span className={`font-bold ${
                    selectedHub.load > 80 ? 'text-[#ffb4ab]' : selectedHub.load > 60 ? 'text-[#ffb786]' : 'text-[#4edea3]'
                  }`}>{selectedHub.load}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#273647] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedHub.load > 80 ? 'bg-[#ffb4ab]' : selectedHub.load > 60 ? 'bg-[#ffb786]' : 'bg-[#4edea3]'
                    }`}
                    style={{ width: `${selectedHub.load}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1 text-[#8c909f]"><Wifi className="w-3 h-3" /> Active Tunnels:</span>
                <span className="text-[#d4e4fa]">{selectedHub.activeTunnels} <span className="text-[#8c909f] text-[9px]">TLS-1.3</span></span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#424754]/50 mt-0.5">
                <span className="text-[#8c909f]">IP Gateway:</span>
                <span className="text-[#8c909f] font-mono text-[10px] bg-[#051424] px-1.5 py-0.5 rounded">{selectedHub.ip}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SLIDING BOX 3: Live Transmission Log Box (Always openable with icon)      */}
      {/* ========================================================================= */}
      {isLogCollapsed ? (
        <div className="absolute bottom-4 right-4 z-30 pointer-events-auto">
          <button
            onClick={() => setIsLogCollapsed(false)}
            title="Open Live Transmission Log (Click to expand)"
            className="bg-[#122131]/95 backdrop-blur-md border border-[#adc6ff]/50 hover:border-[#adc6ff] rounded-xl px-3.5 py-2.5 flex items-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(173,198,255,0.2)] hover:bg-[#1c2b3c] transition-all cursor-pointer group animate-pulse-slow"
          >
            <div className="w-2 h-2 rounded-full bg-[#4edea3] shadow-[0_0_6px_#4edea3] animate-pulse" />
            <Radio className="w-4 h-4 text-[#4edea3] group-hover:scale-110 transition-transform" />
            <span className="font-mono-data text-[11px] font-bold text-[#d4e4fa] group-hover:text-white">
              Live Transmissions ({ingestedFiles.length} Streams)
            </span>
            <ChevronUp className="w-4 h-4 text-[#adc6ff] group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      ) : (
        <div
          style={{ width: `${logBoxWidth}px` }}
          className="absolute bottom-4 right-4 z-30 bg-[#122131]/95 backdrop-blur-md border border-[#424754] rounded-xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto transition-all animate-toast"
        >
          {/* Header with size adjustment controls */}
          <div className="bg-[#1c2b3c] px-3.5 py-2.5 flex justify-between items-center border-b border-[#424754]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#4edea3] shadow-[0_0_6px_#4edea3] animate-pulse" />
              <Activity className="w-3.5 h-3.5 text-[#4edea3]" />
              <span className="font-mono-data text-[11px] font-bold text-[#d4e4fa]">
                Live Transmission Log
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              {/* Size preset adjustments */}
              <div className="flex items-center gap-1 bg-[#051424] p-0.5 rounded border border-[#424754]">
                <button
                  onClick={() => {
                    setLogBoxWidth(300);
                    setLogBoxHeight(200);
                  }}
                  title="Compact Log Box (300px)"
                  className={`px-1.5 py-0.5 text-[9px] font-mono-data rounded font-bold transition-all ${
                    logBoxWidth === 300 ? 'bg-[#adc6ff] text-[#002e6a]' : 'text-[#8c909f] hover:text-[#d4e4fa]'
                  }`}
                >
                  S
                </button>
                <button
                  onClick={() => {
                    setLogBoxWidth(380);
                    setLogBoxHeight(260);
                  }}
                  title="Medium Log Box (380px)"
                  className={`px-1.5 py-0.5 text-[9px] font-mono-data rounded font-bold transition-all ${
                    logBoxWidth === 380 ? 'bg-[#adc6ff] text-[#002e6a]' : 'text-[#8c909f] hover:text-[#d4e4fa]'
                  }`}
                >
                  M
                </button>
                <button
                  onClick={() => {
                    setLogBoxWidth(480);
                    setLogBoxHeight(360);
                  }}
                  title="Expanded Log Box (480px)"
                  className={`px-1.5 py-0.5 text-[9px] font-mono-data rounded font-bold transition-all ${
                    logBoxWidth === 480 ? 'bg-[#adc6ff] text-[#002e6a]' : 'text-[#8c909f] hover:text-[#d4e4fa]'
                  }`}
                >
                  L
                </button>
              </div>

              <span className="text-[9px] font-mono-data px-1.5 py-0.5 rounded bg-[#051424] text-[#8c909f] border border-[#424754]">
                {ingestedFiles.length} files
              </span>

              <button
                onClick={() => setIsLogCollapsed(true)}
                title="Collapse Log Drawer (Click to minimize)"
                className="p-1 rounded text-[#8c909f] hover:text-[#adc6ff] hover:bg-[#273647] transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content List */}
          <div
            style={{ maxHeight: `${logBoxHeight}px` }}
            className="p-2.5 flex flex-col gap-2 overflow-y-auto bg-[#010f1f]/80 font-mono-data"
          >
            {ingestedFiles.length === 0 ? (
              <div className="py-8 px-3 text-center flex flex-col items-center justify-center gap-3 text-[#8c909f]">
                <div className="w-10 h-10 rounded-full bg-[#122131] border border-[#424754] flex items-center justify-center">
                  <Radio className="w-5 h-5 text-[#424754]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#424754]">No Active Streams</span>
                  <span className="text-[9px] leading-relaxed text-[#424754]">
                    Queue empty · 0 files · 0 MB
                  </span>
                  <span className="text-[9px] leading-relaxed text-[#424754]/70">
                    Add files in Target Ingest to begin.
                  </span>
                </div>
              </div>
            ) : (
              ingestedFiles.map((file) => {
                const isCompletedFile = file.status === 'COMPLETED';
                const isFailed = file.status === 'FAILED';
                const isErrored = hasError && !isCompletedFile;
                const displayState = isCompletedFile
                  ? 'DONE'
                  : isFailed || isErrored
                    ? `FAILED`
                    : file.status === 'SYNCING'
                      ? `${file.progress}%`
                      : file.status;

                const statusClass = isCompletedFile
                  ? 'text-[#4edea3] bg-[#003824] border-[#4edea3]/40'
                  : isFailed || isErrored
                    ? 'text-[#ffb4ab] bg-[#93000a]/40 border-[#ffb4ab]/40'
                    : file.status === 'SYNCING'
                      ? 'text-[#adc6ff] bg-[#002e6a]/40 border-[#adc6ff]/40 animate-pulse'
                      : 'text-[#ffb786] bg-[#3a1a0f]/40 border-[#ffb786]/30';

                const barClass = isCompletedFile
                  ? 'bg-[#4edea3]'
                  : isFailed || isErrored
                    ? 'bg-[#ffb4ab]'
                    : 'bg-[#4d8eff]';

                return (
                  <div
                    key={file.id}
                    className={`flex flex-col gap-1 border rounded-lg p-2 transition-all ${
                      isErrored ? 'border-[#ffb4ab]/30 bg-[#93000a]/10' :
                      isCompletedFile ? 'border-[#4edea3]/20 bg-[#003824]/10' :
                      'border-[#424754]/30 bg-[#0a1929]/40'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-3 h-3 text-[#8c909f] flex-shrink-0" />
                        <span className="text-[10px] text-[#c2c6d6] truncate" title={file.name}>
                          {file.name}
                        </span>
                      </div>
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border flex-shrink-0 ml-1 ${statusClass}`}>
                        {displayState}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-[#8c909f]">
                      <span className="text-[#424754]">[{file.user}]</span>
                      <span className="text-[#424754]">{file.sizeMB} MB</span>
                    </div>

                    <div className="w-full h-1 bg-[#273647] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          barClass
                        } ${file.status === 'SYNCING' ? 'animate-shimmer' : ''}`}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Button */}
          <div className="p-2 bg-[#1c2b3c] border-t border-[#424754] flex flex-col gap-2">
            {hasError && onRetryTransfer && (
              <div className="flex items-center justify-between p-1.5 rounded bg-[#93000a]/20 border border-[#ffb4ab]/40 text-[10px] font-mono-data">
                <span className="text-[#ffdad6]">Transfer Interrupted</span>
                <button
                  onClick={onRetryTransfer}
                  className="px-2.5 py-0.5 rounded bg-[#adc6ff] hover:bg-[#d8e2ff] text-[#002e6a] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> Continue Transfer
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={onOpenTransmissionDetails}
                className="flex-1 py-1.5 bg-[#adc6ff]/10 hover:bg-[#adc6ff]/20 border border-[#adc6ff]/30 text-[#adc6ff] font-mono-data text-[10px] font-bold rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Details & Stream Traces</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsLogCollapsed(true)}
                title="Minimize box"
                className="px-2.5 py-1.5 bg-[#051424] hover:bg-[#273647] border border-[#424754] text-[#8c909f] hover:text-[#d4e4fa] rounded text-[10px] font-mono-data transition-all cursor-pointer"
              >
                Minimize
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
