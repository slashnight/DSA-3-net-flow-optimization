import React, { useState, useMemo, useEffect } from 'react';
import {
  TransferHistoryRecord,
  TransmissionMode,
  IngestedFile,
  HistoryFilterOptions,
} from '../../types';
import {
  History,
  RotateCcw,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  HardDrive,
  Cpu,
  Trash2,
  FileText,
  Image,
  Video,
  Archive,
  Folder,
  Star,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  FileJson,
  PlusCircle,
  ExternalLink,
  ChevronDown,
  Info,
  X,
  ArrowLeft,
  Eye,
} from 'lucide-react';
import {
  exportHistoryAsJSON,
  exportHistoryAsCSV,
  triggerDownloadFile,
} from '../../utils/historyStorage';
import { HistoryDetailModal } from '../modals/HistoryDetailModal';

interface HistorySpaceScreenProps {
  historyRecords?: TransferHistoryRecord[];
  records?: TransferHistoryRecord[];
  onRestoreRecord: (record: TransferHistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAllHistory: () => void;
  onToggleFavorite: (id: string) => void;
  onSnapshotCurrentWorkspace: () => void;
  onNavigateToExecution: () => void;
  onClose?: () => void;
  onResetSeedData: () => void;
  onOpenFile?: (file: IngestedFile) => void;
  currentPayloadCount?: number;
  currentPayloadMB?: number;
  currentMode?: TransmissionMode;
}

export const HistorySpaceScreen: React.FC<HistorySpaceScreenProps> = ({
  historyRecords,
  records,
  onRestoreRecord,
  onDeleteRecord,
  onClearAllHistory,
  onToggleFavorite,
  onSnapshotCurrentWorkspace,
  onNavigateToExecution,
  onClose,
  onResetSeedData,
  onOpenFile,
}) => {
  const allRecords = Array.isArray(historyRecords)
    ? historyRecords
    : Array.isArray(records)
      ? records
      : [];
  const normalizedRecords = Array.isArray(allRecords) ? allRecords.filter(Boolean) : [];
  const safeRecords = useMemo(
    () =>
      normalizedRecords.map((record) => ({
        ...record,
        id: String(record?.id || `record-${Math.random().toString(36).slice(2)}`),
        mode: record?.mode || 'send',
        status: record?.status || 'SUCCESS',
        totalSizeMB: Number(record?.totalSizeMB) || 0,
        totalPackets: Number(record?.totalPackets) || 0,
        durationSec: Number(record?.durationSec) || 0,
        averageSpeedMbps: Number(record?.averageSpeedMbps) || 0,
        peakThroughputGbps: Number(record?.peakThroughputGbps) || 0,
        algorithm: record?.algorithm || 'Dinic\'s Algorithm',
        topologyPreset: record?.topologyPreset || 'Dense Mesh Network',
        userSource: record?.userSource || 'all',
        sourceNode: record?.sourceNode || { id: '', label: '', ip: '', dataCenter: '' },
        targetNode: record?.targetNode || { id: '', label: '', ip: '', dataCenter: '' },
        files: Array.isArray(record?.files) ? record.files : [],
        routeInfo: record?.routeInfo || null,
        encryptionStandard: record?.encryptionStandard || 'Kyber-768 Quantum-Safe',
        checksumHash: record?.checksumHash || 'N/A',
        notes: record?.notes || 'Transferred payload was saved to history.',
        isFavorite: Boolean(record?.isFavorite),
        restoredCount: Number(record?.restoredCount) || 0,
        clientIp: record?.clientIp || '0.0.0.0',
        autoSaved: record?.autoSaved ?? true,
      })),
    [normalizedRecords]
  );
  const handleClose = onClose || onNavigateToExecution;

  // Listen for Escape key to quickly close History Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);
  const [filters, setFilters] = useState<HistoryFilterOptions>({
    searchQuery: '',
    direction: 'all',
    status: 'all',
    fileType: 'all',
    userSource: 'all',
    sortBy: 'newest',
    onlyFavorites: false,
  });

  const [selectedRecordForDetail, setSelectedRecordForDetail] =
    useState<TransferHistoryRecord | null>(null);
  const [restoringRecordId, setRestoringRecordId] = useState<string | null>(null);

  // Filter & Sort computation
  const filteredRecords = useMemo(() => {
    if (!Array.isArray(safeRecords)) return [];
    return safeRecords
      .filter((rec) => {
        const safeRecord = rec || ({} as TransferHistoryRecord);
        const fileList = Array.isArray(safeRecord.files) ? safeRecord.files : [];
        const sourceNode = safeRecord.sourceNode || { label: '', ip: '', dataCenter: '' };
        const targetNode = safeRecord.targetNode || { label: '', ip: '', dataCenter: '' };

        // Search query match
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchId = String(safeRecord.id || '').toLowerCase().includes(q);
          const matchMode = String(safeRecord.mode || '').toLowerCase().includes(q);
          const matchAlgorithm = String(safeRecord.algorithm || '').toLowerCase().includes(q);
          const matchSource =
            (sourceNode.label || '').toLowerCase().includes(q) ||
            (sourceNode.ip || '').toLowerCase().includes(q);
          const matchTarget =
            (targetNode.label || '').toLowerCase().includes(q) ||
            (targetNode.ip || '').toLowerCase().includes(q);
          const matchFiles = fileList.some((f) => String(f?.name || '').toLowerCase().includes(q));
          const matchNotes = String(safeRecord.notes || '').toLowerCase().includes(q);
          const matchHash = String(safeRecord.checksumHash || '').toLowerCase().includes(q);

          if (
            !matchId &&
            !matchMode &&
            !matchAlgorithm &&
            !matchSource &&
            !matchTarget &&
            !matchFiles &&
            !matchNotes &&
            !matchHash
          ) {
            return false;
          }
        }

        // Direction filter
        if (filters.direction === 'send' && safeRecord.mode !== 'send') return false;
        if (filters.direction === 'receive' && safeRecord.mode !== 'receive') return false;
        if (filters.direction === 'restored' && (!safeRecord.restoredCount || safeRecord.restoredCount <= 0))
          return false;

        // Status filter
        if (filters.status !== 'all' && safeRecord.status !== filters.status) return false;

        // User source filter
        if (filters.userSource !== 'all' && safeRecord.userSource !== filters.userSource) return false;

        // File type filter
        if (filters.fileType !== 'all') {
          const hasType = fileList.some((f) => f.type === filters.fileType);
          if (!hasType) return false;
        }

        // Favorites filter
        if (filters.onlyFavorites && !safeRecord.isFavorite) return false;

        return true;
      })
      .sort((a, b) => {
        const aTime = new Date(a?.timestamp || 0).getTime();
        const bTime = new Date(b?.timestamp || 0).getTime();

        if (filters.sortBy === 'newest') {
          return bTime - aTime;
        }
        if (filters.sortBy === 'oldest') {
          return aTime - bTime;
        }
        if (filters.sortBy === 'largest') {
          return (b?.totalSizeMB || 0) - (a?.totalSizeMB || 0);
        }
        if (filters.sortBy === 'fastest') {
          return (b?.averageSpeedMbps || 0) - (a?.averageSpeedMbps || 0);
        }
        return 0;
      });
  }, [safeRecords, filters]);

