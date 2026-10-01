export type NavigationTab = 'Topology' | 'Execution' | 'Analysis' | 'Algorithms' | 'History';

export type TransmissionMode = 'send' | 'receive';
export type AnalysisMode = 'abstract' | 'datacenter';
export type TopologyPreset = 'Dense Mesh Network' | 'Abstract Sparse Graph' | 'Data Center / CDN Topology';
export type UserSource = 'all' | 'u1' | 'u2' | 'u3';

export interface DataCenterHub {
  id: string;
  name: string;
  code: string;
  lat: number;
  lon: number;
  status: 'healthy' | 'warning' | 'critical';
  load: number; // 0 - 100%
  ping: number; // ms
  country: string;
  pop: string;
  dcCount: number;
  activeTunnels: number;
  ip: string;
}

export interface NetworkPath {
  id: string;
  textId?: string;
  from: string;
  to: string;
  max: number; // Mbps
  current: number; // Mbps
  base: number;
  variance: number;
  name: string;
  isInternal?: boolean;
  isUser?: boolean;
  source?: string;
  isDropped?: boolean;
  status?: 'QUANTUM-SAFE' | 'CONGESTED' | 'SATURATED' | 'DROPPED';
}

export interface NetworkNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'source' | 'target' | 'intermediate' | 'user';
  ip?: string;
  status?: 'nominal' | 'warning' | 'critical';
}

export interface LiveMetrics {
  totalThroughput: number; // Gbps
  transferSpeedMbps: number; // Active or target sending speed Mbps
  instantSpeedMBps?: number; // Instantaneous throughput in MB/s
  utilization: number; // %
  packetLoss: number; // %
  globalLatency: number; // ms
  serverClusterLoad: number; // %
  criticalBottleneck: {
    hasBottleneck: boolean;
    value: number; // Mbps
    linkName: string;
  };
  etcSeconds: number;
  etcThroughput: number;
  isTransferring: boolean;
  transferProgress: number; // 0 - 100
  isCompleted: boolean;
  hasError: boolean;
  errorMessage?: string;
  // Process-specific computed fields
  mode: TransmissionMode;
  totalPayloadMB: number;
  transferredMB: number;
  remainingMB: number;
  totalPackets: number;
  packetsProcessed: number;
  packetsInFlight: number;
  packetRatePerSec: number;
  activePathCount: number;
  maxFlowCapGbps: number;
  checksumVerifiedMB: number;
}

export interface IngestedFile {
  id: string;
  name: string;
  sizeMB: number;
  sizeBytes?: number;
  type: 'folder' | 'picture' | 'video' | 'document' | 'archive';
  user: string;
  progress: number;
  status: 'QUEUED' | 'SYNCING' | 'COMPLETED' | 'FAILED';
  speedMbps: number;
  itemCount?: number;
  dataUrl?: string;
  contentPreview?: string;
  mimeType?: string;
  timestamp?: string;
  formattedTimestamp?: string;
  checksumHash?: string;
}

export interface AlgorithmMetric {
  name: string;
  dinics: string | number;
  edmondsKarp: string | number;
  pushRelabel: string | number;
}

export interface ToastMessage {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: number;
}

export interface SystemSettings {
  autoRotate: boolean;
  rotationSpeed: number;
  particleDensity: 'low' | 'medium' | 'high';
  encryptionStandard: 'AES-256-GCM' | 'Kyber-768 Quantum-Safe' | 'ChaCha20-Poly1305';
  renderView: '3D' | '2D';
  refreshRateMs: number;
  audioFeedback: boolean;
}

export interface NodeRouteHop {
  nodeId: string;
  nodeLabel: string;
  ip: string;
  role: 'source' | 'intermediate' | 'target' | 'user';
  dataCenter?: string;
  country?: string;
  pingMs: number;
  linkSpeedMbps?: number;
}

export interface CandidateRoute {
  id: string;
  name: string;
  hops: NodeRouteHop[];
  totalLatencyMs: number;
  bottleneckCapacityMbps: number;
  estimatedTransitTimeSec: number;
  reliabilityPercent: number;
  isFastest: boolean;
  score: number; // 0 - 100
  description: string;
  tags: string[];
}

export interface CompletedTransferRouteInfo {
  sourceNode: NodeRouteHop;
  targetNode: NodeRouteHop;
  selectedRoute: CandidateRoute;
  allCandidateRoutes: CandidateRoute[];
  fastestRoute: CandidateRoute;
  timeSavedVsAverageSec: number;
  speedEfficiencyRating: string;
  completedAt: string;
  totalTransferredMB: number;
  mode: TransmissionMode;
  userSource: string;
}

export interface TransferHistoryRecord {
  id: string;
  timestamp: string; // ISO 8601 string
  formattedDate: string; // e.g. "Aug 30, 2026, 06:15 PM"
  mode: TransmissionMode; // 'send' | 'receive'
  status: 'SUCCESS' | 'FAILED' | 'RESTORED' | 'REROUTED';
  totalSizeMB: number;
  totalPackets: number;
  durationSec: number;
  averageSpeedMbps: number;
  peakThroughputGbps: number;
  algorithm: string; // 'Dinic\'s Algorithm' | 'Edmonds-Karp' | 'Push-Relabel'
  topologyPreset: TopologyPreset;
  userSource: UserSource;
  sourceNode: {
    id: string;
    label: string;
    ip: string;
    dataCenter?: string;
  };
  targetNode: {
    id: string;
    label: string;
    ip: string;
    dataCenter?: string;
  };
  files: IngestedFile[];
  routeInfo?: CompletedTransferRouteInfo | null;
  encryptionStandard?: string;
  checksumHash?: string;
  notes?: string;
  isFavorite?: boolean;
  restoredCount?: number;
  clientIp?: string;
  autoSaved?: boolean;
}

export interface HistoryFilterOptions {
  searchQuery: string;
  direction: 'all' | 'send' | 'receive' | 'restored';
  status: 'all' | 'SUCCESS' | 'FAILED' | 'REROUTED' | 'RESTORED';
  fileType: 'all' | 'folder' | 'picture' | 'video' | 'document' | 'archive';
  userSource: 'all' | 'u1' | 'u2' | 'u3';
  sortBy: 'newest' | 'oldest' | 'largest' | 'fastest';
  onlyFavorites: boolean;
}
