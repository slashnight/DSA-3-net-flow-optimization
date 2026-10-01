import React, { useRef, useState } from 'react';
import {
  TransmissionMode,
  AnalysisMode,
  TopologyPreset,
  UserSource,
  IngestedFile,
  CompletedTransferRouteInfo,
} from '../types';
import {
  UploadCloud,
  Folder,
  Image as ImageIcon,
  Film,
  FileText,
  Play,
  Square,
  CornerDownRight,
  GitFork,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  Trash2,
  PlusCircle,
  FileArchive,
  Award,
  Sparkles,
  History,
  Gauge,
  Zap,
} from 'lucide-react';

interface LeftPanelProps {
  activeUserSource: UserSource;
  onChangeUserSource: (user: UserSource) => void;
  transmissionMode: TransmissionMode;
  onToggleTransmissionMode: (mode: TransmissionMode) => void;
  analysisMode: AnalysisMode;
  onToggleAnalysisMode: (mode: AnalysisMode) => void;
  topologyPreset: TopologyPreset;
  onChangeTopologyPreset: (preset: TopologyPreset) => void;
  ingestedFiles: IngestedFile[];
  onAddFiles: (files: FileList | File[]) => void;
  onClearFiles?: () => void;
  onLoadSampleFiles?: () => void;
  onOpenHistorySpace?: () => void;
  transferSpeedMbps?: number;
  onSpeedChange?: (speedMbps: number) => void;
  isSimulating: boolean;
  hasError?: boolean;
  errorMessage?: string;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  onStepBFS: () => void;
  onStepDFS: () => void;
  onSimulateError: () => void;
  onResetSimulation: () => void;
  onRetryTransfer?: () => void;
  onRerouteTransfer?: () => void;
  onCollapse?: () => void;
  width?: number;
  onResize?: (newWidth: number) => void;
  isCompleted?: boolean;
  routeInfo?: CompletedTransferRouteInfo | null;
  onOpenRouteAnalysis?: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  activeUserSource,
  onChangeUserSource,
  transmissionMode,
  onToggleTransmissionMode,
  analysisMode,
  onToggleAnalysisMode,
  topologyPreset,
  onChangeTopologyPreset,
  ingestedFiles,
  onAddFiles,
  onClearFiles,
  onLoadSampleFiles,
  onOpenHistorySpace,
  transferSpeedMbps = 2400,
  onSpeedChange,
  isSimulating,
  hasError = false,
  errorMessage,
  onStartSimulation,
  onStopSimulation,
  onStepBFS,
  onStepDFS,
  onSimulateError,
  onResetSimulation,
  onRetryTransfer,
  onRerouteTransfer,
  onCollapse,
  width = 320,
  onResize,
  isCompleted = false,
  routeInfo,
  onOpenRouteAnalysis,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Compute ingest statistics precisely
  const totalItems = ingestedFiles.length;
  const totalSizeMB = ingestedFiles.reduce((acc, f) => acc + f.sizeMB, 0);
  const totalSizeGB = totalSizeMB > 0 ? (totalSizeMB / 1024).toFixed(3) : '0.000';
  const availableBufferGB = Math.max(0, 15.0 - (totalSizeMB / 1024)).toFixed(2);

  // Count by categories
  const pictureCount = ingestedFiles.filter((f) => f.type === 'picture').length;
  const folderCount = ingestedFiles.filter((f) => f.type === 'folder' || f.type === 'archive').length;
  const docCount = ingestedFiles.filter((f) => f.type === 'document' || f.type === 'video').length;

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      const extractedFiles: File[] = [];

      // Check for Directory Entry support
      const traverseEntry = async (entry: any): Promise<void> => {
        if (entry.isFile) {
          return new Promise<void>((resolve) => {
            entry.file((file: File) => {
              extractedFiles.push(file);
              resolve();
            });
          });
        } else if (entry.isDirectory) {
          const reader = entry.createReader();
          return new Promise<void>((resolve) => {
            reader.readEntries(async (entries: any[]) => {
              for (const child of entries) {
                await traverseEntry(child);
              }
              resolve();
            });
          });
        }
      };

