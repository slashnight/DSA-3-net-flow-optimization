import React from 'react';
import { NavigationTab } from '../types';
import { Settings, Bell, User, ShieldCheck, Cpu, History } from 'lucide-react';

interface NavbarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenDeployModal: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  unreadAlertsCount: number;
  historyRecordsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenDeployModal,
  onOpenSettings,
  onOpenNotifications,
  unreadAlertsCount,
  historyRecordsCount = 0,
}) => {
  const tabs: NavigationTab[] = ['Topology', 'Execution', 'Analysis', 'Algorithms', 'History'];

  return (
    <nav className="bg-[#051424] text-[#adc6ff] flex justify-between items-center w-full px-4 h-[48px] border-b border-[#424754] flex-shrink-0 z-40 relative select-none">
      {/* Left Title & Nav Tabs */}
      <div className="flex items-center gap-6 h-full">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-pulse"></div>
          <span className="font-bold text-[15px] sm:text-[17px] text-[#adc6ff] tracking-tight font-inter whitespace-nowrap">
            Live Network Traffic - Secure Transmission Control
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden md:flex h-full items-end gap-5 ml-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onSelectTab(tab)}
                className={`font-mono-data text-[11px] uppercase tracking-wider font-bold transition-all duration-150 h-full flex items-center px-2 relative ${
                  isActive
                    ? 'text-[#adc6ff] border-b-2 border-[#adc6ff]'
                    : 'text-[#8c909f] hover:text-[#d4e4fa] hover:bg-[#122131]/40'
                }`}
              >
                {tab === 'History' && <History className="w-3.5 h-3.5 mr-1 text-[#4edea3]" />}
                {tab}
                {tab === 'History' && historyRecordsCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] bg-[#003824] text-[#4edea3] border border-[#4edea3]/40">
                    {historyRecordsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Dedicated History Space Button */}
        <button
          onClick={() => onSelectTab('History')}
          title="Open Transfer & Receive History Space"
          className={`flex items-center gap-1.5 px-3 py-1.5 font-mono-data text-[11px] font-bold rounded-lg transition-all duration-150 active:scale-95 shadow-sm whitespace-nowrap border cursor-pointer ${
            activeTab === 'History'
              ? 'bg-[#003824] text-[#4edea3] border-[#4edea3] shadow-[0_0_12px_rgba(78,222,163,0.3)]'
              : 'bg-[#122131] hover:bg-[#1c2b3c] text-[#4edea3] border-[#4edea3]/40'
          }`}
        >
          <History className="w-3.5 h-3.5 text-[#4edea3]" />
          <span>History Space</span>
          {historyRecordsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-[#003824] text-[#4edea3] rounded text-[9px] border border-[#4edea3]/40 font-mono-data">
              {historyRecordsCount}
            </span>
          )}
        </button>

        {/* Quantum Safe Status indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#122131] border border-[#424754] rounded text-[10px] font-mono-data text-[#4edea3]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#4edea3]" />
          <span>KYBER-768 SECURE</span>
        </div>

        {/* Deploy Config Button */}
        <button
          onClick={onOpenDeployModal}
          className="bg-[#adc6ff] text-[#002e6a] font-mono-data text-[11px] font-bold px-3.5 py-1.5 rounded hover:bg-[#d8e2ff] transition-all duration-150 active:scale-95 shadow-sm whitespace-nowrap"
        >
          Deploy Config
        </button>

        {/* Action Icons */}
        <div className="flex items-center gap-1 text-[#8c909f]">
          <button
            onClick={onOpenSettings}
            title="System Settings"
            className="p-1.5 rounded hover:bg-[#1c2b3c] hover:text-[#adc6ff] transition-all active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenNotifications}
            title="Notifications & Alerts"
            className="p-1.5 rounded hover:bg-[#1c2b3c] hover:text-[#adc6ff] transition-all active:scale-95 relative"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#ffb4ab] animate-ping" />
            )}
            {unreadAlertsCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#ffb4ab]" />
            )}
          </button>

          <button
            title="Account Profile"
            className="p-1.5 rounded hover:bg-[#1c2b3c] hover:text-[#adc6ff] transition-all active:scale-95"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

