import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  Archive,
  Folder,
  CheckCircle2,
  Calendar,
  Clock,
  HardDrive,
  User,
  ShieldCheck,
  Hash,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { IngestedFile } from '../../types';
import { triggerDownloadFile } from '../../utils/historyStorage';

interface FilePreviewModalProps {
  file: IngestedFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, isOpen, onClose }) => {
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen || !file) return null;

  const now = new Date();
  const dateStr = file.formattedTimestamp || file.timestamp || now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const checksum = file.checksumHash || `SHA3-512:${file.id.slice(0, 16)}...quantum-verified`;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(checksum);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const renderFileContent = () => {
    if (file.dataUrl && (file.type === 'picture' || file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i))) {
      return (
        <div className="flex flex-col items-center justify-center p-4 bg-[#051424] rounded-lg border border-[#424754] max-h-96 overflow-hidden">
          <img
            src={file.dataUrl}
            alt={file.name}
            className="max-h-80 max-w-full object-contain rounded border border-[#424754]/50 shadow-lg"
          />
        </div>
      );
    }

    if (file.dataUrl && (file.type === 'video' || file.name.match(/\.(mp4|webm|mov)$/i))) {
      return (
        <div className="flex flex-col items-center justify-center p-4 bg-[#051424] rounded-lg border border-[#424754]">
          <video
            src={file.dataUrl}
            controls
            className="max-h-80 max-w-full rounded border border-[#424754]/50"
          />
        </div>
      );
    }

    if (file.contentPreview) {
      return (
        <pre className="p-4 bg-[#051424] rounded-lg border border-[#424754] text-[#adc6ff] font-mono-data text-[12px] max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed">
          {file.contentPreview}
        </pre>
      );
    }

    // Default simulated payload preview for network streams
    const samplePayloadPreview = `================================================================================
NETWORK TRANSMISSION PAYLOAD MANIFEST & DECODED STREAM
================================================================================
Filename       : ${file.name}
File Identifier: ${file.id}
Payload Type   : ${file.type.toUpperCase()}
Total Bandwidth: ${file.sizeMB} MB (${Math.round(file.sizeMB * 1024 * 1024).toLocaleString()} bytes)
Origin Station : ${file.user}
Date & Time    : ${dateStr}
Security State : Kyber-768 Quantum-Resistant Encrypted Tunnel Verified
Integrity Hash : ${checksum}
Transmission   : 100% Complete • 0 Packet Loss

--------------------------------------------------------------------------------
[DECRYPTED STREAM DATA FRAGMENT]
00000000  7f 45 4c 46 02 01 01 00  00 00 00 00 00 00 00 00  |.ELF............|
00000010  03 00 3e 00 01 00 00 00  d0 5d 00 00 00 00 00 00  |..>......]......|
00000020  40 00 00 00 00 00 00 00  18 1f 02 00 00 00 00 00  |@...............|
00000030  00 00 00 00 40 00 38 00  09 00 40 00 1f 00 1e 00  |....@.8...@.....|
00000040  06 00 00 00 04 00 00 00  40 00 00 00 00 00 00 00  |........@.......|
...
[Payload stream verified and restored successfully into active workspace]
================================================================================`;

    return (
      <pre className="p-4 bg-[#051424] rounded-lg border border-[#424754] text-[#adc6ff] font-mono-data text-[11px] max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed">
        {samplePayloadPreview}
      </pre>
    );
  };

  const getIcon = () => {
    switch (file.type) {
      case 'picture':
        return <ImageIcon className="w-5 h-5 text-[#adc6ff]" />;
      case 'video':
        return <Video className="w-5 h-5 text-[#ffb786]" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-[#ffb4ab]" />;
      case 'folder':
        return <Folder className="w-5 h-5 text-[#4edea3]" />;
      default:
        return <FileText className="w-5 h-5 text-[#adc6ff]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#122131] border border-[#424754] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col font-inter animate-toast">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#424754] flex justify-between items-center bg-[#1c2b3c]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#051424] border border-[#424754]">
              {getIcon()}
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#d4e4fa] flex items-center gap-2">
                {file.name}
              </h3>
              <div className="flex items-center gap-3 text-[11px] text-[#8c909f] font-mono-data mt-0.5">
                <span className="flex items-center gap-1 text-[#4edea3]">
                  <CheckCircle2 className="w-3 h-3" /> Transferred & Verified
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#adc6ff]" /> {dateStr}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8c909f] hover:text-[#d4e4fa] hover:bg-[#273647] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-data">
            <div className="p-3 bg-[#0d1c2d] border border-[#424754] rounded-xl flex flex-col">
              <span className="text-[10px] text-[#8c909f] uppercase flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-[#adc6ff]" /> Payload Size
              </span>
              <span className="text-[14px] font-bold text-[#d4e4fa] mt-1">{file.sizeMB} MB</span>
              <span className="text-[10px] text-[#8c909f]">
                {Math.round(file.sizeMB * 1024 * 1024).toLocaleString()} bytes
              </span>
            </div>

            <div className="p-3 bg-[#0d1c2d] border border-[#424754] rounded-xl flex flex-col">
              <span className="text-[10px] text-[#8c909f] uppercase flex items-center gap-1">
                <User className="w-3 h-3 text-[#ffb786]" /> Transmitted By
              </span>
              <span className="text-[14px] font-bold text-[#ffb786] mt-1">{file.user}</span>
              <span className="text-[10px] text-[#8c909f]">Authenticated</span>
            </div>

            <div className="p-3 bg-[#0d1c2d] border border-[#424754] rounded-xl flex flex-col">
              <span className="text-[10px] text-[#8c909f] uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#4edea3]" /> Transmit Speed
              </span>
              <span className="text-[14px] font-bold text-[#4edea3] mt-1">
                {file.speedMbps || 520} Mbps
              </span>
              <span className="text-[10px] text-[#8c909f]">Dinic Multi-Path</span>
            </div>

            <div className="p-3 bg-[#0d1c2d] border border-[#424754] rounded-xl flex flex-col">
              <span className="text-[10px] text-[#8c909f] uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#adc6ff]" /> Cryptography
              </span>
              <span className="text-[14px] font-bold text-[#adc6ff] mt-1">Kyber-768</span>
              <span className="text-[10px] text-[#4edea3]">Quantum-Safe</span>
            </div>
          </div>

          {/* SHA3 Integrity Hash */}
          <div className="p-3 bg-[#051424] border border-[#424754] rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <Hash className="w-4 h-4 text-[#adc6ff] flex-shrink-0" />
              <span className="font-mono-data text-[11px] text-[#adc6ff] truncate">
                {checksum}
              </span>
            </div>
            <button
              onClick={handleCopyHash}
              className="px-2.5 py-1 bg-[#1c2b3c] border border-[#424754] hover:border-[#adc6ff] rounded text-[10px] font-mono-data text-[#d4e4fa] flex items-center gap-1 flex-shrink-0 transition-colors cursor-pointer"
            >
              {copiedHash ? <Check className="w-3 h-3 text-[#4edea3]" /> : <Copy className="w-3 h-3" />}
              {copiedHash ? 'Copied' : 'Copy Hash'}
            </button>
          </div>

          {/* File Content / Preview Viewport */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] font-bold text-[#d4e4fa] uppercase font-mono-data flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#adc6ff]" /> Payload Stream Preview
              </span>
              <span className="text-[10px] text-[#8c909f] font-mono-data">
                Verified Date: {dateStr}
              </span>
            </div>
            {renderFileContent()}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#424754] bg-[#0d1c2d] flex justify-between items-center">
          <span className="text-[11px] text-[#8c909f] font-mono-data">
            Saved in Network Transfer History with exact Date & Timestamp
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[12px] font-mono-data text-[#8c909f] hover:text-[#d4e4fa] hover:bg-[#1c2b3c] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => triggerDownloadFile(file)}
              className="px-5 py-2 bg-[#adc6ff] hover:bg-[#d8e2ff] text-[#002e6a] font-mono-data font-bold text-[12px] rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(173,198,255,0.25)] active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Receive & Download File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
