import React, { useState } from 'react';
import { NetworkNode, NetworkPath, TransmissionMode, UserSource } from '../types';

interface Topology2DViewProps {
  nodes: NetworkNode[];
  paths: NetworkPath[];
  activeUserSource: UserSource;
  transmissionMode: TransmissionMode;
  onSelectNode: (node: NetworkNode) => void;
  selectedNode: NetworkNode | null;
  bestPathId?: string;
  isSimulating: boolean;
}

export const Topology2DView: React.FC<Topology2DViewProps> = ({
  nodes,
  paths,
  activeUserSource,
  transmissionMode,
  onSelectNode,
  selectedNode,
  bestPathId,
  isSimulating,
}) => {
  const [hoveredPath, setHoveredPath] = useState<NetworkPath | null>(null);

  const getNodeById = (id: string) => nodes.find((n) => n.id === id);

  const getPathStatusColor = (path: NetworkPath) => {
    if (path.isDropped) return '#8c909f';
    const ratio = path.current / path.max;
    if (ratio >= 0.95) return '#ffb4ab'; // Saturated (Red)
    if (ratio >= 0.7) return '#df7412'; // Congested (Orange)
    return '#4edea3'; // Healthy (Green)
  };

  const getPathStatusLabel = (path: NetworkPath) => {
    if (path.isDropped) return 'DROPPED';
    const ratio = path.current / path.max;
    if (ratio >= 0.95) return 'SATURATED';
    if (ratio >= 0.7) return 'CONGESTED';
    return 'QUANTUM-SAFE';
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden dot-grid select-none">
      <svg
        viewBox="0 0 920 460"
        className="w-full h-full max-w-[1100px] max-h-[550px] drop-shadow-2xl"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Glowing filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#adc6ff" floodOpacity="0.7" />
          </filter>
          {/* Gradients */}
          <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4d8eff" />
            <stop offset="100%" stopColor="#005ac2" />
          </linearGradient>
          <linearGradient id="userGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#adc6ff" />
            <stop offset="100%" stopColor="#122131" />
          </linearGradient>
        </defs>

        {/* 1. Network Edges / Links */}
        {paths.map((path) => {
          const fromNode = getNodeById(path.from);
          const toNode = getNodeById(path.to);
          if (!fromNode || !toNode) return null;

          const isBest = bestPathId === path.id;
          const statusColor = getPathStatusColor(path);
          const ratio = path.current / path.max;
          const strokeWidth = isBest ? 5 : ratio >= 0.95 ? 3 : 2;

          const isUserPath = path.isUser;
          const isDimmed =
            isUserPath && activeUserSource !== 'all' && path.source !== activeUserSource;

          // Compute midpoint for text label
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;

          return (
            <g
              key={path.id}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredPath(path)}
              onMouseLeave={() => setHoveredPath(null)}
            >
              {/* Main Line */}
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={statusColor}
                strokeWidth={strokeWidth}
                strokeDasharray={path.isDropped ? '6,6' : isBest ? '6,6' : undefined}
                className={isBest ? 'marching-ants' : path.status === 'SATURATED' ? 'pulse-error' : ''}
                opacity={isDimmed ? 0.5 : path.isDropped ? 0.4 : 0.85}
              />

              {/* Animated Packets along path if simulating */}
              {isSimulating && !path.isDropped && !isDimmed && (
                <circle
                  r="3.5"
                  fill={isUserPath ? '#adc6ff' : '#ffffff'}
                  filter="url(#glow)"
                  opacity="0.9"
                >
                  <animateMotion
                    path={`M ${transmissionMode === 'receive' ? toNode.x : fromNode.x} ${
                      transmissionMode === 'receive' ? toNode.y : fromNode.y
                    } L ${transmissionMode === 'receive' ? fromNode.x : toNode.x} ${
                      transmissionMode === 'receive' ? fromNode.y : toNode.y
                    }`}
                    dur={`${2.0 + Math.random() * 1.0}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Label for major links */}
              {path.textId && !path.isDropped && (
                <g transform={`translate(${midX}, ${midY - 8})`}>
                  <rect
                    x="-55"
                    y="-9"
                    width="110"
                    height="16"
                    rx="3"
                    fill="#051424"
                    fillOpacity="0.85"
                    stroke={statusColor}
                    strokeWidth="0.8"
                  />
                  <text
                    textAnchor="middle"
                    y="3"
                    fill={statusColor}
                    className="font-mono-data text-[9px] font-bold"
                  >
                    🔒 {Math.round(path.current)}/{path.max} M
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* 2. Network Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const isUserNode = node.type === 'user';
          const isDimmed =
            isUserNode &&
            activeUserSource !== 'all' &&
            node.id !== `node-${activeUserSource}`;

          let fillColor = '#122131';
          let strokeColor = '#424754';
          let radius = 18;

          if (node.type === 'source') {
            fillColor = '#002e6a';
            strokeColor = '#adc6ff';
            radius = 22;
          } else if (node.type === 'target') {
            fillColor = '#003824';
            strokeColor = '#4edea3';
            radius = 22;
          } else if (isUserNode) {
            fillColor = '#1c2b3c';
            strokeColor = isDimmed ? '#424754' : '#adc6ff';
            radius = 16;
          }

          if (isSelected) {
            strokeColor = '#4edea3';
          }

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              className="cursor-pointer transition-transform duration-200 hover:scale-110"
              onClick={() => onSelectNode(node)}
              opacity={isDimmed ? 0.5 : 1}
            >
              {/* Outer Glow on Selected */}
              {isSelected && (
                <circle r={radius + 6} fill="none" stroke="#4edea3" strokeWidth="2" strokeDasharray="3,3" className="marching-ants" />
              )}

              {/* Node Body */}
              <circle
                r={radius}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={isSelected ? '2.5' : '1.5'}
                filter={isSelected ? 'url(#nodeGlow)' : undefined}
                className={isSimulating ? 'highlight-node' : ''}
              />

              {/* Node Icon / Label */}
              <text
                textAnchor="middle"
                dy="4"
                fill="#d4e4fa"
                className="font-mono-data text-[11px] font-bold pointer-events-none"
              >
                {node.label}
              </text>

              {/* IP / Info Tag below node */}
              <text
                textAnchor="middle"
                y={radius + 14}
                fill="#8c909f"
                className="font-mono-data text-[9px] pointer-events-none"
              >
                {node.ip}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover Info Tooltip */}
      {hoveredPath && (
        <div className="absolute top-4 left-4 bg-[#122131]/90 backdrop-blur border border-[#424754] rounded p-2 text-[11px] font-mono-data shadow-lg">
          <div className="text-[#adc6ff] font-bold">Link: {hoveredPath.name}</div>
          <div className="text-[#c2c6d6]">
            Throughput: <span className="text-[#4edea3]">{Math.round(hoveredPath.current)} Mbps</span> / {hoveredPath.max} Mbps
          </div>
          <div className="text-[#c2c6d6]">
            Status: <span className="text-[#ffb786]">{getPathStatusLabel(hoveredPath)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
