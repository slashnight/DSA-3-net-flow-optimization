import {
  CandidateRoute,
  CompletedTransferRouteInfo,
  NetworkNode,
  NetworkPath,
  NodeRouteHop,
  TransmissionMode,
  UserSource,
} from '../types';

export function calculateCompletedRoutes(
  nodes: NetworkNode[],
  paths: NetworkPath[],
  mode: TransmissionMode,
  userSource: UserSource,
  payloadMB: number,
  selectedPathId?: string
): CompletedTransferRouteInfo {
  const isSending = mode === 'send';
  const effectiveMB = Math.max(1, payloadMB);

  // Identify User Hop
  const userMap: Record<string, { label: string; ip: string; ping: number }> = {
    u1: { label: 'User Client U1', ip: '192.168.1.104', ping: 1.2 },
    u2: { label: 'User Client U2', ip: '10.0.4.18', ping: 1.8 },
    u3: { label: 'User Client U3', ip: '172.16.0.42', ping: 2.1 },
    all: { label: 'Multi-User Aggregator (U1+U2+U3)', ip: '10.0.0.1/24', ping: 1.5 },
  };
  const activeUser = userMap[userSource] || userMap['all'];

  const userHop: NodeRouteHop = {
    nodeId: `node-${userSource === 'all' ? 'u1' : userSource}`,
    nodeLabel: activeUser.label,
    ip: activeUser.ip,
    role: 'user',
    dataCenter: 'Local Ingest Terminal',
    country: 'Edge Client',
    pingMs: activeUser.ping,
    linkSpeedMbps: 1000,
  };

  const sourceGatewayHop: NodeRouteHop = {
    nodeId: 'node-s',
    nodeLabel: 'Source Node (S)',
    ip: '10.200.0.1',
    role: 'source',
    dataCenter: 'US-EAST-01 (Virginia Core)',
    country: 'United States',
    pingMs: 4.5,
    linkSpeedMbps: 2500,
  };

  const targetGatewayHop: NodeRouteHop = {
    nodeId: 'node-t',
    nodeLabel: 'Target Destination Node (T)',
    ip: '10.200.99.99',
    role: 'target',
    dataCenter: 'EU-WEST-02 (Frankfurt Hub)',
    country: 'Germany',
    pingMs: 18.2,
    linkSpeedMbps: 2500,
  };

  // Intermediate node definitions
  const nodeA: NodeRouteHop = {
    nodeId: 'node-a',
    nodeLabel: 'Transit Node A',
    ip: '10.200.1.2',
    role: 'intermediate',
    dataCenter: 'US-CENTRAL Cloud Gateway',
    country: 'United States',
    pingMs: 3.2,
    linkSpeedMbps: 1200,
  };
  const nodeC: NodeRouteHop = {
    nodeId: 'node-c',
    nodeLabel: 'Transit Node C',
    ip: '10.200.3.1',
    role: 'intermediate',
    dataCenter: 'EU-NORTH Transit Spine',
    country: 'Sweden',
    pingMs: 5.1,
    linkSpeedMbps: 1200,
  };
  const nodeB: NodeRouteHop = {
    nodeId: 'node-b',
    nodeLabel: 'Transit Node B',
    ip: '10.200.1.3',
    role: 'intermediate',
    dataCenter: 'SA-EAST São Paulo Gateway',
    country: 'Brazil',
    pingMs: 9.8,
    linkSpeedMbps: 1000,
  };
  const nodeD: NodeRouteHop = {
    nodeId: 'node-d',
    nodeLabel: 'Transit Node D',
    ip: '10.200.3.2',
    role: 'intermediate',
    dataCenter: 'ME-WEST Dubai Exchange',
    country: 'UAE',
    pingMs: 12.4,
    linkSpeedMbps: 800,
  };
  const nodeE: NodeRouteHop = {
    nodeId: 'node-e',
    nodeLabel: 'Transit Node E (Quantum Mesh Core)',
    ip: '10.200.2.1',
    role: 'intermediate',
    dataCenter: 'US-WEST Silicon Valley Core',
    country: 'United States',
    pingMs: 4.8,
    linkSpeedMbps: 900,
  };
  const nodeF: NodeRouteHop = {
    nodeId: 'node-f',
    nodeLabel: 'Transit Node F (High-Density Fiber)',
    ip: '10.200.2.2',
    role: 'intermediate',
    dataCenter: 'UK-SOUTH London Equinix',
    country: 'United Kingdom',
    pingMs: 6.2,
    linkSpeedMbps: 800,
  };
  const nodeG: NodeRouteHop = {
    nodeId: 'node-g',
    nodeLabel: 'Transit Node G (Pacific Trunk)',
    ip: '10.200.2.3',
    role: 'intermediate',
    dataCenter: 'JP-EAST Tokyo Metro Hub',
    country: 'Japan',
    pingMs: 14.6,
    linkSpeedMbps: 900,
  };

  // Check if any specific paths are dropped in current topology
  const isPathDropped = (from: string, to: string) => {
    const p = paths.find(
      (path) => (path.from === from && path.to === to) || (path.from === to && path.to === from)
    );
    return p ? p.isDropped || p.status === 'DROPPED' : false;
  };

  // Define candidate routes
  // Route 1: Route Alpha (North High-Speed Trunk S -> A -> C -> T)
  const routeAlphaDropped = isPathDropped('node-s', 'node-a') || isPathDropped('node-a', 'node-c') || isPathDropped('node-c', 'node-t');
  const routeAlphaHops = isSending
    ? [userHop, sourceGatewayHop, nodeA, nodeC, targetGatewayHop]
    : [targetGatewayHop, nodeC, nodeA, sourceGatewayHop, userHop];

  const routeAlphaLatency = 8.4;
  const routeAlphaCap = routeAlphaDropped ? 0 : 1000; // Mbps
  const routeAlphaTime = routeAlphaDropped ? 999 : Number(((effectiveMB * 8) / (routeAlphaCap * 0.85)).toFixed(2));

  // Route 2: Route Beta (Internal Mesh S -> E -> F -> T)
  const routeBetaDropped = isPathDropped('node-s', 'node-e') || isPathDropped('node-e', 'node-f') || isPathDropped('node-f', 'node-t');
  const routeBetaHops = isSending
    ? [userHop, sourceGatewayHop, nodeE, nodeF, targetGatewayHop]
    : [targetGatewayHop, nodeF, nodeE, sourceGatewayHop, userHop];
  const routeBetaLatency = 12.8;
  const routeBetaCap = routeBetaDropped ? 0 : 800;
  const routeBetaTime = routeBetaDropped ? 999 : Number(((effectiveMB * 8) / (routeBetaCap * 0.85)).toFixed(2));

  // Route 3: Route Gamma (Cross-Pacific Trunk S -> E -> G -> T)
  const routeGammaDropped = isPathDropped('node-s', 'node-e') || isPathDropped('node-e', 'node-g') || isPathDropped('node-g', 'node-t');
  const routeGammaHops = isSending
    ? [userHop, sourceGatewayHop, nodeE, nodeG, targetGatewayHop]
    : [targetGatewayHop, nodeG, nodeE, sourceGatewayHop, userHop];
  const routeGammaLatency = 16.5;
  const routeGammaCap = routeGammaDropped ? 0 : 750;
  const routeGammaTime = routeGammaDropped ? 999 : Number(((effectiveMB * 8) / (routeGammaCap * 0.85)).toFixed(2));

  // Route 4: Route Delta (South Gateway S -> B -> D -> T)
  const routeDeltaDropped = isPathDropped('node-s', 'node-b') || isPathDropped('node-b', 'node-d') || isPathDropped('node-d', 'node-t');
  const routeDeltaHops = isSending
    ? [userHop, sourceGatewayHop, nodeB, nodeD, targetGatewayHop]
    : [targetGatewayHop, nodeD, nodeB, sourceGatewayHop, userHop];
  const routeDeltaLatency = 24.2;
  const routeDeltaCap = routeDeltaDropped ? 0 : 600;
  const routeDeltaTime = routeDeltaDropped ? 999 : Number(((effectiveMB * 8) / (routeDeltaCap * 0.85)).toFixed(2));

  const candidateRoutes: CandidateRoute[] = [
    {
      id: 'route-alpha',
      name: 'Route Alpha (Direct North Highway)',
      hops: routeAlphaHops,
      totalLatencyMs: routeAlphaLatency,
      bottleneckCapacityMbps: routeAlphaCap,
      estimatedTransitTimeSec: routeAlphaTime,
      reliabilityPercent: routeAlphaDropped ? 0 : 99.98,
      isFastest: false,
      score: routeAlphaDropped ? 0 : 98,
      description: isSending
        ? 'Direct tier-1 backbone through Transit Node A and C. Optimal lowest ping for bulk transfer.'
        : 'Direct return channel from Target Frankfurt Hub back through Node C and Node A to Source.',
      tags: ['Quantum-Safe', 'Highest Throughput', 'Lowest Latency', 'Recommended'],
    },
    {
      id: 'route-beta',
      name: 'Route Beta (Quantum Mesh Core)',
      hops: routeBetaHops,
      totalLatencyMs: routeBetaLatency,
      bottleneckCapacityMbps: routeBetaCap,
      estimatedTransitTimeSec: routeBetaTime,
      reliabilityPercent: routeBetaDropped ? 0 : 99.85,
      isFastest: false,
      score: routeBetaDropped ? 0 : 86,
      description: 'Routed through secure internal nodes E and F with automated multi-layer packet redundancy.',
      tags: ['Encrypted Mesh', 'Balanced Load', 'Secondary Alternate'],
    },
    {
      id: 'route-gamma',
      name: 'Route Gamma (Pacific Trunk Bridge)',
      hops: routeGammaHops,
      totalLatencyMs: routeGammaLatency,
      bottleneckCapacityMbps: routeGammaCap,
      estimatedTransitTimeSec: routeGammaTime,
      reliabilityPercent: routeGammaDropped ? 0 : 99.40,
      isFastest: false,
      score: routeGammaDropped ? 0 : 78,
      description: 'High-bandwidth transatlantic bridge via Tokyo Node G trunk. Ideal for multi-path failover.',
      tags: ['Multi-Hop Trunk', 'High Capacity', 'Failover Path'],
    },
    {
      id: 'route-delta',
      name: 'Route Delta (South Gateway Route)',
      hops: routeDeltaHops,
      totalLatencyMs: routeDeltaLatency,
      bottleneckCapacityMbps: routeDeltaCap,
      estimatedTransitTimeSec: routeDeltaTime,
      reliabilityPercent: routeDeltaDropped ? 0 : 97.50,
      isFastest: false,
      score: routeDeltaDropped ? 0 : 64,
      description: 'Secondary transit route passing through South America Node B and Middle East Node D.',
      tags: ['Regional Transit', 'High Latency', 'Contingency Backup'],
    },
  ];

  // Determine fastest route (valid lowest transit time, highest bottleneck)
  const validRoutes = candidateRoutes.filter((r) => r.bottleneckCapacityMbps > 0);
  let fastest = validRoutes.length > 0 ? validRoutes[0] : candidateRoutes[0];

  for (const r of validRoutes) {
    if (r.estimatedTransitTimeSec < fastest.estimatedTransitTimeSec) {
      fastest = r;
    }
  }

  // Mark isFastest flag
  candidateRoutes.forEach((r) => {
    r.isFastest = r.id === fastest.id;
  });

  // Calculate average transit time across valid routes
  const avgTime = validRoutes.length > 0
    ? validRoutes.reduce((acc, r) => acc + r.estimatedTransitTimeSec, 0) / validRoutes.length
    : fastest.estimatedTransitTimeSec;
  const timeSaved = Math.max(0, Number((avgTime - fastest.estimatedTransitTimeSec).toFixed(2)));

  // Selected route: by default fastest, or specific if matched
  let activeSelectedRoute = fastest;
  if (selectedPathId === 'path-bd' || selectedPathId === 'path-sb') {
    activeSelectedRoute = candidateRoutes.find((r) => r.id === 'route-delta') || fastest;
  } else if (selectedPathId === 'path-se' || selectedPathId === 'path-ef') {
    activeSelectedRoute = candidateRoutes.find((r) => r.id === 'route-beta') || fastest;
  }

  const speedRating =
    fastest.totalLatencyMs < 10
      ? 'Ultra-Fast (Tier-1 Direct Backbone ⭐)'
      : fastest.totalLatencyMs < 15
      ? 'High Efficiency (Quantum Mesh)'
      : 'Standard Transit';

  const fromHop = isSending ? userHop : targetGatewayHop;
  const toHop = isSending ? targetGatewayHop : userHop;

  return {
    sourceNode: fromHop,
    targetNode: toHop,
    selectedRoute: activeSelectedRoute,
    allCandidateRoutes: candidateRoutes,
    fastestRoute: fastest,
    timeSavedVsAverageSec: timeSaved,
    speedEfficiencyRating: speedRating,
    completedAt: new Date().toLocaleTimeString(),
    totalTransferredMB: payloadMB,
    mode,
    userSource,
  };
}