  // Aggregate Stats
  const totalMB = useMemo(() => {
    return safeRecords.reduce((acc, r) => acc + (Number(r?.totalSizeMB) || 0), 0);
  }, [safeRecords]);

  const sendCount = useMemo(() => {
    return safeRecords.filter((r) => r?.mode === 'send').length;
  }, [safeRecords]);

  const receiveCount = useMemo(() => {
    return safeRecords.filter((r) => r?.mode === 'receive').length;
  }, [safeRecords]);

  const totalRestorations = useMemo(() => {
    return safeRecords.reduce((acc, r) => acc + (Number(r?.restoredCount) || 0), 0);
  }, [safeRecords]);

  const avgSpeed = useMemo(() => {
    if (safeRecords.length === 0) return 0;
    const sum = safeRecords.reduce((acc, r) => acc + (Number(r?.averageSpeedMbps) || 0), 0);
    return Math.round(sum / safeRecords.length);
  }, [safeRecords]);

  const handleRestoreWithAnimation = (record: TransferHistoryRecord) => {
    setRestoringRecordId(record.id);
    setTimeout(() => {
      onRestoreRecord(record);
      setRestoringRecordId(null);
    }, 350);
  };

  const getFileIcon = (type: IngestedFile['type']) => {
    switch (type) {
      case 'folder':
        return <Folder className="w-3.5 h-3.5 text-[#adc6ff]" />;
      case 'picture':
        return <Image className="w-3.5 h-3.5 text-[#4edea3]" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-[#d4bbff]" />;
      case 'archive':
        return <Archive className="w-3.5 h-3.5 text-[#ffb77b]" />;
      case 'document':
      default:
        return <FileText className="w-3.5 h-3.5 text-[#8c909f]" />;
    }
  };

  return (
    <div className="flex-1 h-full bg-[#030e1a] text-[#d4e4fa] flex flex-col overflow-y-auto font-inter select-none">
      {/* Top Banner & Title Bar */}
      <div className="bg-[#051424] border-b border-[#424754] px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#002e6a] to-[#003824] border-2 border-[#4edea3]/50 text-[#4edea3] shadow-[0_0_20px_rgba(78,222,163,0.2)]">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#adc6ff] font-mono-data">
                Transfer & Receive History Space
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#003824] text-[#4edea3] font-mono-data text-[11px] font-bold border border-[#4edea3]/40">
                {normalizedRecords.length} Saved Records
              </span>
            </div>
            <p className="text-[13px] text-[#8c909f] mt-0.5">
              All transmitted & received network payloads are automatically stored. Click{' '}
              <strong className="text-[#4edea3]">"Restore Data"</strong> on any entry to reload the
              exact payload and routing into your active transmission workspace.
            </p>
          </div>
        </div>

        {/* Global Space Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Snapshot Current Workspace Button */}
          <button
            onClick={onSnapshotCurrentWorkspace}
            className="px-3.5 py-2 bg-[#122131] hover:bg-[#1c2b3c] border border-[#adc6ff]/40 text-[#adc6ff] font-mono-data text-[11px] font-bold rounded-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#adc6ff]" />
            Snapshot Active Workspace
          </button>

          {/* Export Dropdowns */}
          <button
            onClick={() => exportHistoryAsJSON(filteredRecords)}
            title="Export Records as JSON File"
            className="px-3 py-2 bg-[#122131] hover:bg-[#1c2b3c] border border-[#424754] text-[#d4e4fa] font-mono-data text-[11px] font-bold rounded-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 text-[#4edea3]" />
            JSON
          </button>

          <button
            onClick={() => exportHistoryAsCSV(filteredRecords)}
            title="Export Records as CSV Spreadsheet"
            className="px-3 py-2 bg-[#122131] hover:bg-[#1c2b3c] border border-[#424754] text-[#d4e4fa] font-mono-data text-[11px] font-bold rounded-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#adc6ff]" />
            CSV
          </button>

          {/* Go to Execution Tab */}
          <button
            onClick={onNavigateToExecution}
            className="px-3.5 py-2 bg-[#1c2b3c] hover:bg-[#273647] border border-[#4edea3]/40 text-[#4edea3] font-mono-data text-[11px] font-bold rounded-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Workspace
          </button>

          {/* Dedicated Close Button to move back to original page */}
          <button
            onClick={handleClose}
            title="Close History Space and return to the previous page (Esc)"
            className="px-4 py-2 bg-[#ffb4ab]/15 hover:bg-[#ffb4ab]/25 border-2 border-[#ffb4ab]/60 hover:border-[#ffb4ab] text-[#ffb4ab] font-mono-data text-[11px] font-bold rounded-lg transition-all active:scale-95 flex items-center gap-2 shadow-[0_0_15px_rgba(255,180,171,0.2)] cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Close History</span>
            <X className="w-3.5 h-3.5 ml-0.5 opacity-80 group-hover:opacity-100" />
          </button>
        </div>
      </div>

      {/* Real-time Persistence & Auto-Save Telemetry Bar */}
      <div className="bg-[#051424]/80 border-b border-[#424754] px-6 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono-data text-[11px]">
        <div className="flex items-center gap-2 text-[#4edea3]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4edea3]"></span>
          </span>
          <span className="font-bold">AUTOMATIC PERSISTENCE ACTIVE:</span>
          <span className="text-[#8c909f]">
            Every send and receive cycle is automatically recorded, checksummed, and saved to local storage.
          </span>
        </div>

        <div className="flex items-center gap-3 text-[#8c909f] text-[10px]">
          <span>Storage Engine: <strong className="text-[#adc6ff]">LocalStorage V2</strong></span>
          <span>•</span>
          <button
            onClick={onResetSeedData}
            className="hover:text-[#adc6ff] underline cursor-pointer"
          >
            Reset Seed Records
          </button>
          <span>•</span>
          <button
            onClick={onClearAllHistory}
            className="hover:text-[#ffb4ab] underline cursor-pointer"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Aggregate Statistics Header Cards */}
      <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Data Stored */}
        <div className="p-3.5 bg-[#051424] border border-[#424754] rounded-xl font-mono-data flex flex-col justify-between shadow-sm">
          <div className="text-[10px] text-[#8c909f] uppercase font-bold flex items-center justify-between">
            <span>Total Stored Payload</span>
            <HardDrive className="w-3.5 h-3.5 text-[#adc6ff]" />
          </div>
          <div className="text-[19px] font-bold text-[#adc6ff] mt-1">
            {totalMB > 1024 ? `${(totalMB / 1024).toFixed(2)} GB` : `${totalMB.toFixed(1)} MB`}
          </div>
          <div className="text-[9px] text-[#8c909f] mt-0.5">Across {normalizedRecords.length} records</div>
        </div>

