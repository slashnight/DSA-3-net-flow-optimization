import React, { useState } from 'react';
import { NetworkNode, NetworkPath, TransmissionMode } from '../../types';
import { Topology2DView } from '../Topology2DView';
import { Shield, Plus, Trash2, Zap, AlertTriangle, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

interface TopologyScreenProps {
  nodes: NetworkNode[];
  paths: NetworkPath[];
  onTogglePathDrop: (pathId: string) => void;
  onAddCustomNode: (label: string, type: NetworkNode['type']) => void;
  transmissionMode: TransmissionMode;
  onSelectNode: (node: NetworkNode) => void;
  selectedNode: NetworkNode | null;
}

export const TopologyScreen: React.FC<TopologyScreenProps> = ({
  nodes,
  paths,
  onTogglePathDrop,
  onAddCustomNode,
  transmissionMode,
  onSelectNode,
  selectedNode,
}) => {
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState<NetworkNode['type']>('intermediate');

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeLabel.trim()) return;
    onAddCustomNode(newNodeLabel.trim(), newNodeType);
    setNewNodeLabel('');
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-[#051424]">
      {/* Visualizer area */}
      <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-[#424754] relative">
        <div className="p-4 bg-[#122131] border-b border-[#424754] flex justify-between items-center">
          <div>
            <h2 className="text-[16px] font-bold text-[#adc6ff] font-inter">Interactive Topology Matrix</h2>
            <p className="text-[12px] text-[#8c909f]">Inspect node hierarchy and toggle link states</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-[#051424] border border-[#424754] rounded text-[11px] font-mono-data text-[#4edea3]">
              Active Nodes: {nodes.length}
            </span>
            <span className="px-2.5 py-1 bg-[#051424] border border-[#424754] rounded text-[11px] font-mono-data text-[#adc6ff]">
              Active Links: {paths.filter(p => !p.isDropped).length}
            </span>
          </div>
        </div>

        <div className="flex-1 relative">
          <Topology2DView
            nodes={nodes}
            paths={paths}
            activeUserSource="all"
            transmissionMode={transmissionMode}
            onSelectNode={onSelectNode}
            selectedNode={selectedNode}
            isSimulating={true}
          />
        </div>
      </div>

      {/* Side Link Management Table & Inspector */}
      <div className="w-full lg:w-[420px] bg-[#122131] flex flex-col h-full overflow-y-auto">
        <div className="p-4 border-b border-[#424754]">
          <h3 className="text-[15px] font-bold text-[#d4e4fa] font-inter mb-1">Link Capacities & Outage Simulation</h3>
          <p className="text-[11px] text-[#8c909f]">Click any link to simulate hardware failure or failover</p>
        </div>

        {/* Quick Add Node Form */}
        <form onSubmit={handleAddNode} className="p-4 border-b border-[#424754] bg-[#0d1c2d] flex flex-col gap-2">
          <span className="text-[11px] font-mono-data font-bold text-[#adc6ff] uppercase">Inject Custom Edge Relay</span>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Edge Node H"
              value={newNodeLabel}
              onChange={(e) => setNewNodeLabel(e.target.value)}
              className="flex-1 bg-[#051424] border border-[#424754] rounded px-3 py-1.5 text-[12px] font-mono-data text-[#d4e4fa] focus:border-[#adc6ff] focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#adc6ff] text-[#002e6a] rounded font-mono-data text-[11px] font-bold hover:bg-[#d8e2ff] transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </form>

        {/* Link List */}
        <div className="p-3 flex flex-col gap-2 flex-1 overflow-y-auto">
          {paths.filter(p => !p.isUser).map((path) => {
            const isDropped = path.isDropped;
            const ratio = path.current / path.max;
            return (
              <div
                key={path.id}
                onClick={() => onTogglePathDrop(path.id)}
                className={`p-3 rounded border transition-all cursor-pointer flex items-center justify-between font-mono-data ${
                  isDropped
                    ? 'bg-[#1c2b3c]/40 border-[#ffb4ab]/40 opacity-60'
                    : ratio > 0.9
                    ? 'bg-[#051424] border-[#ffb4ab]'
                    : 'bg-[#051424] border-[#424754] hover:border-[#adc6ff]'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#adc6ff] text-[13px]">{path.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        isDropped
                          ? 'bg-[#690005] text-[#ffb4ab]'
                          : ratio > 0.9
                          ? 'bg-[#93000a] text-[#ffb4ab]'
                          : 'bg-[#003824] text-[#4edea3]'
                      }`}
                    >
                      {isDropped ? 'OFFLINE' : ratio > 0.9 ? 'SATURATED' : 'ACTIVE'}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8c909f] flex items-center gap-2">
                    <span>Flow: {Math.round(path.current)} / {path.max} Mbps</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-[#4edea3]">
                      <Lock className="w-2.5 h-2.5" /> Quantum-Safe
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePathDrop(path.id);
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    isDropped
                      ? 'bg-[#4edea3]/20 text-[#4edea3] hover:bg-[#4edea3]/30'
                      : 'bg-[#ffb4ab]/10 text-[#ffb4ab] hover:bg-[#ffb4ab]/20'
                  }`}
                >
                  {isDropped ? 'Restore Link' : 'Drop Link'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
