import React from 'react';
import { SystemSettings } from '../../types';
import { X, Sliders, Shield, Zap, RefreshCw, Volume2, Globe } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#122131] border border-[#424754] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col font-inter animate-toast">
        <div className="px-5 py-4 border-b border-[#424754] flex justify-between items-center bg-[#1c2b3c]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#adc6ff]" />
            <h3 className="font-bold text-[16px] text-[#d4e4fa]">System & Telemetry Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#8c909f] hover:text-[#d4e4fa]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 text-[13px] font-mono-data">
          {/* Encryption Standard */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[#8c909f] font-bold uppercase">Encryption Standard</label>
            <select
              value={settings.encryptionStandard}
              onChange={(e) =>
                onUpdateSettings({
                  encryptionStandard: e.target.value as SystemSettings['encryptionStandard'],
                })
              }
              className="w-full bg-[#051424] border border-[#424754] rounded px-3 py-2 text-[#d4e4fa] focus:border-[#adc6ff]"
            >
              <option value="Kyber-768 Quantum-Safe">Kyber-768 Quantum-Safe (Post-Quantum NIST Level 3)</option>
              <option value="AES-256-GCM">AES-256-GCM (Hardware AVX-512)</option>
              <option value="ChaCha20-Poly1305">ChaCha20-Poly1305 (Mobile Optimized)</option>
            </select>
          </div>

          {/* Particle Density */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[#8c909f] font-bold uppercase">3D Flow Particle Density</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((density) => (
                <button
                  key={density}
                  onClick={() => onUpdateSettings({ particleDensity: density })}
                  className={`flex-1 py-1.5 rounded border capitalize text-[11px] font-bold transition-all ${
                    settings.particleDensity === density
                      ? 'bg-[#1c2b3c] border-[#adc6ff] text-[#adc6ff]'
                      : 'bg-[#051424] border-[#424754] text-[#8c909f]'
                  }`}
                >
                  {density}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Rotation */}
          <div className="flex items-center justify-between p-3 bg-[#051424] rounded border border-[#424754]">
            <span className="text-[#d4e4fa]">Earth 3D Auto-Rotation</span>
            <input
              type="checkbox"
              checked={settings.autoRotate}
              onChange={(e) => onUpdateSettings({ autoRotate: e.target.checked })}
              className="w-4 h-4 accent-[#adc6ff] cursor-pointer"
            />
          </div>

          {/* Telemetry Refresh Rate */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <label className="text-[11px] text-[#8c909f] font-bold uppercase">Telemetry Interval</label>
              <span className="text-[#adc6ff]">{settings.refreshRateMs} ms</span>
            </div>
            <input
              type="range"
              min="200"
              max="3000"
              step="100"
              value={settings.refreshRateMs}
              onChange={(e) => onUpdateSettings({ refreshRateMs: Number(e.target.value) })}
              className="accent-[#adc6ff] cursor-pointer"
            />
          </div>
        </div>

        <div className="px-5 py-3 border-t border-[#424754] bg-[#0d1c2d] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#adc6ff] text-[#002e6a] font-mono-data font-bold text-[12px] rounded hover:bg-[#d8e2ff]"
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
