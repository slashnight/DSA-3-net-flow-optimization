import {
  TransferHistoryRecord,
  TransmissionMode,
  TopologyPreset,
  UserSource,
  IngestedFile,
  CompletedTransferRouteInfo,
  NetworkNode,
} from '../types';

const STORAGE_KEY = 'QUANTUM_TRANSFER_HISTORY_V2';

/**
 * Seed historical data representing previous send and receive operations
 */
export const SEED_HISTORY_RECORDS: TransferHistoryRecord[] = [
  {
    id: 'tx-rec-98214',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago
    formattedDate: new Date(Date.now() - 1000 * 60 * 18).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    mode: 'send',
    status: 'SUCCESS',
    totalSizeMB: 1240.5,
    totalPackets: 861450,
    durationSec: 3.42,
    averageSpeedMbps: 2901.7,
    peakThroughputGbps: 3.45,
    algorithm: "Dinic's Algorithm",
    topologyPreset: 'Data Center / CDN Topology',
    userSource: 'u1',
    sourceNode: {
      id: 'node-a',
      label: 'Node A (Origin Gateway)',
      ip: '198.51.100.24',
      dataCenter: 'US-EAST-01 (Virginia Core)',
    },
    targetNode: {
      id: 'node-f',
      label: 'Node F (Tokyo Hyper-Scale)',
      ip: '203.0.113.5',
      dataCenter: 'JP-EAST-03 (Tokyo Metro)',
    },
    files: [
      {
        id: 'h-file-1',
        name: 'neural_weights_v4.pt',
        sizeMB: 780.0,
        type: 'archive',
        user: 'u1 (Alice - Machine Learning)',
        progress: 100,
        status: 'COMPLETED',
        speedMbps: 2950,
      },
      {
        id: 'h-file-2',
        name: 'training_dataset_shard_08.parquet',
        sizeMB: 340.5,
        type: 'document',
        user: 'u1 (Alice - Machine Learning)',
        progress: 100,
        status: 'COMPLETED',
        speedMbps: 2880,
      },
      {
        id: 'h-file-3',
        name: 'model_evaluation_metrics.json',
        sizeMB: 120.0,
        type: 'document',
        user: 'u1 (Alice - Machine Learning)',
        progress: 100,
        status: 'COMPLETED',
        speedMbps: 2790,
      },
    ],
    encryptionStandard: 'Kyber-768 Quantum-Safe',
    checksumHash: 'SHA3-512:a8f9c2d1e04b7...verified',
    notes: 'Large language model checkpoint transfer via Pacific low-latency undersea fiber.',
    isFavorite: true,
    restoredCount: 2,
    clientIp: '192.168.1.104',
    autoSaved: true,
  },
  {
    id: 'rx-rec-87412',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(), // 55 mins ago
    formattedDate: new Date(Date.now() - 1000 * 60 * 55).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    mode: 'receive',
    status: 'SUCCESS',
    totalSizeMB: 845.2,
    totalPackets: 586940,
    durationSec: 2.15,
    averageSpeedMbps: 3144.9,
    peakThroughputGbps: 3.82,
    algorithm: "Dinic's Algorithm",
    topologyPreset: 'Dense Mesh Network',
    userSource: 'u2',
    sourceNode: {
      id: 'node-d',
      label: 'Node D (Frankfurt Gateway)',
      ip: '194.12.44.88',
      dataCenter: 'EU-WEST-02 (Frankfurt Hub)',
    },
    targetNode: {
      id: 'node-a',
      label: 'Node A (Local Cluster)',
      ip: '198.51.100.24',
      dataCenter: 'US-EAST-01 (Virginia Core)',
    },
    files: [
      {
        id: 'h-file-4',
        name: 'satellite_imagery_4k_hdr.tar.gz',
        sizeMB: 620.0,
        type: 'picture',
        user: 'u2 (Bob - Analytics)',
        progress: 100,
        status: 'COMPLETED',
        speedMbps: 3200,
      },
      {
        id: 'h-file-5',
        name: 'geospatial_telemetry.csv',
        sizeMB: 225.2,
        type: 'document',
        user: 'u2 (Bob - Analytics)',
        progress: 100,
        status: 'COMPLETED',
        speedMbps: 3080,
      },
    ],
    encryptionStandard: 'AES-256-GCM',
    checksumHash: 'BLAKE3:7c3b9914d...verified',
    notes: 'Ingested raw Earth Observation raster tiles from European Space Hub.',
    isFavorite: false,
    restoredCount: 0,
    clientIp: '10.0.4.19',
    autoSaved: true,
  },
  {
    id: 'tx-rec-76103',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    formattedDate: new Date(Date.now() - 1000 * 60 * 180).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    mode: 'send',
    status: 'REROUTED',
    totalSizeMB: 450.0,
    totalPackets: 312500,
    durationSec: 4.88,
    averageSpeedMbps: 737.7,
    peakThroughputGbps: 1.15,
    algorithm: 'Edmonds-Karp',
    topologyPreset: 'Abstract Sparse Graph',
    userSource: 'u3',
    sourceNode: {
      id: 'node-b',
      label: 'Node B (Ingress Router)',
      ip: '198.51.100.32',
      dataCenter: 'US-EAST-01 (Virginia Core)',
    },
    targetNode: {
      id: 'node-g',
      label: 'Node G (Singapore Edge)',
      ip: '175.45.176.10',
      dataCenter: 'SG-CENT-04 (Singapore Equinix)',
    },
    files: [
      {
        id: 'h-file-6',
        name: 'financial_ledger_q3_encrypted.db',
        sizeMB: 350.0,
        type: 'archive',
        user: 'u3 (Charlie - Security)',
        progress: 100,
        status: 'COMPLETED',
        speedMbps: 780,
      },
      {
        id: 'h-file-7',
        name: 'audit_log_signoff.pdf',
        sizeMB: 100.0,
        type: 'document',
        user: 'u3 (Charlie - Security)',
        progress: 100,
        status: 'COMPLETED',
        speedMbps: 690,
      },
    ],
    encryptionStandard: 'Kyber-768 Quantum-Safe',
    checksumHash: 'SHA3-256:55ef01a2...verified',
    notes: 'Encountered mid-flight latency spike on transatlantic link. Dinic BFS dynamically rerouted through secondary trunk.',
    isFavorite: true,
    restoredCount: 1,
    clientIp: '192.168.2.88',
    autoSaved: true,
  },
  {
    id: 'rx-rec-61094',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    formattedDate: new Date(Date.now() - 1000 * 60 * 60 * 12).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    mode: 'receive',
    status: 'SUCCESS',
    totalSizeMB: 1980.0,
    totalPackets: 1375000,
    durationSec: 5.12,
    averageSpeedMbps: 3093.7,
    peakThroughputGbps: 4.1,
    algorithm: "Dinic's Algorithm",
    topologyPreset: 'Dense Mesh Network',
    userSource: 'all',
    sourceNode: {
      id: 'node-f',
      label: 'Node F (Tokyo Core)',
      ip: '203.0.113.5',
      dataCenter: 'JP-EAST-03 (Tokyo Metro)',
    },
    targetNode: {
      id: 'node-c',
      label: 'Node C (Primary Ingress)',
      ip: '198.51.100.48',
      dataCenter: 'US-EAST-01 (Virginia Core)',
    },
    files: [
      {
        id: 'h-file-8',
        name: '4k_video_render_sequence.mp4',
        sizeMB: 1450.0,
        type: 'video',
        user: 'u1 (Alice)',
        progress: 100,
        status: 'COMPLETED',
        speedMbps: 3150,
      },
      {
        id: 'h-file-9',
        name: 'audio_stems_spatial_dolby.flac',
        sizeMB: 530.0,
        type: 'folder',
        user: 'u2 (Bob)',
        progress: 100,
        status: 'COMPLETED',
        speedMbps: 3020,
      },
    ],
    encryptionStandard: 'ChaCha20-Poly1305',
    checksumHash: 'SHA-256:99f81a7b...verified',
    notes: 'Multi-stream synchronized media asset sync from Tokyo broadcast center.',
    isFavorite: false,
    restoredCount: 0,
    clientIp: '172.16.0.52',
    autoSaved: true,
  },
];

