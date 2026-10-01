import React from 'react';
import {
  AlertTriangle,
  RotateCcw,
  Play,
  GitFork,
  X,
  Radio,
  HardDrive,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { TransmissionMode } from '../../types';

interface TransferErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: TransmissionMode;
  errorMessage?: string;
  transferredMB: number;
  totalPayloadMB: number;
  progressPercent: number;
  onRetryTransfer: () => void;
  onRerouteTransfer: () => void;
  onResetTransfer: () => void;
}

export const TransferErrorModal: React.FC<TransferErrorModalProps> = ({
  isOpen,
  onClose,
  mode,
  errorMessage = 'Primary link dropped (Timeout / Outage). Packet delivery failed.',
  transferredMB,
  totalPayloadMB,
  progressPercent,
  onRetryTransfer,
  onRerouteTransfer,
  onResetTransfer,
}) => {
  if (!isOpen) return null;

  const isSending = mode === 'send';
  const actionName = isSending ? 'send' : 'receive';
  const processLabel = isSending ? 'Sending (Tx Uplink)' : 'Receiving (Rx Downlink)';

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-[#122131] border-2 border-[#ffb4ab] rounded-xl w-full max-w-xl shadow-[0_10px_40px_rgba(255,180,171,0.25)] overflow-hidden flex flex-col font-inter">
        {/* Header */}
        <div className="px-5 py-4 bg-[#93000a]/20 border-b border-[#ffb4ab]/40 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#93000a]/40 border border-[#ffb4ab]/60 text-[#ffb4ab] animate-pulse">
              <AlertTriangle className="w-5 h-5 text-[#ffb4ab]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-data uppercase px-2 py-0.5 rounded bg-[#93000a] text-[#ffdad6] font-bold">
                  Network Failure
                </span>
                <span className="text-[11px] font-mono-data text-[#ffb4ab]">
                  {processLabel}
                </span>
              </div>
              <h3 className="font-bold text-[16px] text-[#ffdad6] mt-0.5">
                Error: Not able to {actionName} stream
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8c909f] hover:text-[#d4e4fa] hover:bg-[#1c2b3c] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 font-mono-data text-[12px] bg-[#051424]/60">
          {/* Error Description Box */}
          <div className="p-3 rounded-lg bg-[#93000a]/15 border border-[#ffb4ab]/30 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[#ffb4ab] font-bold text-[11px]">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Interruption Diagnostics
              </span>
              <span className="text-[10px] text-[#ffdad6] bg-[#93000a]/50 px-1.5 py-0.2 rounded">
                CRITICAL
              </span>
            </div>
            <p className="text-[#ffdad6] text-[12px] font-mono font-medium leading-relaxed">
              {errorMessage}
            </p>
          </div>

          {/* Current Transmission Progress snapshot */}
          <div className="p-3 bg-[#122131] rounded-lg border border-[#424754] flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] text-[#8c909f]">
              <span className="flex items-center gap-1 uppercase font-bold">
                <HardDrive className="w-3.5 h-3.5 text-[#adc6ff]" />
                Stream Progress Before Interruption
              </span>
              <span className="text-[#ffb4ab] font-bold font-mono">
                {progressPercent.toFixed(1)}% ({transferredMB.toFixed(1)} / {totalPayloadMB.toFixed(1)} MB)
              </span>
            </div>
            <div className="w-full h-2 bg-[#1c2b3c] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ffb4ab] rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Prompt Question */}
          <div className="py-2 px-3 rounded-lg bg-[#1c2b3c] border border-[#adc6ff]/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#adc6ff] animate-ping" />
              <span className="text-[13px] font-bold text-[#d4e4fa] font-inter">
                Should we continue the transfer again?
              </span>
            </div>
            <span className="text-[10px] text-[#adc6ff] font-mono-data uppercase font-bold">
              Automatic Recovery Available
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-5 py-4 border-t border-[#424754] bg-[#0d1c2d] flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            onClick={() => {
              onResetTransfer();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-transparent hover:bg-[#1c2b3c] border border-[#424754] text-[#8c909f] hover:text-[#d4e4fa] font-mono-data text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Cancel & Reset
          </button>

          <button
            onClick={() => {
              onRerouteTransfer();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-[#273647] hover:bg-[#1c2b3c] border border-[#4edea3]/50 text-[#4edea3] font-mono-data text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-[0_0_12px_rgba(78,222,163,0.3)]"
          >
            <GitFork className="w-3.5 h-3.5" />
            Reroute via Alternate Paths & Continue
          </button>

          <button
            onClick={() => {
              onRetryTransfer();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2 bg-[#adc6ff] hover:bg-[#d8e2ff] text-[#002e6a] font-mono-data text-[12px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(173,198,255,0.4)] cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Continue / Retry Transfer
          </button>
        </div>
      </div>
    </div>
  );
};
