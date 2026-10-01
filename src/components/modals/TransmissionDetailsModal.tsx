import React from 'react';
import { IngestedFile } from '../../types';
import { X, Activity, FileCheck, Shield, CheckCircle2, RefreshCw, Eye, Download } from 'lucide-react';
import { triggerDownloadFile } from '../../utils/historyStorage';

interface TransmissionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: IngestedFile[];
  onOpenFile?: (file: IngestedFile) => void;
}

export const TransmissionDetailsModal: React.FC<TransmissionDetailsModalProps> = ({
  isOpen,
  onClose,
  files,
  onOpenFile,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#122131] border border-[#424754] rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col font-inter animate-toast max-h-[85vh]">
        <div className="px-5 py-4 border-b border-[#424754] flex justify-between items-center bg-[#1c2b3c]">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#4edea3]" />
            <h3 className="font-bold text-[16px] text-[#d4e4fa]">
              Live Ingest & Packet Chunk Transmission Traces
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#8c909f] hover:text-[#d4e4fa]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto font-mono-data text-[12px]">
          <div className="flex items-center justify-between p-3 bg-[#051424] rounded border border-[#424754]">
            <div className="flex items-center gap-2 text-[#4edea3]">
              <Shield className="w-4 h-4" />
              <span>Forward Error Correction (FEC): Reed-Solomon RS(255, 223)</span>
            </div>
            <span className="text-[#8c909f] text-[11px]">Loss Resilience: 15%</span>
          </div>

          <div className="flex flex-col gap-3">
            {files.map((f) => (
              <div key={f.id} className="p-4 bg-[#051424] rounded-lg border border-[#424754] flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[#adc6ff] font-bold">[{f.user}]</span>
                    <span className="text-[#d4e4fa] font-semibold">{f.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        f.status === 'COMPLETED'
                          ? 'bg-[#003824] text-[#4edea3]'
                          : f.status === 'SYNCING'
                          ? 'bg-[#002e6a] text-[#adc6ff]'
                          : 'bg-[#502400] text-[#ffb786]'
                      }`}
                    >
                      {f.status}
                    </span>
                    {onOpenFile && (
                      <button
                        onClick={() => onOpenFile(f)}
                        className="px-2 py-1 bg-[#122131] hover:bg-[#4edea3] hover:text-[#003824] border border-[#424754] rounded text-[10px] text-[#4edea3] flex items-center gap-1 transition-colors cursor-pointer"
                        title="Open and view file"
                      >
                        <Eye className="w-3 h-3" /> Open
                      </button>
                    )}
                    <button
                      onClick={() => triggerDownloadFile(f)}
                      className="p-1 hover:bg-[#1c2b3c] hover:text-[#adc6ff] rounded text-[#8c909f] transition-colors cursor-pointer"
                      title="Receive & download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#8c909f]">
                  <div>Size: <span className="text-[#d4e4fa]">{f.sizeMB} MB</span></div>
                  <div>Progress: <span className="text-[#4edea3]">{f.progress}%</span></div>
                  <div>Rate: <span className="text-[#adc6ff]">{f.speedMbps} Mbps</span></div>
                  <div>Hash: <span className="text-[#8c909f] font-mono">e8f4..3c9a</span></div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[#1c2b3c] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      f.status === 'COMPLETED' ? 'bg-[#4edea3]' : 'bg-[#4d8eff]'
                    }`}
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-[#424754] bg-[#0d1c2d] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#adc6ff] text-[#002e6a] font-mono-data font-bold text-[12px] rounded hover:bg-[#d8e2ff]"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