/**
 * Load transfer history from localStorage or initialize with seed data
 */
export const loadTransferHistory = (): TransferHistoryRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validRecords = parsed.filter((record) => Boolean(record) && Array.isArray(record.files));
        if (validRecords.length > 0) {
          return validRecords as TransferHistoryRecord[];
        }
      }
    }
  } catch (e) {
    console.error('Failed to load transfer history from localStorage:', e);
  }

  saveTransferHistory(SEED_HISTORY_RECORDS);
  return SEED_HISTORY_RECORDS;
};

/**
 * Save transfer history to localStorage
 */
export const saveTransferHistory = (records: TransferHistoryRecord[]): void => {
  try {
    const safeRecords = Array.isArray(records) ? records : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeRecords));
  } catch (e) {
    console.error('Failed to save transfer history to localStorage:', e);
  }
};

/**
 * Build and save a new transfer history record automatically
 */
export const createAndSaveHistoryRecord = (
  mode: TransmissionMode,
  files: IngestedFile[],
  nodes: NetworkNode[],
  userSource: UserSource,
  topologyPreset: TopologyPreset,
  algorithm: string,
  encryptionStandard: string,
  routeInfo: CompletedTransferRouteInfo | null,
  durationSec: number = 2.4
): TransferHistoryRecord => {
  const totalSizeMB = files.reduce((acc, f) => acc + f.sizeMB, 0);
  const totalPackets = Math.max(1000, Math.round(totalSizeMB * 694.4));
  const avgSpeed = durationSec > 0 ? (totalSizeMB * 8) / durationSec : 2850;
  const peakGbps = parseFloat(((avgSpeed * 1.25) / 1000).toFixed(2));

  const sourceNode = routeInfo?.sourceNode
    ? {
        id: routeInfo.sourceNode.nodeId,
        label: routeInfo.sourceNode.nodeLabel,
        ip: routeInfo.sourceNode.ip,
        dataCenter: routeInfo.sourceNode.dataCenter || 'Edge Gateway',
      }
    : {
        id: 'node-a',
        label: 'Node A (Gateway)',
        ip: '198.51.100.24',
        dataCenter: 'US-EAST-01 (Virginia Core)',
      };

  const targetNode = routeInfo?.targetNode
    ? {
        id: routeInfo.targetNode.nodeId,
        label: routeInfo.targetNode.nodeLabel,
        ip: routeInfo.targetNode.ip,
        dataCenter: routeInfo.targetNode.dataCenter || 'Cloud Destination',
      }
    : {
        id: 'node-f',
        label: 'Node F (Tokyo Core)',
        ip: '203.0.113.5',
        dataCenter: 'JP-EAST-03 (Tokyo Metro)',
      };

  const randomHash = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  const newRecord: TransferHistoryRecord = {
    id: `${mode === 'send' ? 'tx' : 'rx'}-rec-${Date.now().toString(36).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    formattedDate: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    mode,
    status: 'SUCCESS',
    totalSizeMB: parseFloat(totalSizeMB.toFixed(2)),
    totalPackets,
    durationSec: parseFloat(durationSec.toFixed(2)),
    averageSpeedMbps: parseFloat(avgSpeed.toFixed(1)),
    peakThroughputGbps: peakGbps,
    algorithm,
    topologyPreset,
    userSource,
    sourceNode,
    targetNode,
    files: JSON.parse(JSON.stringify(files)), // deep copy
    routeInfo,
    encryptionStandard,
    checksumHash: `SHA3-512:${randomHash}...verified`,
    notes: `${mode === 'send' ? 'Transmitted' : 'Received'} ${files.length} payload item(s) across network topology.`,
    isFavorite: false,
    restoredCount: 0,
    clientIp: '192.168.1.104',
    autoSaved: true,
  };

  const currentHistory = loadTransferHistory();
  const updatedHistory = [newRecord, ...currentHistory];
  saveTransferHistory(updatedHistory);

  return newRecord;
};

/**
 * Export history as JSON file download
 */
export const exportHistoryAsJSON = (records: TransferHistoryRecord[]): void => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute(
    'download',
    `quantum_transfer_history_${new Date().toISOString().slice(0, 10)}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

/**
 * Export history as CSV file download
 */
export const exportHistoryAsCSV = (records: TransferHistoryRecord[]): void => {
  const headers = [
    'Record ID',
    'Timestamp',
    'Direction',
    'Status',
    'Total Size (MB)',
    'Packets',
    'Duration (s)',
    'Avg Speed (Mbps)',
    'Algorithm',
    'Source Node',
    'Target Node',
    'Files Count',
    'Checksum Hash',
  ];

  const rows = records.map((r) => [
    r.id,
    `"${r.formattedDate}"`,
    r.mode.toUpperCase(),
    r.status,
    r.totalSizeMB,
    r.totalPackets,
    r.durationSec,
    r.averageSpeedMbps,
    `"${r.algorithm}"`,
    `"${r.sourceNode.label} (${r.sourceNode.ip})"`,
    `"${r.targetNode.label} (${r.targetNode.ip})"`,
    r.files.length,
    `"${r.checksumHash || 'N/A'}"`,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    `network_traffic_history_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/**
 * Trigger download of transferred/restored file (supports DataURL, Text, and Verified Binary Payload)
 */
export const triggerDownloadFile = (file: IngestedFile): void => {
  const timestamp = file.formattedTimestamp || new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  if (file.dataUrl) {
    const a = document.createElement('a');
    a.href = file.dataUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  const fileBody = file.contentPreview || `================================================================================
RESTORED NETWORK PAYLOAD FILE MANIFEST & STREAM
================================================================================
Filename       : ${file.name}
File ID        : ${file.id}
Payload Size   : ${file.sizeMB} MB (${Math.round(file.sizeMB * 1024 * 1024).toLocaleString()} bytes)
Type           : ${file.type.toUpperCase()}
Origin User    : ${file.user}
Transmitted At : ${timestamp}
Restored At    : ${new Date().toISOString()}
Transfer Status: COMPLETED / 0% PACKET LOSS
Decryption Key : Kyber-768 Quantum Safe Verified
Checksum SHA3  : ${file.checksumHash || 'SHA3-512:verified-ok'}
================================================================================
[Decoded Raw Stream Bytes]
${Array.from({ length: 16 }, (_, i) => `0x${(i * 16).toString(16).padStart(4, '0')} : ${Array.from({ length: 8 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(' ')}`).join('\n')}
================================================================================
`;

  const blob = new Blob([fileBody], { type: file.mimeType || 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name.includes('.') ? file.name : `${file.name}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