        {/* Send vs Receive Ratio */}
        <div className="p-3.5 bg-[#051424] border border-[#424754] rounded-xl font-mono-data flex flex-col justify-between shadow-sm">
          <div className="text-[10px] text-[#8c909f] uppercase font-bold flex items-center justify-between">
            <span>Tx / Rx Volume</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#4edea3]" />
          </div>
          <div className="text-[17px] font-bold text-[#d4e4fa] mt-1 flex items-center gap-2">
            <span className="text-[#adc6ff]">{sendCount} Tx</span>
            <span className="text-[#8c909f]">/</span>
            <span className="text-[#4edea3]">{receiveCount} Rx</span>
          </div>
          <div className="text-[9px] text-[#8c909f] mt-0.5">Two-way traffic audit</div>
        </div>

        {/* Average Speed */}
        <div className="p-3.5 bg-[#051424] border border-[#424754] rounded-xl font-mono-data flex flex-col justify-between shadow-sm">
          <div className="text-[10px] text-[#8c909f] uppercase font-bold flex items-center justify-between">
            <span>Avg Network Speed</span>
            <Cpu className="w-3.5 h-3.5 text-[#4edea3]" />
          </div>
          <div className="text-[19px] font-bold text-[#4edea3] mt-1">
            {avgSpeed.toLocaleString()} <span className="text-[11px] font-normal text-[#8c909f]">Mbps</span>
          </div>
          <div className="text-[9px] text-[#8c909f] mt-0.5">Dinic & Edmonds-Karp flows</div>
        </div>

