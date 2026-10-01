import React, { useState } from 'react';
import {
  TransferHistoryRecord,
  IngestedFile,
} from '../../types';
import {
  X,
  History,
  RotateCcw,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HardDrive,
  FileText,
  FileCode,
  Image,
  Video,
  Archive,
  Folder,
  Layers,
  Cpu,
  Clock,
  Activity,
  Award,
  Hash,
  Copy,
  Check,
  Eye,
} from 'lucide-react';
import { triggerDownloadFile } from '../../utils/historyStorage';

interface HistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: TransferHistoryRecord | null;
  onRestore: (record: TransferHistoryRecord) => void;
  onOpenFile?: (file: IngestedFile) => void;
}

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  onRestore,
  onOpenFile,
}) => {
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  if (!isOpen || !record) return null;

  const handleCopyHash = () => {
    if (record.checksumHash) {
      navigator.clipboard.writeText(record.checksumHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const getFileIcon = (type: IngestedFile['type']) => {
    switch (type) {
      case 'folder':
        return <Folder className="w-4 h-4 text-[#adc6ff]" />;
      case 'picture':
        return <Image className="w-4 h-4 text-[#4edea3]" />;
      case 'video':
        return <Video className="w-4 h-4 text-[#d4bbff]" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-[#ffb77b]" />;
      case 'document':
      default:
        return <FileText className="w-4 h-4 text-[#8c909f]" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#0b1726] border-2 border-[#adc6ff]/50 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_0_40px_rgba(173,198,255,0.25)] overflow-hidden font-inter text-[#d4e4fa]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#051424] border-b border-[#424754]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                record.mode === 'send'
                  ? 'bg-[#002e6a]/50 border-[#adc6ff]/40 text-[#adc6ff]'
                  : 'bg-[#003824]/50 border-[#4edea3]/40 text-[#4edea3]'
              }`}
            >
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[17px] text-[#adc6ff] font-mono-data">
                  {record.id} • Detailed Telemetry Audit
                </h3>
                <span
                  className={`text-[10px] font-mono-data font-bold px-2 py-0.5 rounded uppercase border ${
                    record.mode === 'send'
                      ? 'bg-[#002e6a] text-[#adc6ff] border-[#adc6ff]/40'
                      : 'bg-[#003824] text-[#4edea3] border-[#4edea3]/40'
                  }`}
                >
                  {record.mode === 'send' ? 'Tx (Send Payload)' : 'Rx (Receive Payload)'}
                </span>
                <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30">
                  {record.status}
                </span>
              </div>
              <p className="text-[12px] text-[#8c909f]">
                Recorded: {record.formattedDate} • Auto-Persisted to Local Storage Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8c909f] hover:text-[#d4e4fa] hover:bg-[#122131] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick Action Restore Banner */}
          <div className="p-4 bg-gradient-to-r from-[#002e6a]/40 to-[#003824]/40 border-2 border-[#4edea3] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(78,222,163,0.15)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#4edea3] font-bold text-[14px]">
                <RotateCcw className="w-4 h-4" />
                <span>Restore Entire Data Payload into Active Workspace</span>
              </div>
              <p className="text-[12px] text-[#8c909f]">
                Loads all {(Array.isArray(record?.files) ? record.files : []).length} file(s) ({record.totalSizeMB || 0} MB), endpoint routing, and transmission mode directly into the execution staging buffer.
              </p>
            </div>

            <button
              onClick={() => {
                onRestore(record);
                onClose();
              }}
              className="px-5 py-2.5 bg-[#4edea3] hover:bg-[#6cfbc0] text-[#003824] font-bold font-mono-data text-[12px] rounded-xl transition-all shadow-[0_0_15px_rgba(78,222,163,0.4)] active:scale-95 flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" /> Restore Data Now
            </button>
          </div>

          {/* Node-to-Node Route Map Visual */}
          <div className="bg-[#051424] p-4 rounded-xl border border-[#424754] space-y-3">
            <div className="text-[11px] font-mono-data text-[#8c909f] uppercase tracking-wider font-bold">
              Transmission Endpoint Topology
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              {/* Origin Node */}
              <div className="p-3 bg-[#122131] rounded-lg border border-[#424754] space-y-1">
                <span className="text-[10px] text-[#adc6ff] font-mono-data uppercase font-bold block">
                  Origin Node (Source)
                </span>
                <div className="font-bold text-[13px] text-[#d4e4fa]">{record.sourceNode?.label || 'Unknown Source'}</div>
                <div className="text-[11px] font-mono-data text-[#8c909f]">
                  IP: <span className="text-[#adc6ff]">{record.sourceNode?.ip || 'N/A'}</span>
                </div>
                <div className="text-[10px] text-[#8c909f]">{record.sourceNode?.dataCenter || 'No data center'}</div>
              </div>

              {/* Transit Intermediary */}
              <div className="flex flex-col items-center justify-center p-2 text-center space-y-1 font-mono-data">
                <div className="text-[10px] text-[#4edea3] font-bold flex items-center gap-1">
                  <span>{record.algorithm}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] text-[#adc6ff]">
                  Transit Time: <strong className="text-[#4edea3]">{record.durationSec}s</strong>
                </div>
                <div className="text-[10px] text-[#8c909f]">
                  Speed: {record.averageSpeedMbps.toLocaleString()} Mbps
                </div>
              </div>

              {/* Target Node */}
              <div className="p-3 bg-[#122131] rounded-lg border border-[#424754] space-y-1">
                <span className="text-[10px] text-[#4edea3] font-mono-data uppercase font-bold block">
                  Destination Node (Target)
                </span>
                <div className="font-bold text-[13px] text-[#d4e4fa]">{record.targetNode?.label || 'Unknown Target'}</div>
                <div className="text-[11px] font-mono-data text-[#8c909f]">
                  IP: <span className="text-[#4edea3]">{record.targetNode?.ip || 'N/A'}</span>
                </div>
                <div className="text-[10px] text-[#8c909f]">{record.targetNode?.dataCenter || 'No data center'}</div>
              </div>
            </div>
          </div>

          {/* Files Manifest Table */}
          <div className="bg-[#051424] p-4 rounded-xl border border-[#424754] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono-data text-[#8c909f] uppercase tracking-wider font-bold flex items-center gap-2">
                <HardDrive className="w-3.5 h-3.5 text-[#adc6ff]" />
                Ingested Files Manifest ({(Array.isArray(record?.files) ? record.files : []).length} items • {record.totalSizeMB || 0} MB)
              </span>
              <span className="text-[10px] text-[#4edea3] font-mono-data">
                All Payloads Stored & Recoverable
              </span>
            </div>

            <div className="divide-y divide-[#424754]/60 border border-[#424754]/80 rounded-lg overflow-hidden">
              {(Array.isArray(record?.files) ? record.files : []).map((file, idx) => (
                <div
                  key={file?.id || idx}
                  className="flex items-center justify-between p-3 bg-[#122131]/60 hover:bg-[#1c2b3c] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-[#051424] border border-[#424754]">
                      {getFileIcon(file.type)}
                    </div>
                    <div>
                      <div className="font-mono-data font-bold text-[12px] text-[#d4e4fa]">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-[#8c909f] flex items-center gap-2">
                        <span>{file.sizeMB} MB</span>
                        <span>•</span>
                        <span>User: {file.user}</span>
                        <span>•</span>
                        <span className="text-[#4edea3]">SHA3 OK</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenFile && (
                      <button
                        onClick={() => onOpenFile(file)}
                        className="px-3 py-1.5 bg-[#1c2b3c] hover:bg-[#4edea3] hover:text-[#003824] border border-[#424754] rounded text-[11px] font-mono-data font-bold transition-colors flex items-center gap-1.5 cursor-pointer text-[#4edea3]"
                        title={`Open and inspect ${file.name}`}
                      >
                        <Eye className="w-3.5 h-3.5" /> Open & View
                      </button>
                    )}
                    <button
                      onClick={() => triggerDownloadFile(file)}
                      className="px-3 py-1.5 bg-[#1c2b3c] hover:bg-[#adc6ff] hover:text-[#002e6a] border border-[#424754] rounded text-[11px] font-mono-data font-bold transition-colors flex items-center gap-1.5 cursor-pointer text-[#d4e4fa]"
                    >
                      <Download className="w-3.5 h-3.5" /> Download File
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance & Security Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#051424] rounded-xl border border-[#424754] font-mono-data">
              <span className="text-[10px] text-[#8c909f] block">Peak Throughput:</span>
              <span className="text-[16px] font-bold text-[#4edea3]">
                {record.peakThroughputGbps} Gbps
              </span>
            </div>

            <div className="p-3 bg-[#051424] rounded-xl border border-[#424754] font-mono-data">
              <span className="text-[10px] text-[#8c909f] block">Packets Transferred:</span>
              <span className="text-[16px] font-bold text-[#adc6ff]">
                {record.totalPackets.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-[#051424] rounded-xl border border-[#424754] font-mono-data">
              <span className="text-[10px] text-[#8c909f] block">Encryption Standard:</span>
              <span className="text-[13px] font-bold text-[#4edea3] truncate block">
                {record.encryptionStandard || 'Kyber-768 Quantum-Safe'}
              </span>
            </div>

            <div className="p-3 bg-[#051424] rounded-xl border border-[#424754] font-mono-data">
              <span className="text-[10px] text-[#8c909f] block">Times Restored:</span>
              <span className="text-[16px] font-bold text-[#d4bbff]">
                {record.restoredCount || 0} times
              </span>
            </div>
          </div>

          {/* Checksum & Hash Audit */}
          {record.checksumHash && (
            <div className="bg-[#051424] p-3 rounded-xl border border-[#424754] flex items-center justify-between font-mono-data text-[11px]">
              <div className="flex items-center gap-2 overflow-hidden">
                <ShieldCheck className="w-4 h-4 text-[#4edea3] flex-shrink-0" />
                <span className="text-[#8c909f] flex-shrink-0">Cryptographic Checksum:</span>
                <span className="text-[#4edea3] truncate">{record.checksumHash}</span>
              </div>
              <button
                onClick={handleCopyHash}
                className="px-2.5 py-1 bg-[#122131] hover:bg-[#1c2b3c] border border-[#424754] rounded text-[10px] text-[#adc6ff] flex items-center gap-1 cursor-pointer flex-shrink-0"
              >
                {copiedHash ? <Check className="w-3 h-3 text-[#4edea3]" /> : <Copy className="w-3 h-3" />}
                {copiedHash ? 'Copied' : 'Copy Hash'}
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#051424] border-t border-[#424754]">
          <button
            onClick={handleCopyJson}
            className="px-3.5 py-1.5 bg-[#122131] hover:bg-[#1c2b3c] border border-[#424754] rounded-lg text-[11px] font-mono-data text-[#adc6ff] flex items-center gap-1.5 cursor-pointer"
          >
            {copiedJson ? <Check className="w-3.5 h-3.5 text-[#4edea3]" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedJson ? 'JSON Copied' : 'Copy Record JSON'}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#122131] hover:bg-[#1c2b3c] border border-[#424754] text-[#8c909f] hover:text-[#d4e4fa] font-mono-data text-[12px] font-bold rounded-lg cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onRestore(record);
                onClose();
              }}
              className="px-5 py-2 bg-[#4edea3] hover:bg-[#6cfbc0] text-[#003824] font-mono-data text-[12px] font-bold rounded-lg cursor-pointer shadow-[0_0_15px_rgba(78,222,163,0.3)] flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Restore Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
