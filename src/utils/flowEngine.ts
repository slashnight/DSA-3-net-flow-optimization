/**
 * High-Performance Network Flow Optimization Engine in TypeScript.
 * 
 * Optimized for Data Center Traffic Routing & CDN Multi-Path Ingestion.
 * Uses TypedArrays (Int32Array, Float64Array) for cache-friendly, zero-GC execution.
 */

export interface FlowEdgeInfo {
  u: number;
  v: number;
  capacity: number;
  flow: number;
  isResidual: boolean;
  isBottleneck: boolean;
}

export interface MinCutResult {
  maxThroughputMbps: number;
  latencyMicroseconds: number;
  levels: number[];
  cutEdges: Array<{ u: number; v: number; capacity: number; utilizationPercent: number }>;
  partitionS: number[];
  partitionT: number[];
  iterations: number;
}

export class DataCenterFlowEngineTS {
  private maxNodes: number;
  private maxEdges: number;
  private edgeCount: number = 0;

  // Forward-Star Typed Arrays (Zero-GC Flat Buffers)
  public head: Int32Array;
  public to: Int32Array;
  public next: Int32Array;
  public cap: Float64Array;
  public flow: Float64Array;

  // Level Graph and Admissible Pointer Tracking
  public level: Int32Array;
  public ptr: Int32Array;

  // Circular Queue for BFS
  private queue: Int32Array;
  private qHead: number = 0;
  private qTail: number = 0;
  private qSize: number = 0;

  constructor(maxNodes: number, maxEdges: number) {
    this.maxNodes = maxNodes;
    this.maxEdges = maxEdges * 2; // Forward + Residual

    this.head = new Int32Array(this.maxNodes).fill(-1);
    this.to = new Int32Array(this.maxEdges);
    this.next = new Int32Array(this.maxEdges);
    this.cap = new Float64Array(this.maxEdges);
    this.flow = new Float64Array(this.maxEdges);
    this.level = new Int32Array(this.maxNodes);
    this.ptr = new Int32Array(this.maxNodes);
    this.queue = new Int32Array(this.maxNodes);
  }

  public reset(): void {
    this.head.fill(-1);
    this.edgeCount = 0;
  }

  /**
   * Adds a directed fiber transmission link with bandwidth capacity in Mbps.
   * Forward edge is at even index (2k), reverse residual edge at (2k + 1).
   */
  public addFiberLink(u: number, v: number, capacity: number): void {
    // Forward edge (2k)
    this.to[this.edgeCount] = v;
    this.cap[this.edgeCount] = capacity;
    this.flow[this.edgeCount] = 0;
    this.next[this.edgeCount] = this.head[u];
    this.head[u] = this.edgeCount++;

    // Backward residual edge (2k + 1)
    this.to[this.edgeCount] = u;
    this.cap[this.edgeCount] = 0;
    this.flow[this.edgeCount] = 0;
    this.next[this.edgeCount] = this.head[v];
    this.head[v] = this.edgeCount++;
  }

  /**
   * Phase 1: Breadth-First Search to construct Level Graph (L_0, L_1, ... L_k).
   */
  public constructLevelGraph(s: number, t: number): boolean {
    this.level.fill(-1);
    this.level[s] = 0;

    // Queue reset
    this.qHead = 0;
    this.qTail = 0;
    this.qSize = 0;

    // Enqueue source
    this.queue[this.qTail++] = s;
    this.qSize++;

    while (this.qSize > 0) {
      const u = this.queue[this.qHead++];
      this.qSize--;

      for (let e = this.head[u]; e !== -1; e = this.next[e]) {
        const v = this.to[e];
        const residual = this.cap[e] - this.flow[e];

        if (residual > 0 && this.level[v] === -1) {
          this.level[v] = this.level[u] + 1;
          this.queue[this.qTail++] = v;
          this.qSize++;
        }
      }
    }

    return this.level[t] !== -1;
  }

  /**
   * Phase 2: Depth-First Search pushing batch Blocking Flows along admissible edges.
   */
  public pushBlockingFlow(u: number, t: number, pushed: number): number {
    if (pushed === 0 || u === t) return pushed;

    for (let e = this.ptr[u]; e !== -1; e = this.next[e]) {
      this.ptr[u] = e; // Advance current-edge pointer to avoid re-evaluating exhausted edges
      const v = this.to[e];
      const residual = this.cap[e] - this.flow[e];

      // Traverse only admissible edges: level[v] === level[u] + 1
      if (this.level[v] === this.level[u] + 1 && residual > 0) {
        const tr = this.pushBlockingFlow(v, t, Math.min(pushed, residual));
        if (tr > 0) {
          this.flow[e] += tr;
          this.flow[e ^ 1] -= tr; // O(1) Bitwise XOR reverse edge update
          return tr;
        }
      }
    }

    return 0;
  }

  /**
   * Executes the full Dinic's Algorithm with performance telemetry.
   */
  public computeMaxFlow(source: number, sink: number): MinCutResult {
    const startTime = performance.now();
    let maxThroughput = 0;
    let iterations = 0;

    // Step-by-step Level Graph Augmentation
    while (this.constructLevelGraph(source, sink)) {
      iterations++;
      // Reset ptr[] to head[] for admissible edge traversal
      for (let i = 0; i < this.maxNodes; i++) {
        this.ptr[i] = this.head[i];
      }

      while (true) {
        const pushed = this.pushBlockingFlow(source, sink, Number.MAX_SAFE_INTEGER);
        if (pushed <= 0) break;
        maxThroughput += pushed;
      }
    }

    const elapsedMicroseconds = (performance.now() - startTime) * 1000;

    // Phase 3: Min-Cut Saturated Bottleneck Extraction
    const { cutEdges, partitionS, partitionT } = this.extractMinCut(source);

    return {
      maxThroughputMbps: maxThroughput,
      latencyMicroseconds: Math.round(elapsedMicroseconds * 10) / 10,
      levels: Array.from(this.level),
      cutEdges,
      partitionS,
      partitionT,
      iterations,
    };
  }

  /**
   * Identifies 100% saturated edges spanning the (S, T) minimum cut boundary.
   */
  public extractMinCut(source: number): {
    cutEdges: Array<{ u: number; v: number; capacity: number; utilizationPercent: number }>;
    partitionS: number[];
    partitionT: number[];
  } {
    const visited = new Uint8Array(this.maxNodes);
    const q: number[] = [source];
    visited[source] = 1;

    while (q.length > 0) {
      const u = q.shift()!;
      for (let e = this.head[u]; e !== -1; e = this.next[e]) {
        const v = this.to[e];
        if (this.cap[e] - this.flow[e] > 0 && !visited[v]) {
          visited[v] = 1;
          q.push(v);
        }
      }
    }

    const partitionS: number[] = [];
    const partitionT: number[] = [];
    for (let i = 0; i < this.maxNodes; i++) {
      if (visited[i]) partitionS.push(i);
      else partitionT.push(i);
    }

    const cutEdges: Array<{ u: number; v: number; capacity: number; utilizationPercent: number }> = [];
    for (let u = 0; u < this.maxNodes; u++) {
      if (visited[u]) {
        for (let e = this.head[u]; e !== -1; e = this.next[e]) {
          const v = this.to[e];
          // Only forward original edges crossing into Partition T
          if (e % 2 === 0 && !visited[v] && this.cap[e] > 0) {
            cutEdges.push({
              u,
              v,
              capacity: this.cap[e],
              utilizationPercent: Math.round((this.flow[e] / this.cap[e]) * 1000) / 10,
            });
          }
        }
      }
    }

    return { cutEdges, partitionS, partitionT };
  }
}