        {/* Total Data Restorations */}
        <div className="p-3.5 bg-[#051424] border border-[#424754] rounded-xl font-mono-data flex flex-col justify-between shadow-sm">
          <div className="text-[10px] text-[#8c909f] uppercase font-bold flex items-center justify-between">
            <span>Data Restorations</span>
            <RotateCcw className="w-3.5 h-3.5 text-[#d4bbff]" />
          </div>
          <div className="text-[19px] font-bold text-[#d4bbff] mt-1">
            {totalRestorations} <span className="text-[11px] font-normal text-[#8c909f]">times</span>
          </div>
          <div className="text-[9px] text-[#8c909f] mt-0.5">Loaded into workspace</div>
        </div>

        {/* Security & Checksums */}
        <div className="p-3.5 bg-[#051424] border border-[#424754] rounded-xl font-mono-data flex flex-col justify-between shadow-sm col-span-2 sm:col-span-1">
          <div className="text-[10px] text-[#8c909f] uppercase font-bold flex items-center justify-between">
            <span>Integrity Health</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#4edea3]" />
          </div>
          <div className="text-[17px] font-bold text-[#4edea3] mt-1">
            100% OK
          </div>
          <div className="text-[9px] text-[#8c909f] mt-0.5">SHA3-512 & Kyber Verified</div>
        </div>
      </div>