      const promises: Promise<void>[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.webkitGetAsEntry) {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            promises.push(traverseEntry(entry));
          }
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        if (extractedFiles.length > 0) {
          onAddFiles(extractedFiles);
          return;
        }
      }
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <aside className="w-full bg-[#122131] border-r border-[#424754] flex flex-col h-full flex-shrink-0 z-20 select-none overflow-y-auto relative">
      {/* Hidden File Inputs for Specific Categories */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onAddFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />
      <input
        type="file"
        ref={imageInputRef}
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onAddFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />
      <input
        type="file"
        ref={folderInputRef}
        multiple
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onAddFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Header with quick size controls and collapse */}
      <div className="p-3.5 border-b border-[#424754] flex items-center justify-between bg-[#1c2b3c]/50">
        <div>
          <h2 className="text-[16px] font-bold text-[#d4e4fa] tracking-tight font-inter mb-0.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#adc6ff] shadow-[0_0_6px_#adc6ff]" />
            Execution Parameters
          </h2>
          <div className="flex items-center gap-2">
            <p className="text-[11px] text-[#8c909f]">Flow analysis & topology</p>
            {onResize && (
              <span className="text-[9px] font-mono-data px-1.5 py-0.2 rounded bg-[#051424] text-[#adc6ff] border border-[#424754]">
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
                onClick={() => onResize(280)}
                title="Compact Width (280px)"
                className={`px-1.5 py-0.5 text-[9px] font-mono-data rounded font-bold transition-all cursor-pointer ${
                  Math.abs(width - 280) < 15 ? 'bg-[#adc6ff] text-[#002e6a]' : 'text-[#8c909f] hover:text-[#d4e4fa]'
                }`}
              >
                S
              </button>
              <button
                onClick={() => onResize(340)}
                title="Default Width (340px)"
                className={`px-1.5 py-0.5 text-[9px] font-mono-data rounded font-bold transition-all cursor-pointer ${
                  Math.abs(width - 340) < 15 ? 'bg-[#adc6ff] text-[#002e6a]' : 'text-[#8c909f] hover:text-[#d4e4fa]'
                }`}
              >
                M
              </button>
              <button
                onClick={() => onResize(440)}
                title="Expanded Width (440px)"
                className={`px-1.5 py-0.5 text-[9px] font-mono-data rounded font-bold transition-all cursor-pointer ${
                  Math.abs(width - 440) < 15 ? 'bg-[#adc6ff] text-[#002e6a]' : 'text-[#8c909f] hover:text-[#d4e4fa]'
                }`}
              >
                L
              </button>
            </div>
          )}

          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse Parameters Panel (Slide Left)"
              className="p-1.5 rounded-lg bg-[#1c2b3c] border border-[#424754] text-[#8c909f] hover:text-[#adc6ff] hover:border-[#adc6ff] hover:bg-[#273647] transition-all flex items-center justify-center group cursor-pointer"
            >
              <span className="text-[10px] font-mono-data font-bold text-[#8c909f] group-hover:text-[#adc6ff] mr-1">Hide</span>
              <CornerDownRight className="w-3.5 h-3.5 rotate-90" />
            </button>
          )}
        </div>
      </div>

      {/* Control Content */}
      <div className="p-4 flex-1 flex flex-col gap-4">
        {/* Active User Source */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono-data text-[10px] text-[#8c909f] font-bold uppercase tracking-wider">
            Active User Source
          </label>
          <select
            value={activeUserSource}
            onChange={(e) => onChangeUserSource(e.target.value as UserSource)}
            className="w-full bg-[#051424] border border-[#424754] rounded px-3 py-2 text-[12px] font-mono-data text-[#d4e4fa] focus:outline-none focus:border-[#adc6ff] focus:ring-1 focus:ring-[#adc6ff] transition-all cursor-pointer"
          >
            <option value="all">All Users (Aggregated Stream)</option>
            <option value="u1">User 1 (192.168.1.104)</option>
            <option value="u2">User 2 (10.0.4.18)</option>
            <option value="u3">User 3 (172.16.0.42)</option>
          </select>
        </div>

        {/* Transmission Mode Toggle */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-mono-data text-[10px] text-[#8c909f] font-bold uppercase tracking-wider">
              Transmission Mode
            </label>
            <span className="text-[9px] font-mono-data text-[#adc6ff]">
              {transmissionMode === 'send' ? 'Tx Uplink' : 'Rx Downlink'}
            </span>
          </div>
          <div className="flex bg-[#273647] p-1 rounded-lg relative">
            <button
              onClick={() => onToggleTransmissionMode('send')}
              className={`flex-1 font-mono-data text-[11px] font-bold py-1.5 rounded transition-all duration-200 cursor-pointer ${
                transmissionMode === 'send'
                  ? 'bg-[#1c2b3c] text-[#adc6ff] shadow border border-[#424754]'
                  : 'text-[#8c909f] hover:text-[#d4e4fa]'
              }`}
            >
              Send (Tx)
            </button>
            <button
              onClick={() => onToggleTransmissionMode('receive')}
              className={`flex-1 font-mono-data text-[11px] font-bold py-1.5 rounded transition-all duration-200 cursor-pointer ${
                transmissionMode === 'receive'
                  ? 'bg-[#1c2b3c] text-[#4edea3] shadow border border-[#424754]'
                  : 'text-[#8c909f] hover:text-[#d4e4fa]'
              }`}
            >
              Receive (Rx)
            </button>
          </div>
        </div>

        {/* Analysis Mode */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono-data text-[10px] text-[#8c909f] font-bold uppercase tracking-wider">
            Analysis Mode
          </label>
          <div className="flex bg-[#273647] p-1 rounded-lg">
            <button
              onClick={() => onToggleAnalysisMode('abstract')}
              className={`flex-1 font-mono-data text-[11px] font-bold py-1.5 rounded transition-all duration-200 cursor-pointer ${
                analysisMode === 'abstract'
                  ? 'bg-[#1c2b3c] text-[#d4e4fa] shadow border border-[#424754]'
                  : 'text-[#8c909f] hover:text-[#d4e4fa]'
              }`}
            >
              Abstract
            </button>
            <button
              onClick={() => onToggleAnalysisMode('datacenter')}
              className={`flex-1 font-mono-data text-[11px] font-bold py-1.5 rounded transition-all duration-200 cursor-pointer ${
                analysisMode === 'datacenter'
                  ? 'bg-[#1c2b3c] text-[#d4e4fa] shadow border border-[#424754]'
                  : 'text-[#8c909f] hover:text-[#d4e4fa]'
              }`}
            >
              Data Center
            </button>
          </div>
        </div>

        {/* Topology Preset */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono-data text-[10px] text-[#8c909f] font-bold uppercase tracking-wider">
            Topology Preset
          </label>
          <select
            value={topologyPreset}
            onChange={(e) => onChangeTopologyPreset(e.target.value as TopologyPreset)}
            className="w-full bg-[#051424] border border-[#424754] rounded px-3 py-2 text-[12px] text-[#d4e4fa] focus:outline-none focus:border-[#adc6ff] transition-all cursor-pointer"
          >
            <option value="Dense Mesh Network">Dense Mesh Network</option>
            <option value="Abstract Sparse Graph">Abstract Sparse Graph</option>
            <option value="Data Center / CDN Topology">Data Center / CDN Topology</option>
          </select>
        </div>

        {/* Target Ingest File Upload Box */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="font-mono-data text-[10px] text-[#8c909f] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>Target Ingest Queue</span>
              {totalItems > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#051424] border border-[#adc6ff]/40 text-[#adc6ff] text-[9px]">
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </span>
              )}
            </label>

            {/* Ingest Control Actions */}
            <div className="flex items-center gap-1">
              {onOpenHistorySpace && (
                <button
                  type="button"
                  onClick={onOpenHistorySpace}
                  title="Open History Space to restore previously stored transfer data"
                  className="text-[9px] font-mono-data text-[#4edea3] hover:text-[#7ef7c4] flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#003824]/60 border border-[#4edea3]/40 cursor-pointer transition-all hover:bg-[#003824]"
                >
                  <History className="w-2.5 h-2.5 text-[#4edea3]" />
                  <span>Restore History</span>
                </button>
              )}
              {totalItems > 0 && onClearFiles && (
                <button
                  type="button"
                  onClick={onClearFiles}
                  title="Clear Ingest Queue (Reset to 0)"
                  className="text-[9px] font-mono-data text-[#ffb4ab] hover:text-[#ffdad6] flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#93000a]/20 border border-[#ffb4ab]/30 cursor-pointer transition-all"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  <span>Clear (0)</span>
                </button>
              )}
              {totalItems === 0 && onLoadSampleFiles && (
                <button
                  type="button"
                  onClick={onLoadSampleFiles}
                  title="Load Sample Test Payload"
                  className="text-[9px] font-mono-data text-[#adc6ff] hover:text-[#d8e2ff] flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#adc6ff]/10 border border-[#adc6ff]/30 cursor-pointer transition-all"
                >
                  <PlusCircle className="w-2.5 h-2.5" />
                  <span>Sample</span>
                </button>
              )}
            </div>
          </div>

          {/* Drag & Drop Target Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleBrowseClick}
            className={`border-2 border-dashed rounded-lg p-3.5 flex flex-col items-center justify-center transition-all cursor-pointer group relative overflow-hidden ${
              isDragOver
                ? 'border-[#adc6ff] bg-[#122b44] shadow-[0_0_15px_rgba(173,198,255,0.25)]'
                : 'border-[#424754] bg-[#0d1c2d] hover:bg-[#122131] hover:border-[#adc6ff]'
            }`}
          >
            <UploadCloud
              className={`w-7 h-7 mb-1.5 transition-transform ${
                isDragOver ? 'text-[#adc6ff] scale-110' : 'text-[#8c909f] group-hover:text-[#adc6ff]'
              }`}
            />

            <span className="text-[11px] text-[#c2c6d6] text-center leading-tight">
              Drag & drop pictures, files, or folders here
              <br />
              or <span className="text-[#adc6ff] font-semibold underline underline-offset-2">browse files</span>
            </span>

            {/* Quick Ingest Category Triggers */}
            <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-[#424754]/40 text-[#8c909f] text-[10px] font-mono-data">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  folderInputRef.current?.click();
                }}
                className="flex items-center gap-1 hover:text-[#adc6ff] transition-colors p-1 rounded hover:bg-[#1c2b3c]"
                title="Browse Directory / Folder"
              >
                <Folder className="w-3 h-3 text-[#ffb786]" />
                <span>Folder</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  imageInputRef.current?.click();
                }}
                className="flex items-center gap-1 hover:text-[#adc6ff] transition-colors p-1 rounded hover:bg-[#1c2b3c]"
                title="Browse Pictures & Photos"
              >
                <ImageIcon className="w-3 h-3 text-[#4edea3]" />
                <span>Pictures</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-1 hover:text-[#adc6ff] transition-colors p-1 rounded hover:bg-[#1c2b3c]"
                title="Browse Documents & Archives"
              >
                <FileText className="w-3 h-3 text-[#adc6ff]" />
                <span>Docs</span>
              </button>
            </div>

            {/* Ingest Metrics Card */}
            <div className="w-full mt-3 p-2 bg-[#010f1f] rounded border border-[#424754]/40 font-mono-data text-[10px] flex flex-col gap-1">
              <div className="flex justify-between items-center text-[#8c909f]">
                <span>Total Ingest Items:</span>
                <span className={`font-bold ${totalItems > 0 ? 'text-[#adc6ff]' : 'text-[#8c909f]'}`}>
                  {totalItems}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#8c909f]">
                <span>Calculated Size:</span>
                <span className={`font-bold ${totalSizeMB > 0 ? 'text-[#4edea3]' : 'text-[#8c909f]'}`}>
                  {totalSizeMB === 0
                    ? '0.00 MB (0 GB)'
                    : totalSizeMB >= 1024
                    ? `${totalSizeGB} GB (${totalSizeMB.toFixed(1)} MB)`
                    : `${totalSizeMB.toFixed(2)} MB`}
                </span>
              </div>

              {totalItems > 0 && (
                <div className="flex justify-between text-[9px] text-[#8c909f] pt-0.5 border-t border-[#424754]/20">
                  <span>Composition:</span>
                  <span className="text-[#c2c6d6]">
                    {pictureCount > 0 && `${pictureCount} pics `}
                    {folderCount > 0 && `${folderCount} fldrs/arch `}
                    {docCount > 0 && `${docCount} docs`}
                    {pictureCount === 0 && folderCount === 0 && docCount === 0 && `${totalItems} files`}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-[#8c909f]">
                <span>Available Buffer:</span>
                <span className="text-[#adc6ff] font-bold">{availableBufferGB} GB / 15.0 GB</span>
              </div>

              <div className="mt-0.5 pt-1 border-t border-[#424754]/30 flex items-center justify-between text-[9px] text-[#8c909f]">
                <div className="flex items-center gap-1">
                  {isSimulating ? (
                    <>
                      <RefreshCw className="w-2.5 h-2.5 text-[#4edea3] animate-spin" />
                      <span className="text-[#4edea3]">
                        {transmissionMode === 'send' ? 'Tx Stream: Transmitting' : 'Rx Stream: Receiving'}
                      </span>
                    </>
                  ) : totalItems > 0 ? (
                    <>
                      <CheckCircle2 className="w-2.5 h-2.5 text-[#adc6ff]" />
                      <span className="text-[#adc6ff]">Payload Loaded & Ready</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-2.5 h-2.5 text-[#8c909f]" />
                      <span>Ingest Buffer: Empty (0 B)</span>
                    </>
                  )}
                </div>
                <span className="italic text-[8px] text-[#8c909f]">Memory Max 15 GB</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#424754] w-full my-0.5"></div>

        {/* Transmission Speed & Rate Controller */}
        <div className="flex flex-col gap-2 p-2.5 bg-[#051424] rounded-lg border border-[#424754] font-mono-data">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-[#8c909f] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[#4edea3]" />
              <span>Transmission Speed (Rate)</span>
            </label>
            <span className="text-[10px] font-bold text-[#4edea3]">
              {transferSpeedMbps >= 1000
                ? `${(transferSpeedMbps / 1000).toFixed(transferSpeedMbps % 1000 === 0 ? 0 : 1)} Gbps`
                : `${transferSpeedMbps} Mbps`}
            </span>
          </div>

          {/* Speed Real-time Rate Conversion & Payload Time Projection */}
          <div className="flex justify-between items-center text-[10px] bg-[#122131] px-2 py-1.5 rounded border border-[#424754]/60">
            <span className="text-[#8c909f]">
              Throughput Rate:{' '}
              <strong className="text-[#d4e4fa]">
                {(transferSpeedMbps / 8).toFixed(1)} MB/s
              </strong>
            </span>
            <span className="text-[#adc6ff]">
              {totalSizeMB > 0
                ? `ETA: ${(totalSizeMB / (transferSpeedMbps / 8)).toFixed(1)}s`
                : 'Queue: Ready'}
            </span>
          </div>

          {/* Speed Preset Quick Buttons */}
          <div className="grid grid-cols-6 gap-1 text-[9px] font-bold">
            {[
              { label: '500M', val: 500, title: '500 Mbps (Eco / Standard)' },
              { label: '1.2G', val: 1200, title: '1.2 Gbps (High Speed)' },
              { label: '2.4G', val: 2400, title: '2.4 Gbps (Optimal Dual-Link)' },
              { label: '5.0G', val: 5000, title: '5.0 Gbps (Turbo Multi-Path)' },
              { label: '10G', val: 10000, title: '10.0 Gbps (Ultra Optical)' },
              { label: '25G', val: 25000, title: '25.0 Gbps (Quantum Fiber Burst)' },
            ].map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => onSpeedChange && onSpeedChange(preset.val)}
                title={preset.title}
                className={`py-1 rounded text-center transition-all cursor-pointer border ${
                  Math.abs(transferSpeedMbps - preset.val) < 50
                    ? 'bg-[#4edea3] text-[#003824] border-[#4edea3] shadow-[0_0_8px_rgba(78,222,163,0.3)] font-bold'
                    : 'bg-[#1c2b3c] text-[#8c909f] hover:text-[#d4e4fa] hover:bg-[#273647] border-[#424754]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Continuous Interactive Speed Slider */}
          <div className="flex flex-col gap-1 mt-0.5">
            <div className="flex justify-between items-center text-[8px] text-[#8c909f]">
              <span>100 Mbps (Min)</span>
              <span>Slide to adjust send velocity</span>
              <span>25 Gbps (Max)</span>
            </div>
            <input
              type="range"
              min={100}
              max={25000}
              step={100}
              value={transferSpeedMbps}
              onChange={(e) => onSpeedChange && onSpeedChange(Number(e.target.value))}
              className="w-full h-1.5 bg-[#1c2b3c] rounded-lg appearance-none cursor-pointer accent-[#4edea3]"
            />
          </div>
        </div>

        <div className="h-px bg-[#424754] w-full my-0.5"></div>

        {/* Algorithm Execution Section */}
        <div className="flex flex-col gap-2 pb-2">
          <div className="flex justify-between items-center">
            <label className="font-mono-data text-[10px] text-[#8c909f] font-bold uppercase tracking-wider">
              Algorithm Execution
            </label>
            <span className="text-[9px] font-mono-data text-[#8c909f]">
              {transmissionMode === 'send' ? 'Tx Pipeline' : 'Rx Pipeline'}
            </span>
          </div>

          {/* Error Banner in LeftPanel */}
          {hasError && (
            <div className="p-2.5 bg-[#93000a]/20 border border-[#ffb4ab] rounded flex flex-col gap-1.5 font-mono-data text-[10px]">
              <div className="flex items-center gap-1.5 text-[#ffb4ab] font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Error: Not able to {transmissionMode === 'send' ? 'send' : 'receive'} stream</span>
              </div>
              <p className="text-[#ffdad6] text-[9px] leading-snug">
                {errorMessage || 'Primary link dropped. Transfer halted.'}
              </p>
              <div className="text-[10px] text-[#d4e4fa] font-bold font-inter mt-0.5">
                Should we continue the transfer again?
              </div>
              <div className="flex gap-1.5 mt-1">
                {onRetryTransfer && (
                  <button
                    onClick={onRetryTransfer}
                    className="flex-1 py-1 bg-[#adc6ff] hover:bg-[#d8e2ff] text-[#002e6a] font-bold rounded flex items-center justify-center gap-1 text-[9px] cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Continue Transfer
                  </button>
                )}
                {onRerouteTransfer && (
                  <button
                    onClick={onRerouteTransfer}
                    className="flex-1 py-1 bg-[#273647] hover:bg-[#1c2b3c] border border-[#4edea3]/40 text-[#4edea3] font-bold rounded flex items-center justify-center gap-1 text-[9px] cursor-pointer"
                  >
                    <GitFork className="w-2.5 h-2.5" /> Reroute
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Full Run Button */}
          <button
            onClick={hasError && onRetryTransfer ? onRetryTransfer : isSimulating ? onStopSimulation : onStartSimulation}
            disabled={totalItems === 0 && !isSimulating && !hasError}
            className={`w-full font-mono-data text-[11px] font-bold py-2 rounded flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 shadow cursor-pointer ${
              hasError
                ? 'bg-[#adc6ff] text-[#002e6a] hover:bg-[#d8e2ff] shadow-[0_0_12px_rgba(173,198,255,0.4)]'
                : totalItems === 0 && !isSimulating
                ? 'bg-[#273647] text-[#8c909f] cursor-not-allowed opacity-60'
                : isSimulating
                ? 'bg-[#ffb4ab] text-[#93000a] hover:bg-[#ffdad6]'
                : transmissionMode === 'send'
                ? 'bg-[#adc6ff] text-[#002e6a] hover:bg-[#d8e2ff]'
                : 'bg-[#4edea3] text-[#003824] hover:bg-[#6cfbc0]'
            }`}
          >
            {hasError ? (
              <>
                <RefreshCw className="w-3.5 h-3.5" /> Retry / Continue {transmissionMode === 'send' ? 'Sending' : 'Receiving'}
              </>
            ) : isSimulating ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" /> Stop {transmissionMode === 'send' ? 'Transmission' : 'Reception'}
              </>
            ) : totalItems === 0 ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current opacity-50" /> Put Files to Run (0 MB)
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Start {transmissionMode === 'send' ? 'Send Process (Tx)' : 'Receive Process (Rx)'}
              </>
            )}
          </button>

          {/* Step BFS / Step DFS */}
          <div className="flex gap-2">
            <button
              onClick={onStepBFS}
              className="flex-1 bg-[#273647] text-[#d4e4fa] border border-[#424754] font-mono-data text-[10px] font-bold py-1.5 rounded flex items-center justify-center gap-1 hover:bg-[#1c2b3c] transition-all active:scale-95 cursor-pointer"
            >
              <CornerDownRight className="w-3 h-3 text-[#adc6ff]" /> Step BFS
            </button>
            <button
              onClick={onStepDFS}
              className="flex-1 bg-[#273647] text-[#d4e4fa] border border-[#424754] font-mono-data text-[10px] font-bold py-1.5 rounded flex items-center justify-center gap-1 hover:bg-[#1c2b3c] transition-all active:scale-95 cursor-pointer"
            >
              <GitFork className="w-3 h-3 text-[#4edea3]" /> Step DFS
            </button>
          </div>

          {/* Completed Fastest Route Analysis Shortcut */}
          {isCompleted && routeInfo && onOpenRouteAnalysis && (
            <button
              onClick={onOpenRouteAnalysis}
              className="w-full bg-[#003824] hover:bg-[#004e32] border-2 border-[#4edea3] text-[#4edea3] font-mono-data text-[11px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-[0_0_15px_rgba(78,222,163,0.3)] cursor-pointer animate-slideDown"
            >
              <Sparkles className="w-3.5 h-3.5" /> Inspect Fastest Route ({routeInfo.fastestRoute.totalLatencyMs}ms)
            </button>
          )}

          {/* Simulate Error Button */}
          <button
            onClick={onSimulateError}
            className="w-full bg-transparent border border-[#ffb4ab]/40 text-[#ffb4ab] font-mono-data text-[10px] font-bold py-1.5 rounded hover:bg-[#93000a]/20 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <AlertTriangle className="w-3 h-3 text-[#ffb4ab]" /> Simulate Error (Drop Link)
          </button>

          {/* Reset Simulation */}
          <button
            onClick={onResetSimulation}
            className="w-full bg-transparent border border-[#424754] text-[#8c909f] hover:text-[#d4e4fa] font-mono-data text-[10px] py-1.5 rounded hover:bg-[#1c2b3c] transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset Simulation
          </button>
        </div>
      </div>
    </aside>
  );
};

