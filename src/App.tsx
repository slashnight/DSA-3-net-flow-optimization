import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  NavigationTab,
  TransmissionMode,
  AnalysisMode,
  TopologyPreset,
  UserSource,
  DataCenterHub,
  NetworkNode,
  NetworkPath,
  LiveMetrics,
  IngestedFile,
  AlgorithmMetric,
  ToastMessage,
  SystemSettings,
  CompletedTransferRouteInfo,
  TransferHistoryRecord,
} from './types';
import {
  INITIAL_HUBS,
  INITIAL_2D_NODES,
  INITIAL_PATHS,
  INITIAL_FILES,
} from './mockData';
import { calculateCompletedRoutes } from './utils/routeCalculator';
import {
  loadTransferHistory,
  saveTransferHistory,
  createAndSaveHistoryRecord,
  SEED_HISTORY_RECORDS,
} from './utils/historyStorage';
import { Navbar } from './components/Navbar';
import { LeftPanel } from './components/LeftPanel';
import { CenterView } from './components/CenterView';
import { RightPanel } from './components/RightPanel';
import { Footer } from './components/Footer';
import { TopologyScreen } from './components/views/TopologyScreen';
import { AnalysisScreen } from './components/views/AnalysisScreen';
import { AlgorithmsScreen } from './components/views/AlgorithmsScreen';
import { HistorySpaceScreen } from './components/views/HistorySpaceScreen';
import { DeployConfigModal } from './components/modals/DeployConfigModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { TransmissionDetailsModal } from './components/modals/TransmissionDetailsModal';
import { NotificationsDrawer } from './components/modals/NotificationsDrawer';
import { InfoModals } from './components/modals/InfoModals';
import { TransferErrorModal } from './components/modals/TransferErrorModal';
import { RouteAnalysisModal } from './components/modals/RouteAnalysisModal';
import { FilePreviewModal } from './components/modals/FilePreviewModal';
import { ToastContainer } from './components/ToastContainer';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavigationTab>('Execution');

  // Sidebars state and custom resizable dimensions
  const [isLeftCollapsed, setIsLeftCollapsed] = useState<boolean>(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState<boolean>(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(320);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(360);
  const [isDraggingLeft, setIsDraggingLeft] = useState<boolean>(false);
  const [isDraggingRight, setIsDraggingRight] = useState<boolean>(false);

  // Global mouse & touch event handlers for smooth panel resizing
  useEffect(() => {
    const handleMove = (clientX: number) => {
      if (isDraggingLeft) {
        const newWidth = Math.min(560, Math.max(240, clientX));
        setLeftPanelWidth(newWidth);
      }
      if (isDraggingRight) {
        const newWidth = Math.min(600, Math.max(260, window.innerWidth - clientX));
        setRightPanelWidth(newWidth);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleEnd = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
    };

    if (isDraggingLeft || isDraggingRight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDraggingLeft, isDraggingRight]);

  // Modes & Presets
  const [transmissionMode, setTransmissionMode] = useState<TransmissionMode>('send');
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('datacenter');
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [topologyPreset, setTopologyPreset] = useState<TopologyPreset>('Dense Mesh Network');
  const [activeUserSource, setActiveUserSource] = useState<UserSource>('all');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // Data
  const [hubs, setHubs] = useState<DataCenterHub[]>(INITIAL_HUBS);
  const [nodes, setNodes] = useState<NetworkNode[]>(INITIAL_2D_NODES);
  const [paths, setPaths] = useState<NetworkPath[]>(INITIAL_PATHS);
  const [selectedHub, setSelectedHub] = useState<DataCenterHub | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  // Default to empty array so ingest queue and size starts at 0 until files/pictures/folders are added
  const [ingestedFiles, setIngestedFiles] = useState<IngestedFile[]>([]);

  // Modals & Drawers
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
  const [isRouteAnalysisModalOpen, setIsRouteAnalysisModalOpen] = useState<boolean>(false);
  const [completedRouteInfo, setCompletedRouteInfo] = useState<CompletedTransferRouteInfo | null>(null);
  const [historyRecords, setHistoryRecords] = useState<TransferHistoryRecord[]>(() => loadTransferHistory());
  const [infoModalType, setInfoModalType] = useState<'doc' | 'api' | 'status' | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [previewFile, setPreviewFile] = useState<IngestedFile | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  const handleOpenPreviewFile = (file: IngestedFile) => {
    setPreviewFile(file);
    setIsPreviewModalOpen(true);
  };

  const addHistoryEntry = useCallback((record: TransferHistoryRecord) => {
    setHistoryRecords((prev) => {
      const updated = [record, ...(Array.isArray(prev) ? prev : [])];
      saveTransferHistory(updated);
      return updated;
    });
  }, []);

  const autoOpenReceivedFiles = useCallback((files: IngestedFile[]) => {
    if (files.length === 0) return;
    const firstReceivedFile = files[0];
    setPreviewFile(firstReceivedFile);
    setIsPreviewModalOpen(true);
  }, []);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [bestPathId, setBestPathId] = useState<string>('path-ac');

  // Computed total payload properties
  const totalPayloadMB = useMemo(
    () => ingestedFiles.reduce((acc, f) => acc + f.sizeMB, 0),
    [ingestedFiles]
  );
  const totalPayloadBytes = useMemo(
    () => totalPayloadMB * 1024 * 1024,
    [totalPayloadMB]
  );
  const totalPackets = useMemo(
    () => (totalPayloadBytes > 0 ? Math.ceil(totalPayloadBytes / 1500) : 0),
    [totalPayloadBytes]
  );
  const transferredMB = useMemo(
    () => (progressPercent / 100) * totalPayloadMB,
    [progressPercent, totalPayloadMB]
  );
  const remainingMB = useMemo(
    () => Math.max(0, totalPayloadMB - transferredMB),
    [totalPayloadMB, transferredMB]
  );
  const packetsProcessed = useMemo(
    () => Math.min(totalPackets, Math.floor((progressPercent / 100) * totalPackets)),
    [progressPercent, totalPackets]
  );

  // Metrics
  const [metrics, setMetrics] = useState<LiveMetrics>({
    totalThroughput: 0.0,
    transferSpeedMbps: 0,
    utilization: 0.0,
    packetLoss: 0.0,
    globalLatency: 11,
    serverClusterLoad: 14.5,
    criticalBottleneck: {
      hasBottleneck: false,
      value: 0,
      linkName: 'NONE',
    },
    etcSeconds: 0.0,
    etcThroughput: 0.0,
    isTransferring: false,
    transferProgress: 0,
    isCompleted: false,
    hasError: false,
    mode: 'send',
    totalPayloadMB: 0,
    transferredMB: 0,
    remainingMB: 0,
    totalPackets: 0,
    packetsProcessed: 0,
    packetsInFlight: 0,
    packetRatePerSec: 0,
    activePathCount: 4,
    maxFlowCapGbps: 10.0,
    checksumVerifiedMB: 0,
  });

  const [settings, setSettings] = useState<SystemSettings>({
    autoRotate: true,
    rotationSpeed: 1,
    particleDensity: 'high',
    encryptionStandard: 'Kyber-768 Quantum-Safe',
    renderView: '3D',
    refreshRateMs: 220,
    audioFeedback: true,
  });

  // Dynamic Algorithm Profiler Metrics calculated from active graph and payload size
  const algorithmMetrics: AlgorithmMetric[] = [
    {
      name: 'Exec Time',
      dinics: totalPayloadMB === 0 ? '0.0ms' : `${(0.9 + totalPayloadMB / 280 + (isSimulating ? 1.4 : 0)).toFixed(1)}ms`,
      edmondsKarp: totalPayloadMB === 0 ? '0.0ms' : `${(3.2 + totalPayloadMB / 85 + (isSimulating ? 4.1 : 0)).toFixed(1)}ms`,
      pushRelabel: totalPayloadMB === 0 ? '0.0ms' : `${(1.5 + totalPayloadMB / 160).toFixed(1)}ms`,
    },
    {
      name: 'BFS / Aug Phases',
      dinics: totalPayloadMB === 0 ? 0 : isSimulating ? 4 : 2,
      edmondsKarp: totalPayloadMB === 0 ? 0 : isSimulating ? 16 : 8,
      pushRelabel: totalPayloadMB === 0 ? 0 : isSimulating ? 7 : 3,
    },
    {
      name: 'Residual Buffer',
      dinics: totalPayloadMB === 0 ? '0.00MB' : `${(0.42 + totalPayloadMB / 1800).toFixed(2)}MB`,
      edmondsKarp: totalPayloadMB === 0 ? '0.00MB' : `${(0.58 + totalPayloadMB / 1400).toFixed(2)}MB`,
      pushRelabel: totalPayloadMB === 0 ? '0.00MB' : `${(0.65 + totalPayloadMB / 1200).toFixed(2)}MB`,
    },
  ];

  // Dynamic Telemetry & Health Report Text based on sending/receiving process
  const healthReportText =
    metrics.criticalBottleneck.hasBottleneck
      ? `Link ${metrics.criticalBottleneck.linkName} reached near saturation (${Math.round(
        metrics.criticalBottleneck.value
      )} Mbps). Automated MPTCP rerouting sub-flows to alternate regional trunks.`
      : totalPayloadMB === 0
        ? `System Idle. Target ingest queue contains 0 files (0 MB). Waiting for payload insertion to initialize ${transmissionMode === 'send' ? 'Tx Uplink' : 'Rx Downlink'
        } multi-path optimization.`
        : isSimulating
          ? `${transmissionMode === 'send' ? '[Tx SENDING PROCESS]' : '[Rx RECEIVING PROCESS]'} Active transmission: ${transferredMB.toFixed(
            1
          )} MB of ${totalPayloadMB.toFixed(1)} MB (${progressPercent.toFixed(1)}%). Transmitting via ${metrics.activePathCount
          } disjoint paths with Dinic's blocking flow max-flow optimization.`
          : metrics.isCompleted
            ? `[TRANSFER COMPLETED] Successfully ${transmissionMode === 'send' ? 'transmitted' : 'received'
            } all ${totalPayloadMB.toFixed(1)} MB (${totalPackets.toLocaleString()} pkts) with 0.00% unrecoverable packet loss.`
            : `Ingest queue armed with ${ingestedFiles.length} item(s) (${totalPayloadMB.toFixed(1)} MB). Ready to initiate ${transmissionMode === 'send' ? 'Send Process (Tx)' : 'Receive Process (Rx)'
            }.`;

  const addToast = useCallback((title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      timestamp: Date.now(),
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync Analysis Mode with 3D/2D View Mode
  const handleToggleAnalysisMode = (mode: AnalysisMode) => {
    setAnalysisMode(mode);
    setViewMode(mode === 'datacenter' ? '3D' : '2D');
  };

  const handleToggleViewMode = () => {
    const nextMode = viewMode === '3D' ? '2D' : '3D';
    setViewMode(nextMode);
    setAnalysisMode(nextMode === '3D' ? 'datacenter' : 'abstract');
  };

  // Handle Ingest File Additions with precise sizes, timestamps, and content previews
  const handleAddFiles = (files: FileList | File[]) => {
    const now = new Date();
    const isoTimestamp = now.toISOString();
    const formattedTimestamp = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newFiles: IngestedFile[] = Array.from(files).map((f, i) => {
      // Determine file category
      let category: IngestedFile['type'] = 'document';
      const lowerName = f.name.toLowerCase();

      if (
        f.type.startsWith('image/') ||
        lowerName.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|heic|tiff|raw)$/)
      ) {
        category = 'picture';
      } else if (
        f.type.startsWith('video/') ||
        lowerName.match(/\.(mp4|mov|avi|mkv|webm|flv|wmv)$/)
      ) {
        category = 'video';
      } else if (
        lowerName.endsWith('.zip') ||
        lowerName.endsWith('.tar') ||
        lowerName.endsWith('.tar.gz') ||
        lowerName.endsWith('.gz') ||
        lowerName.endsWith('.rar') ||
        lowerName.endsWith('.7z')
      ) {
        category = 'archive';
      } else if (f.name.includes('/') || (f as any).webkitRelativePath) {
        category = 'folder';
      }

      // Calculate accurate size in MB
      let computedSizeMB = 0;
      if (f.size && f.size > 0) {
        computedSizeMB = Math.round((f.size / (1024 * 1024)) * 100) / 100;
        if (computedSizeMB === 0) {
          computedSizeMB = Math.round((f.size / 1024) * 10) / 10000; // Small file KB represented in MB
          if (computedSizeMB === 0) computedSizeMB = 0.01;
        }
      } else {
        // Fallback for directory/mock descriptors
        computedSizeMB = category === 'picture' ? 4.5 : category === 'video' ? 120.0 : category === 'folder' ? 450.0 : 18.2;
      }

      const fileId = `ingest-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;
      const checksumHash = `SHA3-512:${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}...verified`;

      const ingestedItem: IngestedFile = {
        id: fileId,
        name: f.name,
        sizeMB: computedSizeMB,
        sizeBytes: f.size || Math.round(computedSizeMB * 1024 * 1024),
        type: category,
        user: activeUserSource === 'all' ? 'User U1' : `User ${activeUserSource.toUpperCase()}`,
        progress: 0,
        status: 'QUEUED',
        speedMbps: 450,
        mimeType: f.type || (category === 'picture' ? 'image/png' : 'text/plain'),
        timestamp: isoTimestamp,
        formattedTimestamp,
        checksumHash,
      };

      // If it is a browser File instance, read content asynchronously for instant preview/open
      if (f instanceof File) {
        if (f.type.startsWith('image/') || f.type.startsWith('video/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              setIngestedFiles((prev) =>
                prev.map((item) =>
                  item.id === fileId ? { ...item, dataUrl: e.target!.result as string } : item
                )
              );
            }
          };
          reader.readAsDataURL(f);
        } else if (f.size < 2 * 1024 * 1024) { // Read text under 2MB
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              setIngestedFiles((prev) =>
                prev.map((item) =>
                  item.id === fileId ? { ...item, contentPreview: e.target!.result as string } : item
                )
              );
            }
          };
          reader.readAsText(f);
        }
      }

      return ingestedItem;
    });

    setIngestedFiles((prev) => [...newFiles, ...prev]);
    setProgressPercent(0);
    const addedMB = newFiles.reduce((acc, f) => acc + f.sizeMB, 0);
    addToast(
      'Payload Ingested',
      `Calculated size: ${addedMB.toFixed(2)} MB across ${newFiles.length} item(s). Ready for transmission.`,
      'success'
    );
  };

  // Clear Ingest Queue (Reset to 0)
  const handleClearFiles = () => {
    setIsSimulating(false);
    setIngestedFiles([]);
    setProgressPercent(0);
    setMetrics((prev) => ({
      ...prev,
      totalThroughput: 0.0,
      utilization: 0.0,
      packetLoss: 0.0,
      isTransferring: false,
      isCompleted: false,
      transferProgress: 0,
      etcSeconds: 0.0,
      totalPayloadMB: 0,
      transferredMB: 0,
      remainingMB: 0,
      totalPackets: 0,
      packetsProcessed: 0,
      packetsInFlight: 0,
      packetRatePerSec: 0,
    }));
    addToast('Ingest Queue Cleared', 'Target ingest queue reset to 0 items (0.00 MB).', 'info');
  };

  // Load Sample Test Payload
  const handleLoadSampleFiles = () => {
    setIngestedFiles(INITIAL_FILES);
    setProgressPercent(0);
    const totalSampleMB = INITIAL_FILES.reduce((acc, f) => acc + f.sizeMB, 0);
    addToast(
      'Sample Payload Loaded',
      `Loaded 4 test assets (${totalSampleMB.toFixed(1)} MB total).`,
      'success'
    );
  };

  // Toggle Path Outage in Topology
  const handleTogglePathDrop = (pathId: string) => {
    setPaths((prev) =>
      prev.map((p) => {
        if (p.id === pathId) {
          const isNowDropped = !p.isDropped;
          if (isNowDropped) {
            addToast('Link Outage Simulated', `Path ${p.name} was taken offline. Rerouting active flows...`, 'error');
          } else {
            addToast('Link Restored', `Path ${p.name} is back online with full capacity.`, 'success');
          }
          return { ...p, isDropped: isNowDropped, current: isNowDropped ? 0 : p.base };
        }
        return p;
      })
    );
  };

  const handleAddCustomNode = (label: string, type: NetworkNode['type']) => {
    const id = `custom-node-${Date.now()}`;
    const newNode: NetworkNode = {
      id,
      label,
      x: 480 + Math.random() * 80 - 40,
      y: 240 + Math.random() * 80 - 40,
      type,
      ip: `10.200.${Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 250)}`,
    };
    setNodes((prev) => [...prev, newNode]);

    // Connect to source and target
    const newPath1: NetworkPath = {
      id: `path-${id}-s`,
      from: 'node-s',
      to: id,
      max: 600,
      current: 250,
      base: 250,
      variance: 80,
      name: `S-${label}`,
      status: 'QUANTUM-SAFE',
    };
    const newPath2: NetworkPath = {
      id: `path-${id}-t`,
      from: id,
      to: 'node-t',
      max: 600,
      current: 250,
      base: 250,
      variance: 80,
      name: `${label}-T`,
      status: 'QUANTUM-SAFE',
    };
    setPaths((prev) => [...prev, newPath1, newPath2]);
    addToast('Node Provisioned', `Injected edge relay ${label} into live topology mesh.`, 'success');
  };

  // Real-time Dynamic Metrics Calculations strictly derived from Ingest Queue and Sending/Receiving status
  useEffect(() => {
    let animationFrameId = 0;
    let lastUpdate = 0;

    const tick = (timestamp: number) => {
      if (timestamp - lastUpdate >= settings.refreshRateMs) {
        lastUpdate = timestamp;

        let totalCurrent = 0;
        let totalMax = 0;
        let maxBottleneckVal = 0;
        let bottleneckName = 'NONE';
        let lowestCongestionRatio = 1.0;
        let calculatedBestPath = '';

        setPaths((prevPaths) =>
          prevPaths.map((path) => {
            if (path.isDropped) return path;

            const userModulator = activeUserSource === 'all' ? 1 : 0.65;
            const fluctuation = (Math.random() - 0.5) * path.variance;
            const newCurrent = Math.min(
              path.max,
              Math.max(20, (path.base * userModulator) + fluctuation)
            );

            if (!path.isUser) {
              totalCurrent += newCurrent;
              totalMax += path.max;
            }

            const ratio = newCurrent / path.max;
            let status: NetworkPath['status'] = 'QUANTUM-SAFE';

            if (ratio >= 0.94) {
              status = 'SATURATED';
              if (newCurrent > maxBottleneckVal) {
                maxBottleneckVal = newCurrent;
                bottleneckName = path.name;
              }
            } else if (ratio >= 0.7) {
              status = 'CONGESTED';
            }

            if (ratio < lowestCongestionRatio && !path.isInternal && !path.isUser) {
              lowestCongestionRatio = ratio;
              calculatedBestPath = path.id;
            }

            return {
              ...path,
              current: newCurrent,
              status,
            };
          })
        );

        if (calculatedBestPath) {
          setBestPathId(calculatedBestPath);
        }

        setHubs((prevHubs) =>
          prevHubs.map((h) => ({
            ...h,
            load: totalPayloadMB === 0
              ? Math.max(10, Math.min(25, h.load))
              : isSimulating
                ? Math.min(99, Math.max(35, Math.round((h.load + (Math.random() * 4 - 2)) * 10) / 10))
                : Math.min(60, Math.max(20, h.load)),
            ping: Math.max(8, Math.round(h.ping + (Math.random() * 2 - 1))),
          }))
        );

        const isSending = transmissionMode === 'send';
        let activeThroughputGbps = 0.0;
        let calculatedUtil = 0.0;
        let activePacketLoss = 0.0;
        let calculatedLatency = 11;
        let clusterLoad = 14.0;
        let packetRate = 0;
        let inFlight = 0;
        let remainingTimeSec = 0.0;

        if (totalPayloadMB === 0) {
          activeThroughputGbps = 0.0;
          calculatedUtil = 0.0;
          activePacketLoss = 0.0;
          calculatedLatency = 10;
          clusterLoad = 12.0;
          packetRate = 0;
          inFlight = 0;
          remainingTimeSec = 0.0;
        } else if (isSimulating) {
          if (isSending) {
            activeThroughputGbps = totalMax > 0 ? (totalCurrent / 1000) * 1.15 : 7.8;
          } else {
            activeThroughputGbps = totalMax > 0 ? (totalCurrent / 1000) * 1.25 : 8.6;
          }

          const activeThroughputMbps = activeThroughputGbps * 1000;
          calculatedUtil = totalMax > 0 ? Math.min(98, (totalCurrent / totalMax) * 100) : 64.0;
          activePacketLoss = Math.max(0.01, 0.04 + (Math.random() * 0.03 - 0.015));
          calculatedLatency = isSending ? Math.max(10, 12 + (Math.random() * 3 - 1)) : Math.max(12, 15 + (Math.random() * 4 - 2));
          clusterLoad = Math.min(96, 25 + calculatedUtil * 0.7 + (Math.random() * 3 - 1.5));
          packetRate = Math.round((activeThroughputMbps * 1000000) / (8 * 1500));
          inFlight = Math.min(totalPackets - packetsProcessed, Math.round(packetRate * 0.08));

          const curRemainingMB = Math.max(0, totalPayloadMB - ((progressPercent / 100) * totalPayloadMB));
          if (activeThroughputMbps > 0 && curRemainingMB > 0) {
            remainingTimeSec = Math.max(0.1, (curRemainingMB * 8) / activeThroughputMbps);
          } else {
            remainingTimeSec = 0.0;
          }
        } else {
          activeThroughputGbps = 0.0;
          calculatedUtil = 4.2;
          activePacketLoss = 0.0;
          calculatedLatency = 11;
          clusterLoad = 18.0;
          packetRate = 0;
          inFlight = 0;
          remainingTimeSec = 0.0;
        }

        setMetrics((prev) => ({
          ...prev,
          mode: transmissionMode,
          totalThroughput: activeThroughputGbps,
          transferSpeedMbps: Math.round(activeThroughputGbps * 1000),
          utilization: calculatedUtil,
          packetLoss: activePacketLoss,
          globalLatency: calculatedLatency,
          serverClusterLoad: clusterLoad,
          criticalBottleneck: {
            hasBottleneck: maxBottleneckVal > 0,
            value: maxBottleneckVal,
            linkName: bottleneckName,
          },
          etcSeconds: remainingTimeSec,
          etcThroughput: isSimulating ? activeThroughputGbps : 0.0,
          isTransferring: isSimulating,
          transferProgress: progressPercent,
          isCompleted: progressPercent >= 100 && totalPayloadMB > 0,
          totalPayloadMB,
          transferredMB: (progressPercent / 100) * totalPayloadMB,
          remainingMB: Math.max(0, totalPayloadMB - ((progressPercent / 100) * totalPayloadMB)),
          totalPackets,
          packetsProcessed: Math.min(totalPackets, Math.floor((progressPercent / 100) * totalPackets)),
          packetsInFlight: inFlight,
          packetRatePerSec: packetRate,
          maxFlowCapGbps: 10.0,
        }));
      }

      animationFrameId = window.requestAnimationFrame(tick);
    };

    animationFrameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [
    activeUserSource,
    settings.refreshRateMs,
    isSimulating,
    totalPayloadMB,
    totalPackets,
    progressPercent,
    transmissionMode,
    packetsProcessed,
  ]);

  // Simulation execution loop - driven by active payload size and transfer rates
  useEffect(() => {
    if (!isSimulating || totalPayloadMB <= 0) {
      return;
    }

    let animationFrameId = 0;
    let lastTick = 0;

    const tick = (timestamp: number) => {
      if (timestamp - lastTick >= 150) {
        lastTick = timestamp;

        setProgressPercent((prev) => {
          let step = totalPayloadMB > 2000 ? 0.8 : totalPayloadMB > 500 ? 1.5 : 2.5;
          if (viewMode === '2D') {
            step = step * 0.2;
          }
          const next = Math.min(100, prev + step);

          setIngestedFiles((files) =>
            files.map((f) => {
              if (f.status === 'COMPLETED') return f;
              const nextProg = Math.min(100, f.progress + step * (f.sizeMB < 200 ? 1.4 : 0.9));
              return {
                ...f,
                progress: Math.round(nextProg),
                status: nextProg >= 100 ? 'COMPLETED' : 'SYNCING',
                speedMbps: transmissionMode === 'send' ? 520 : 640,
              };
            })
          );

          if (next >= 100) {
            setIsSimulating(false);
            setMetrics((m) => ({
              ...m,
              isCompleted: true,
              isTransferring: false,
              transferProgress: 100,
              etcSeconds: 0.0,
              transferredMB: totalPayloadMB,
              remainingMB: 0,
              packetsProcessed: totalPackets,
              packetsInFlight: 0,
            }));

            const routeTelemetry = calculateCompletedRoutes(
              nodes,
              paths,
              transmissionMode,
              activeUserSource,
              totalPayloadMB,
              bestPathId
            );
            setCompletedRouteInfo(routeTelemetry);

            if (ingestedFiles.length > 0 && totalPayloadMB > 0) {
              const newRec = createAndSaveHistoryRecord(
                transmissionMode,
                ingestedFiles,
                nodes,
                activeUserSource,
                topologyPreset,
                "Dinic's Algorithm",
                settings.encryptionStandard,
                routeTelemetry,
                3.1
              );
              addHistoryEntry(newRec);

              if (transmissionMode === 'receive' && newRec.files.length > 0) {
                autoOpenReceivedFiles(newRec.files);
              }
            }

            addToast(
              transmissionMode === 'send'
                ? `Tx Stream Delivered (${routeTelemetry.sourceNode.nodeLabel} ➔ ${routeTelemetry.targetNode.nodeLabel})`
                : `Rx Stream Received (${routeTelemetry.sourceNode.nodeLabel} ➔ ${routeTelemetry.targetNode.nodeLabel})`,
              `All ${totalPayloadMB.toFixed(1)} MB completed & auto-saved to History Space. Fastest Path: ${routeTelemetry.fastestRoute.name} (${routeTelemetry.fastestRoute.totalLatencyMs}ms ping • ${routeTelemetry.fastestRoute.estimatedTransitTimeSec}s).`,
              'success'
            );
            return 100;
          }
          return next;
        });
      }

      animationFrameId = window.requestAnimationFrame(tick);
    };

    animationFrameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [
    isSimulating,
    totalPayloadMB,
    totalPackets,
    transmissionMode,
    activeUserSource,
    bestPathId,
    nodes,
    paths,
    ingestedFiles,
    topologyPreset,
    settings.encryptionStandard,
    addToast,
    viewMode,
  ]);

  const handleStartSimulation = () => {
    if (totalPayloadMB === 0) {
      addToast('No Payload Ingested', 'Please put files, pictures, or folders in the Target Ingest box first.', 'warning');
      return;
    }
    setIsSimulating(true);
    if (progressPercent >= 100) {
      setProgressPercent(0);
      setIngestedFiles((files) => files.map((f) => ({ ...f, progress: 0, status: 'SYNCING' })));
    }
    setMetrics((m) => ({ ...m, isTransferring: true, isCompleted: false, hasError: false }));
    addToast(
      transmissionMode === 'send' ? 'Send Process (Tx) Initiated' : 'Receive Process (Rx) Initiated',
      `Routing ${totalPayloadMB.toFixed(1)} MB across multi-path datacenter topology.`,
      'info'
    );
  };

  const handleStopSimulation = () => {
    setIsSimulating(false);
    setMetrics((m) => ({ ...m, isTransferring: false }));
    addToast(
      'Transmission Paused',
      `${transmissionMode === 'send' ? 'Tx' : 'Rx'} stream paused at ${progressPercent.toFixed(1)}%.`,
      'info'
    );
  };

  const handleStepBFS = () => {
    if (totalPayloadMB === 0) {
      addToast('Step BFS', 'Level graph constructed. Ingest payload queue is currently empty (0 MB).', 'info');
      return;
    }
    const nextProg = Math.min(100, progressPercent + 15);
    setProgressPercent(nextProg);
    if (nextProg >= 100) {
      setIsSimulating(false);
      setMetrics((m) => ({ ...m, isCompleted: true, isTransferring: false, transferProgress: 100 }));
      const routeTelemetry = calculateCompletedRoutes(
        nodes,
        paths,
        transmissionMode,
        activeUserSource,
        totalPayloadMB,
        bestPathId
      );
      setCompletedRouteInfo(routeTelemetry);
    }
    addToast('Step BFS Executed', 'Shortest-path level graph built. Residual capacities verified.', 'info');
  };

  const handleStepDFS = () => {
    if (totalPayloadMB === 0) {
      addToast('Step DFS', 'Admissible edge paths verified. Ingest payload queue is currently empty (0 MB).', 'info');
      return;
    }
    const nextProg = Math.min(100, progressPercent + 25);
    setProgressPercent(nextProg);
    if (nextProg >= 100) {
      setIsSimulating(false);
      setMetrics((m) => ({ ...m, isCompleted: true, isTransferring: false, transferProgress: 100 }));
      const routeTelemetry = calculateCompletedRoutes(
        nodes,
        paths,
        transmissionMode,
        activeUserSource,
        totalPayloadMB,
        bestPathId
      );
      setCompletedRouteInfo(routeTelemetry);
    }
    addToast('Step DFS Executed', 'Augmenting flow pushed along admissible edge hierarchy.', 'info');
  };

  const handleSelectRouteForNextTransfer = (routeId: string) => {
    if (routeId === 'route-alpha') {
      setBestPathId('path-ac');
    } else if (routeId === 'route-beta') {
      setBestPathId('path-ef');
    } else if (routeId === 'route-gamma') {
      setBestPathId('path-eg');
    } else if (routeId === 'route-delta') {
      setBestPathId('path-bd');
    }
    addToast('Preferred Route Locked', `Preferred route set to ${routeId.toUpperCase()} for subsequent transfers.`, 'success');
  };

  const handleSimulateError = () => {
    handleTogglePathDrop('path-bd');
    setIsSimulating(false);
    setIngestedFiles((files) =>
      files.map((f) => (f.status === 'SYNCING' || f.status === 'QUEUED' ? { ...f, status: 'FAILED' } : f))
    );
    setMetrics((m) => ({
      ...m,
      hasError: true,
      isTransferring: false,
      errorMessage: `Primary link dropped (Link B-D Timeout). Not able to ${transmissionMode === 'send' ? 'send' : 'receive'
        } stream.`,
    }));
    setIsErrorModalOpen(true);
    addToast(
      'Transmission Interrupted',
      `Error: Not able to ${transmissionMode === 'send' ? 'send' : 'receive'} stream. Should we continue the transfer again?`,
      'error'
    );
  };

  const handleRetryTransfer = () => {
    // Restore dropped paths
    setPaths((prev) => prev.map((p) => ({ ...p, status: p.isDropped ? 'DROPPED' : 'QUANTUM-SAFE' })));
    setIngestedFiles((files) =>
      files.map((f) => (f.status === 'FAILED' ? { ...f, status: 'SYNCING' } : f))
    );
    setMetrics((m) => ({
      ...m,
      hasError: false,
      errorMessage: undefined,
      isTransferring: true,
    }));
    setIsErrorModalOpen(false);
    setIsSimulating(true);
    addToast(
      'Transfer Resumed',
      `Link re-established. Continuing ${transmissionMode === 'send' ? 'transmission' : 'reception'} stream...`,
      'success'
    );
  };

  const handleRerouteTransfer = () => {
    // Reroute via alternate paths (e.g. A->C->D)
    setBestPathId('path-ac');
    setIngestedFiles((files) =>
      files.map((f) => (f.status === 'FAILED' ? { ...f, status: 'SYNCING' } : f))
    );
    setMetrics((m) => ({
      ...m,
      hasError: false,
      errorMessage: undefined,
      isTransferring: true,
    }));
    setIsErrorModalOpen(false);
    setIsSimulating(true);
    addToast(
      'Stream Rerouted & Continued',
      `Dinic level graph recalculated around offline node/link. Resuming ${transmissionMode === 'send' ? 'transmission' : 'reception'
      }...`,
      'success'
    );
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setProgressPercent(0);
    setPaths(INITIAL_PATHS);
    setIsErrorModalOpen(false);
    setIngestedFiles((files) => files.map((f) => ({ ...f, progress: 0, status: 'QUEUED' })));
    setMetrics((m) => ({
      ...m,
      isCompleted: false,
      hasError: false,
      errorMessage: undefined,
      isTransferring: false,
      transferProgress: 0,
      etcSeconds: 0.0,
      transferredMB: 0,
      remainingMB: totalPayloadMB,
      packetsProcessed: 0,
      packetsInFlight: 0,
    }));
    addToast('Simulation Reset', 'State, progress, and transmission metrics reset to queue baseline.', 'info');
  };

  // =========================================================================
  // History Space Handlers & Automated Restore Engine
  // =========================================================================
  const handleRestoreHistoryRecord = useCallback((record: TransferHistoryRecord) => {
    // 1. Restore the files into the ingestedFiles active workspace
    const restoredFiles: IngestedFile[] = record.files.map((f) => ({
      ...f,
      progress: 100,
      status: 'COMPLETED' as const,
    }));
    setIngestedFiles(restoredFiles);

    // 2. Restore transmission mode
    setTransmissionMode(record.mode);

    // 3. Restore user source if present
    if (record.userSource) {
      setActiveUserSource(record.userSource);
    }

    // 4. Restore topology preset if present
    if (record.topologyPreset) {
      setTopologyPreset(record.topologyPreset);
    }

    // 5. Restore or compute route telemetry
    if (record.routeInfo) {
      setCompletedRouteInfo(record.routeInfo);
    } else {
      const generatedRoute = calculateCompletedRoutes(
        nodes,
        paths,
        record.mode,
        record.userSource || activeUserSource,
        record.totalSizeMB,
        bestPathId
      );
      setCompletedRouteInfo(generatedRoute);
    }

    // 6. Restore metrics to ready & completed status
    const totalBytes = record.totalSizeMB * 1024 * 1024;
    const restoredPackets = Math.ceil(totalBytes / 1500);

    setMetrics((m) => ({
      ...m,
      isCompleted: true,
      isTransferring: false,
      hasError: false,
      transferProgress: 100,
      totalPayloadMB: record.totalSizeMB,
      transferredMB: record.totalSizeMB,
      remainingMB: 0,
      totalPackets: restoredPackets,
      packetsProcessed: restoredPackets,
      packetsInFlight: 0,
      mode: record.mode,
    }));
    setProgressPercent(100);
    setIsSimulating(false);

    // 7. Update the record's restoredCount in persistent storage
    setHistoryRecords((prev) => {
      const updated = prev.map((r) =>
        r.id === record.id
          ? {
            ...r,
            restoredCount: (r.restoredCount || 0) + 1,
            status: 'RESTORED' as const,
          }
          : r
      );
      saveTransferHistory(updated);
      return updated;
    });

    if (restoredFiles.length > 0) {
      autoOpenReceivedFiles(restoredFiles);
    }

    // 8. User feedback and auto navigation to execution view
    addToast(
      'Data Restored from History',
      `Restored ${restoredFiles.length} item(s) (${record.totalSizeMB} MB) from record #${record.id.slice(0, 8)} into active ${record.mode === 'send' ? 'Tx' : 'Rx'
      } workspace.`,
      'success'
    );
    setActiveTab('Execution');
  }, [nodes, paths, activeUserSource, bestPathId, addToast, autoOpenReceivedFiles]);

  const handleDeleteHistoryRecord = useCallback((id: string) => {
    setHistoryRecords((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveTransferHistory(updated);
      return updated;
    });
    addToast('History Record Removed', 'The selected transfer session was deleted from storage.', 'info');
  }, [addToast]);

  const handleClearAllHistory = useCallback(() => {
    setHistoryRecords([]);
    saveTransferHistory([]);
    addToast('History Space Cleared', 'All stored transfer and receive records have been cleared.', 'warning');
  }, [addToast]);

  const handleToggleFavorite = useCallback((id: string) => {
    setHistoryRecords((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
      saveTransferHistory(updated);
      return updated;
    });
  }, []);

  const handleSnapshotCurrentWorkspace = useCallback(() => {
    const filesToSave = ingestedFiles.length > 0 ? ingestedFiles : INITIAL_FILES;
    const computedPayloadMB = filesToSave.reduce((acc, f) => acc + f.sizeMB, 0);

    const routeTelemetry =
      completedRouteInfo ||
      calculateCompletedRoutes(
        nodes,
        paths,
        transmissionMode,
        activeUserSource,
        computedPayloadMB,
        bestPathId
      );

    const snapshot = createAndSaveHistoryRecord(
      transmissionMode,
      filesToSave,
      nodes,
      activeUserSource,
      topologyPreset,
      "Dinic's Algorithm",
      settings.encryptionStandard,
      routeTelemetry,
      2.4
    );

    addHistoryEntry(snapshot);
    addToast(
      'Workspace Snapshotted',
      `Current ${transmissionMode === 'send' ? 'Tx' : 'Rx'} workspace (${filesToSave.length} files, ${computedPayloadMB.toFixed(1)} MB) saved to History Space.`,
      'success'
    );
  }, [ingestedFiles, completedRouteInfo, nodes, paths, transmissionMode, activeUserSource, topologyPreset, settings.encryptionStandard, bestPathId, addToast, addHistoryEntry]);

  const handleResetSeedData = useCallback(() => {
    setHistoryRecords(SEED_HISTORY_RECORDS);
    saveTransferHistory(SEED_HISTORY_RECORDS);
    addToast('Sample Records Restored', 'Initialized History Space with sample multi-datacenter transfer sessions.', 'info');
  }, [addToast]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#051424] text-[#d4e4fa] font-inter select-none">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadAlertsCount={toasts.filter((t) => t.type === 'error' || t.type === 'warning').length}
        historyRecordsCount={historyRecords.length}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {activeTab === 'Execution' && (
          <>
            {/* Left Parameters Panel */}
            <div
              style={{ width: isLeftCollapsed ? 0 : `${leftPanelWidth}px` }}
              className={`transition-all duration-200 ease-in-out h-full overflow-hidden flex flex-shrink-0 relative ${isLeftCollapsed ? 'opacity-0' : 'opacity-100'
                }`}
            >
              <div className="w-full h-full flex flex-col overflow-hidden">
                <LeftPanel
                  activeUserSource={activeUserSource}
                  onChangeUserSource={setActiveUserSource}
                  transmissionMode={transmissionMode}
                  onToggleTransmissionMode={setTransmissionMode}
                  analysisMode={analysisMode}
                  onToggleAnalysisMode={handleToggleAnalysisMode}
                  topologyPreset={topologyPreset}
                  onChangeTopologyPreset={setTopologyPreset}
                  ingestedFiles={ingestedFiles}
                  onAddFiles={handleAddFiles}
                  onClearFiles={handleClearFiles}
                  onLoadSampleFiles={handleLoadSampleFiles}
                  onOpenHistorySpace={() => setActiveTab('History')}
                  isSimulating={isSimulating}
                  onStartSimulation={handleStartSimulation}
                  onStopSimulation={handleStopSimulation}
                  onStepBFS={handleStepBFS}
                  onStepDFS={handleStepDFS}
                  onSimulateError={handleSimulateError}
                  onResetSimulation={handleResetSimulation}
                  onRetryTransfer={handleRetryTransfer}
                  onRerouteTransfer={handleRerouteTransfer}
                  hasError={metrics.hasError}
                  errorMessage={metrics.errorMessage}
                  onCollapse={() => setIsLeftCollapsed(true)}
                  width={leftPanelWidth}
                  onResize={setLeftPanelWidth}
                  isCompleted={metrics.isCompleted}
                  routeInfo={completedRouteInfo}
                  onOpenRouteAnalysis={() => setIsRouteAnalysisModalOpen(true)}
                />
              </div>

              {/* Left Vertical Drag Resizer Line Handle */}
              {!isLeftCollapsed && (
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsDraggingLeft(true);
                  }}
                  onTouchStart={() => setIsDraggingLeft(true)}
                  title="Drag line to resize Left Parameters Box (Double-click to reset 320px)"
                  onDoubleClick={() => setLeftPanelWidth(320)}
                  className={`absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize z-30 group flex items-center justify-center transition-colors ${isDraggingLeft ? 'bg-[#adc6ff]/20' : 'hover:bg-[#adc6ff]/15'
                    }`}
                >
                  {/* Subtle/Illuminated Line */}
                  <div
                    className={`w-[2px] h-full transition-colors ${isDraggingLeft
                      ? 'bg-[#adc6ff] shadow-[0_0_10px_#adc6ff]'
                      : 'bg-[#424754]/80 group-hover:bg-[#adc6ff] group-hover:shadow-[0_0_6px_#adc6ff]'
                      }`}
                  />
                  {/* Center Grip Pill with Dots */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 px-1 py-2 rounded-full border border-[#424754] bg-[#122131] shadow-lg flex flex-col items-center gap-0.5 pointer-events-none transition-all ${isDraggingLeft
                      ? 'border-[#adc6ff] bg-[#1c2b3c] scale-110 shadow-[0_0_10px_#adc6ff]'
                      : 'group-hover:border-[#adc6ff] group-hover:bg-[#1c2b3c]'
                      }`}
                  >
                    <div className="w-1 h-1 rounded-full bg-[#adc6ff]" />
                    <div className="w-1 h-1 rounded-full bg-[#adc6ff]" />
                    <div className="w-1 h-1 rounded-full bg-[#adc6ff]" />
                  </div>

                  {/* Width Pill Indicator while dragging */}
                  {isDraggingLeft && (
                    <div className="absolute top-8 left-4 px-2 py-0.5 rounded bg-[#122131] border border-[#adc6ff] text-[#adc6ff] font-mono-data text-[10px] font-bold shadow-xl whitespace-nowrap pointer-events-none z-50">
                      {leftPanelWidth}px
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Center Canvas */}
            <CenterView
              viewMode={viewMode}
              onToggleViewMode={handleToggleViewMode}
              hubs={hubs}
              nodes={nodes}
              paths={paths}
              selectedHub={selectedHub}
              onSelectHub={setSelectedHub}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
              activeUserSource={activeUserSource}
              transmissionMode={transmissionMode}
              autoRotate={autoRotate}
              onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
              isLeftCollapsed={isLeftCollapsed}
              onToggleLeft={() => setIsLeftCollapsed(!isLeftCollapsed)}
              isRightCollapsed={isRightCollapsed}
              onToggleRight={() => setIsRightCollapsed(!isRightCollapsed)}
              ingestedFiles={ingestedFiles}
              onOpenTransmissionDetails={() => setIsDetailsOpen(true)}
              isSimulating={isSimulating}
              bestPathId={bestPathId}
              progressPercent={progressPercent}
              hasError={metrics.hasError}
              errorMessage={metrics.errorMessage}
              onRetryTransfer={handleRetryTransfer}
              onRerouteTransfer={handleRerouteTransfer}
              onOpenErrorModal={() => setIsErrorModalOpen(true)}
              isCompleted={metrics.isCompleted}
              routeInfo={completedRouteInfo}
              onOpenRouteAnalysis={() => setIsRouteAnalysisModalOpen(true)}
              onOpenHistorySpace={() => setActiveTab('History')}
            />

            {/* Right Analytics Panel */}
            <div
              style={{ width: isRightCollapsed ? 0 : `${rightPanelWidth}px` }}
              className={`transition-all duration-200 ease-in-out h-full overflow-hidden flex flex-shrink-0 relative ${isRightCollapsed ? 'opacity-0' : 'opacity-100'
                }`}
            >
              {/* Right Vertical Drag Resizer Line Handle */}
              {!isRightCollapsed && (
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsDraggingRight(true);
                  }}
                  onTouchStart={() => setIsDraggingRight(true)}
                  title="Drag line to resize Right Analytics Box (Double-click to reset 360px)"
                  onDoubleClick={() => setRightPanelWidth(360)}
                  className={`absolute -left-2 top-0 bottom-0 w-4 cursor-col-resize z-30 group flex items-center justify-center transition-colors ${isDraggingRight ? 'bg-[#4edea3]/20' : 'hover:bg-[#4edea3]/15'
                    }`}
                >
                  {/* Subtle/Illuminated Line */}
                  <div
                    className={`w-[2px] h-full transition-colors ${isDraggingRight
                      ? 'bg-[#4edea3] shadow-[0_0_10px_#4edea3]'
                      : 'bg-[#424754]/80 group-hover:bg-[#4edea3] group-hover:shadow-[0_0_6px_#4edea3]'
                      }`}
                  />
                  {/* Center Grip Pill with Dots */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 px-1 py-2 rounded-full border border-[#424754] bg-[#122131] shadow-lg flex flex-col items-center gap-0.5 pointer-events-none transition-all ${isDraggingRight
                      ? 'border-[#4edea3] bg-[#1c2b3c] scale-110 shadow-[0_0_10px_#4edea3]'
                      : 'group-hover:border-[#4edea3] group-hover:bg-[#1c2b3c]'
                      }`}
                  >
                    <div className="w-1 h-1 rounded-full bg-[#4edea3]" />
                    <div className="w-1 h-1 rounded-full bg-[#4edea3]" />
                    <div className="w-1 h-1 rounded-full bg-[#4edea3]" />
                  </div>

                  {/* Width Pill Indicator while dragging */}
                  {isDraggingRight && (
                    <div className="absolute top-8 right-4 px-2 py-0.5 rounded bg-[#122131] border border-[#4edea3] text-[#4edea3] font-mono-data text-[10px] font-bold shadow-xl whitespace-nowrap pointer-events-none z-50">
                      {rightPanelWidth}px
                    </div>
                  )}
                </div>
              )}

              <div className="w-full h-full flex flex-col overflow-hidden">
                <RightPanel
                  metrics={metrics}
                  algorithmMetrics={algorithmMetrics}
                  healthReportText={healthReportText}
                  onCollapse={() => setIsRightCollapsed(true)}
                  width={rightPanelWidth}
                  onResize={setRightPanelWidth}
                  onRetryTransfer={handleRetryTransfer}
                  onRerouteTransfer={handleRerouteTransfer}
                  onResetTransfer={handleResetSimulation}
                  routeInfo={completedRouteInfo}
                  onOpenRouteAnalysis={() => setIsRouteAnalysisModalOpen(true)}
                  onOpenHistorySpace={() => setActiveTab('History')}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'Topology' && (
          <TopologyScreen
            nodes={nodes}
            paths={paths}
            onTogglePathDrop={handleTogglePathDrop}
            onAddCustomNode={handleAddCustomNode}
            transmissionMode={transmissionMode}
            onSelectNode={setSelectedNode}
            selectedNode={selectedNode}
          />
        )}

        {activeTab === 'Analysis' && <AnalysisScreen hubs={hubs} metrics={metrics} />}

        {activeTab === 'Algorithms' && <AlgorithmsScreen />}

        {activeTab === 'History' && (
          <HistorySpaceScreen
            records={historyRecords}
            onRestoreRecord={handleRestoreHistoryRecord}
            onDeleteRecord={handleDeleteHistoryRecord}
            onClearAllHistory={handleClearAllHistory}
            onToggleFavorite={handleToggleFavorite}
            onSnapshotCurrentWorkspace={handleSnapshotCurrentWorkspace}
            onResetSeedData={handleResetSeedData}
            onNavigateToExecution={() => setActiveTab('Execution')}
            onOpenFile={handleOpenPreviewFile}
            currentPayloadCount={ingestedFiles.length}
            currentPayloadMB={totalPayloadMB}
            currentMode={transmissionMode}
          />
        )}
      </div>

      {/* Bottom Footer Status Bar */}
      <Footer
        latency={metrics.globalLatency}
        systemHealth={
          metrics.criticalBottleneck.hasBottleneck ? 'DEGRADED' : metrics.hasError ? 'ERROR' : 'NOMINAL'
        }
        onOpenDocModal={() => setInfoModalType('doc')}
        onOpenApiModal={() => setInfoModalType('api')}
        onOpenStatusModal={() => setInfoModalType('status')}
      />

      {/* Modal Dialogs */}
      <DeployConfigModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        throughput={metrics.totalThroughput}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
      />

      <TransmissionDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        files={ingestedFiles}
        onOpenFile={handleOpenPreviewFile}
      />

      <TransferErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        mode={transmissionMode}
        errorMessage={metrics.errorMessage || 'Primary link dropped (Timeout). Unable to send/receive stream.'}
        onRetryTransfer={handleRetryTransfer}
        onRerouteTransfer={handleRerouteTransfer}
        onResetTransfer={handleResetSimulation}
        transferredMB={transferredMB}
        totalPayloadMB={totalPayloadMB}
        progressPercent={progressPercent}
      />

      <RouteAnalysisModal
        isOpen={isRouteAnalysisModalOpen}
        onClose={() => setIsRouteAnalysisModalOpen(false)}
        routeInfo={completedRouteInfo}
        onSelectRouteForNextTransfer={handleSelectRouteForNextTransfer}
        onRetestTransfer={handleStartSimulation}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={toasts}
        onClearAll={() => setToasts([])}
      />

      <InfoModals type={infoModalType} onClose={() => setInfoModalType(null)} />

      {/* Transferred File Preview & Opening Inspector */}
      <FilePreviewModal
        file={previewFile}
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
      />

      {/* Toast Alert Popups */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