      {/* Control & Filter Toolbar */}
      <div className="px-6 py-3 bg-[#051424] border-y border-[#424754] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 font-mono-data text-[11px]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#8c909f] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by file, node, IP, record ID, or hash..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full bg-[#122131] border border-[#424754] focus:border-[#adc6ff] rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-[#d4e4fa] placeholder-[#8c909f] outline-none transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c909f] hover:text-[#d4e4fa]"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Pills & Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Direction Filter Pills */}
          <div className="flex items-center p-0.5 bg-[#122131] border border-[#424754] rounded-lg">
            <button
              onClick={() => setFilters({ ...filters, direction: 'all' })}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                filters.direction === 'all'
                  ? 'bg-[#adc6ff] text-[#002e6a]'
                  : 'text-[#8c909f] hover:text-[#d4e4fa]'
              }`}
            >
              All ({Array.isArray(normalizedRecords) ? normalizedRecords.length : 0})
            </button>
            <button
              onClick={() => setFilters({ ...filters, direction: 'send' })}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                filters.direction === 'send'
                  ? 'bg-[#002e6a] text-[#adc6ff] border border-[#adc6ff]/40'
                  : 'text-[#8c909f] hover:text-[#adc6ff]'
              }`}
            >
              <ArrowUpRight className="w-3 h-3 text-[#adc6ff]" /> Tx ({sendCount})
            </button>
            <button
              onClick={() => setFilters({ ...filters, direction: 'receive' })}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                filters.direction === 'receive'
                  ? 'bg-[#003824] text-[#4edea3] border border-[#4edea3]/40'
                  : 'text-[#8c909f] hover:text-[#4edea3]'
              }`}
            >
              <ArrowDownLeft className="w-3 h-3 text-[#4edea3]" /> Rx ({receiveCount})
            </button>
            <button
              onClick={() => setFilters({ ...filters, direction: 'restored' })}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                filters.direction === 'restored'
                  ? 'bg-[#3b2d54] text-[#d4bbff] border border-[#d4bbff]/40'
                  : 'text-[#8c909f] hover:text-[#d4bbff]'
              }`}
            >
              <RotateCcw className="w-3 h-3" /> Restored ({totalRestorations})
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-[#122131] border border-[#424754] rounded-lg px-2 py-1">
            <span className="text-[#8c909f] text-[10px]">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="bg-transparent text-[#adc6ff] text-[10px] font-bold outline-none cursor-pointer"
            >
              <option value="newest" className="bg-[#051424]">Newest First</option>
              <option value="oldest" className="bg-[#051424]">Oldest First</option>
              <option value="largest" className="bg-[#051424]">Largest Size</option>
              <option value="fastest" className="bg-[#051424]">Fastest Speed</option>
            </select>
          </div>

          {/* Only Favorites Button */}
          <button
            onClick={() => setFilters({ ...filters, onlyFavorites: !filters.onlyFavorites })}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              filters.onlyFavorites
                ? 'bg-[#ffb77b]/20 border-[#ffb77b] text-[#ffb77b]'
                : 'bg-[#122131] border-[#424754] text-[#8c909f] hover:text-[#d4e4fa]'
            }`}
            title="Show only starred records"
          >
            <Star className={`w-3.5 h-3.5 ${filters.onlyFavorites ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main History Records List / Grid */}
      <div className="flex-1 p-6 space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center bg-[#051424] border border-[#424754] rounded-2xl flex flex-col items-center justify-center space-y-3 font-mono-data">
            <History className="w-10 h-10 text-[#8c909f] opacity-40 animate-pulse" />
            <div className="text-[15px] font-bold text-[#adc6ff]">No History Records Matching Filters</div>
            <p className="text-[12px] text-[#8c909f] max-w-md">
              {filters.searchQuery
                ? `No transmissions match "${filters.searchQuery}". Try clearing your search query or direction filter.`
                : 'You can execute a new file transfer in the Execution tab or snapshot your active workspace to populate history.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setFilters({ ...filters, searchQuery: '', direction: 'all', status: 'all', onlyFavorites: false })}
                className="px-4 py-2 bg-[#122131] hover:bg-[#1c2b3c] border border-[#424754] rounded-lg text-[11px] font-bold text-[#adc6ff] cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                onClick={onResetSeedData}
                className="px-4 py-2 bg-[#4edea3] hover:bg-[#6cfbc0] text-[#003824] rounded-lg text-[11px] font-bold cursor-pointer"
              >
                Load Sample Records
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => {
              const safeRecord = record || ({} as TransferHistoryRecord);
              const fileList = Array.isArray(safeRecord.files) ? safeRecord.files : [];
              const isRestoring = restoringRecordId === safeRecord.id;
              const safeSourceNode = safeRecord.sourceNode || { label: '', ip: '', dataCenter: '' };
              const safeTargetNode = safeRecord.targetNode || { label: '', ip: '', dataCenter: '' };
              return (
                <div
                  key={safeRecord.id}
                  className={`bg-[#051424] border-2 rounded-2xl p-4 sm:p-5 transition-all shadow-md hover:shadow-xl font-mono-data text-[11px] ${
                    safeRecord.mode === 'send'
                      ? 'border-[#adc6ff]/30 hover:border-[#adc6ff]'
                      : 'border-[#4edea3]/30 hover:border-[#4edea3]'
                  } ${isRestoring ? 'scale-[0.99] border-[#4edea3] bg-[#003824]/20' : ''}`}
                >
                  {/* Record Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#424754]/80">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Direction Pill */}
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border ${
                          safeRecord.mode === 'send'
                            ? 'bg-[#002e6a] text-[#adc6ff] border-[#adc6ff]/50'
                            : 'bg-[#003824] text-[#4edea3] border-[#4edea3]/50'
                        }`}
                      >
                        {safeRecord.mode === 'send' ? (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5" /> TX (SEND PAYLOAD)
                          </>
                        ) : (
                          <>
                            <ArrowDownLeft className="w-3.5 h-3.5" /> RX (RECEIVE PAYLOAD)
                          </>
                        )}
                      </span>

                      {/* Record ID */}
                      <span className="text-[#adc6ff] font-bold text-[12px]">{safeRecord.id}</span>

                      {/* Status */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          safeRecord.status === 'SUCCESS'
                            ? 'bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30'
                            : safeRecord.status === 'REROUTED'
                            ? 'bg-[#ffb77b]/10 text-[#ffb77b] border border-[#ffb77b]/30'
                            : 'bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30'
                        }`}
                      >
                        {safeRecord.status}
                      </span>

                      {/* Restored Indicator */}
                      {safeRecord.restoredCount && safeRecord.restoredCount > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-[#d4bbff]/10 text-[#d4bbff] border border-[#d4bbff]/30 text-[10px]">
                          Restored {safeRecord.restoredCount}x
                        </span>
                      ) : null}

                      {/* Auto-saved badge */}
                      <span className="px-1.5 py-0.2 rounded bg-[#122131] text-[#8c909f] text-[9px] border border-[#424754]">
                        Auto-Saved
                      </span>
                    </div>

                    {/* Right Timestamp & Actions */}
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] text-[#8c909f] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{safeRecord.formattedDate}</span>
                      </div>

                      {/* Star Button */}
                      <button
                        onClick={() => onToggleFavorite(safeRecord.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          safeRecord.isFavorite
                            ? 'bg-[#ffb77b]/20 border-[#ffb77b] text-[#ffb77b]'
                            : 'bg-[#122131] border-[#424754] text-[#8c909f] hover:text-[#d4e4fa]'
                        }`}
                        title="Star / Favorite"
                      >
                        <Star className={`w-3.5 h-3.5 ${safeRecord.isFavorite ? 'fill-current' : ''}`} />
                      </button>

                      {/* Delete Single Record */}
                      <button
                        onClick={() => onDeleteRecord(safeRecord.id)}
                        className="p-1.5 rounded-lg bg-[#122131] hover:bg-[#ffb4ab]/20 hover:text-[#ffb4ab] border border-[#424754] text-[#8c909f] transition-colors cursor-pointer"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Record Body: Endpoints, Performance, and Files */}
                  <div className="py-3.5 grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                    {/* Column 1: Source ➔ Target Endpoint Flow */}
                    <div className="bg-[#122131]/80 p-3 rounded-xl border border-[#424754] space-y-2">
                      <div className="text-[10px] text-[#8c909f] uppercase font-bold flex items-center justify-between">
                        <span>Transmission Route</span>
                        <span className="text-[#adc6ff]">{safeRecord.algorithm}</span>
                      </div>

                      {/* Origin */}
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#8c909f]">Origin (From):</span>
                        <span className="text-[#adc6ff] font-bold">{safeSourceNode.label}</span>
                      </div>
                      <div className="text-[9px] text-[#8c909f] pl-2 -mt-1">
                        IP: <span className="text-[#d4e4fa]">{safeSourceNode.ip}</span> • {safeSourceNode.dataCenter}
                      </div>

                      {/* Destination */}
                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-[#424754]/50">
                        <span className="text-[#8c909f]">Destination (To):</span>
                        <span className="text-[#4edea3] font-bold">{safeTargetNode.label}</span>
                      </div>
                      <div className="text-[9px] text-[#8c909f] pl-2 -mt-1">
                        IP: <span className="text-[#d4e4fa]">{safeTargetNode.ip}</span> • {safeTargetNode.dataCenter}
                      </div>
                    </div>

                    {/* Column 2: Performance Telemetry */}
                    <div className="bg-[#122131]/80 p-3 rounded-xl border border-[#424754] space-y-2">
                      <div className="text-[10px] text-[#8c909f] uppercase font-bold">
                        Performance Metrics
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-[#8c909f] block">Payload Volume:</span>
                          <span className="text-[#adc6ff] font-bold text-[13px]">
                            {safeRecord.totalSizeMB} MB
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8c909f] block">Transit Time:</span>
                          <span className="text-[#4edea3] font-bold text-[13px]">
                            {safeRecord.durationSec}s
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8c909f] block">Avg Speed:</span>
                          <span className="text-[#d4e4fa] font-bold text-[12px]">
                            {safeRecord.averageSpeedMbps.toLocaleString()} Mbps
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8c909f] block">Packets:</span>
                          <span className="text-[#8c909f] text-[11px]">
                            {safeRecord.totalPackets.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Ingested File List Preview */}
                    <div className="bg-[#122131]/80 p-3 rounded-xl border border-[#424754] space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#8c909f] uppercase font-bold">
                          Transferred Files ({fileList.length})
                        </span>
                        <span className="text-[#4edea3] text-[9px]">Verified Checksum</span>
                      </div>

                      <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                        {fileList.map((file, fIdx) => (
                          <div
                            key={file?.id || fIdx}
                            className="flex items-center justify-between p-1.5 rounded bg-[#051424] border border-[#424754]/60 text-[10px]"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              {getFileIcon(file?.type || 'document')}
                              <span className="text-[#d4e4fa] font-bold truncate max-w-[140px]">
                                {file?.name || 'Untitled file'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-[#8c909f] text-[9px]">{Number(file?.sizeMB) || 0} MB</span>
                              {onOpenFile && file && (
                                <button
                                  onClick={() => onOpenFile(file)}
                                  title={`Open and inspect ${file.name || 'file'}`}
                                  className="p-1 hover:bg-[#1c2b3c] hover:text-[#4edea3] rounded transition-colors text-[#8c909f] cursor-pointer"
                                >
                                  <Eye className="w-3 h-3 text-[#4edea3]" />
                                </button>
                              )}
                              {file && (
                                <button
                                  onClick={() => triggerDownloadFile(file)}
                                  title={`Download ${file.name || 'file'}`}
                                  className="p-1 hover:bg-[#1c2b3c] hover:text-[#adc6ff] rounded transition-colors text-[#8c909f] cursor-pointer"
                                >
                                  <Download className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notes & Verification Hash */}
                  {safeRecord.notes && (
                    <div className="text-[10px] text-[#8c909f] bg-[#051424] px-3 py-1.5 rounded-lg border border-[#424754]/50 mb-3 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-[#adc6ff] flex-shrink-0" />
                      <span>{safeRecord.notes}</span>
                    </div>
                  )}

                  {/* Record Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#424754]/80">
                    <div className="flex items-center gap-2 text-[10px] text-[#8c909f]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#4edea3]" />
                      <span>Standard: <strong className="text-[#d4e4fa]">{safeRecord.encryptionStandard || 'Kyber-768'}</strong></span>
                      <span>•</span>
                      <span>Origin User: <strong className="text-[#adc6ff]">{safeRecord.userSource}</strong></span>
                    </div>

                    {/* Interactive Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Inspect Telemetry Modal */}
                      <button
                        onClick={() => setSelectedRecordForDetail(safeRecord)}
                        className="px-3.5 py-1.5 bg-[#122131] hover:bg-[#1c2b3c] border border-[#424754] text-[#adc6ff] rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Full Telemetry
                      </button>

                      {/* MAIN RESTORE BUTTON */}
                      <button
                        onClick={() => handleRestoreWithAnimation(safeRecord)}
                        disabled={isRestoring}
                        className="px-4 py-1.5 bg-[#4edea3] hover:bg-[#6cfbc0] text-[#003824] font-bold rounded-lg text-[11px] transition-all shadow-[0_0_15px_rgba(78,222,163,0.3)] active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
                        {isRestoring ? 'Restoring Data...' : 'Restore Data into Workspace'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail & Manifest Audit Modal */}
      <HistoryDetailModal
        isOpen={!!selectedRecordForDetail}
        onClose={() => setSelectedRecordForDetail(null)}
        record={selectedRecordForDetail}
        onRestore={onRestoreRecord}
        onOpenFile={onOpenFile}
      />
    </div>
  );
};
