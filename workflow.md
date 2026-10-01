# Complete System Workflow & Architecture Documentation

## 1. High-Level Purpose & Concept

This platform is an interactive, full-stack network simulation and secure traffic optimization dashboard. It models a high-speed datacenter mesh topology and provides:

1. **Visual Control Plane**: Interactive 2D HTML5 Canvas and 3D Three.js Globe topology displays.
2. **Traffic Simulation & Telemetry**: Dynamic link throughputs, capacity variances, bottleneck alerts, packet loss, and jitter computations.
3. **Multi-Algorithm Max-Flow Engine**: High-performance implementations of Ford-Fulkerson, Edmonds-Karp, and Dinic's Algorithm (in Java 25 backend with TypeScript fallback).
4. **Secure Ingest & Transmission Pipeline**: User file loading (drag-and-drop / sample files), cryptographic hashing (SHA-256 / Quantum-Resistant simulation), packetization, and transfer progress lifecycles.
5. **Route Intelligence & Telemetry Scoring**: Automated path selection across multi-hop candidate corridors based on latency, bottleneck capacity, and reliability.
6. **Persistent Session History & Replay**: Comprehensive LocalStorage persistence enabling historical transfer audits, deep inspect modals, and full state restoration.

---

## 2. Comprehensive System Architecture

```
                                  +---------------------------------------+
                                  |            CLIENT BROWSER             |
                                  |         (React 19 + TypeScript)       |
                                  +-------------------+-------------------+
                                                      |
                   +----------------------------------+----------------------------------+
                   |                                  |                                  |
                   v                                  v                                  v
        +--------------------+             +--------------------+             +--------------------+
        |   Frontend State   |             |   Visualizations   |             |   Local Engines    |
        | [src/App.tsx]      |             | 2D Canvas &        |             | routeCalculator.ts |
        | Active Tab, Hubs,  |             | Three.js 3D Globe  |             | historyStorage.ts  |
        | Nodes, Paths, Ingest|            | Real-time Packets  |             | flowEngine.ts (TS) |
        +----------+---------+             +--------------------+             +----------+---------+
                   |                                                                     |
                   |                                                                     | (Fallback if offline)
                   +----------------------------------+----------------------------------+
                                                      |
                                                      | HTTP JSON REST API
                                                      | (Port 8080)
                                                      v
                                  +---------------------------------------+
                                  |            JAVA 25 BACKEND            |
                                  |      [com.datacenter.flow.server]     |
                                  +-------------------+-------------------+
                                                      |
                   +----------------------------------+----------------------------------+
                   |                                  |                                  |
                   v                                  v                                  v
        +--------------------+             +--------------------+             +--------------------+
        |    Server HTTP     |             |  Algorithm Suite   |             |    Model & Graph   |
        | NetworkFlowServer  |             | DinicsAlgorithm    |             | FlowNetwork        |
        | /compute, /compare |             | EdmondsKarp        |             | FlowEdge           |
        | /stages, /topology |             | FordFulkerson      |             | AlgorithmResult    |
        | /health            |             | MinCutSolver       |             | S-T Residual Graph |
        +--------------------+             +--------------------+             +--------------------+
```

---

## 3. Technology Stack & Language Distribution

| Subsystem | Components | Primary Language |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19, Vite 6, TypeScript, HTML5 | `TypeScript` (`.tsx`, `.ts`) |
| **Styling & Theming** | Cyberpunk/Cybernetic Glassmorphism, TailwindCSS v4 / Vanilla CSS | `CSS` |
| **Visual Renderers** | Three.js (WebGL 3D Earth), HTML5 Canvas 2D Graph Engine | `TypeScript`, `JavaScript` |
| **Client Flow Engine** | Dinic's Algorithm level-graph client fallback | `TypeScript` |
| **Backend Framework** | Standard Java SE `com.sun.net.httpserver` (Lightweight, zero-dependency) | `Java 25` |
| **Backend Graph Engine**| Adjacency lists, Residual graphs, BFS level graphs, DFS blocking flows | `Java 25` |
| **Test Framework** | Standalone high-precision microsecond test & benchmark harness | `Java 25` |

---

## 4. Detailed File-by-File Breakdown & Roles

### Root Configuration
* [`package.json`](package.json) — Defines dependencies (`react`, `three`, `lucide-react`, `canvas-confetti`, `motion`) and scripts (`dev`, `build`, `lint`, `backend:compile`, `backend:test`, `backend:server`).
* [`vite.config.ts`](vite.config.ts) — Configures Vite build settings, plugins, and development server options.
* [`tsconfig.json`](tsconfig.json) — TypeScript compiler configurations enforcing strict typing.
* [`index.html`](index.html) — HTML template bootstrapping the React application.
* [`README.md`](README.md) — Public facing project guide, architecture summary, and terminal commands.

### Frontend Core (`src/`)
* [`src/main.tsx`](src/main.tsx) — Application entry point initializing React DOM root.
* [`src/App.tsx`](src/App.tsx) — Main orchestrator; owns application state, telemetry timers, transmission life cycles, path drop simulations, modal states, and tab routing.
* [`src/types.ts`](src/types.ts) — Central type definitions: `DataCenterHub`, `NetworkNode`, `NetworkPath`, `IngestedFile`, `LiveMetrics`, `CompletedTransferRouteInfo`, `TransferHistoryRecord`.
* [`src/mockData.ts`](src/mockData.ts) — Initial global datacenter hubs, 2D topology nodes, directed routing paths, and default test files.
* [`src/index.css`](src/index.css) — Custom styles for futuristic panels, glow effects, scrollbars, and terminal accents.

### Frontend Utilities (`src/utils/`)
* [`src/utils/flowEngine.ts`](src/utils/flowEngine.ts) — In-browser Dinic's algorithm implementation with residual graphs and level-graph BFS/DFS, ensuring flow computation functions even if the backend is offline.
* [`src/utils/routeCalculator.ts`](src/utils/routeCalculator.ts) — Multi-path evaluation engine creating candidate routes (Alpha, Beta, Gamma, Delta), scoring latency, computing bottlenecks, and predicting transfer durations.
* [`src/utils/historyStorage.ts`](src/utils/historyStorage.ts) — Manages browser `localStorage` synchronization, initial seed records, snapshot serialization, and restore mechanisms.

### UI Components (`src/components/`)
* [`src/components/Navbar.tsx`](src/components/Navbar.tsx) — Navigation bar providing screen switching (Topology, Analysis, Algorithms, History), quick stats, and config access.
* [`src/components/LeftPanel.tsx`](src/components/LeftPanel.tsx) — File ingestion dropzone, encryption mode toggle (Quantum-Safe / AES-256), mode switcher (Send / Receive), and transfer execution button.
* [`src/components/CenterView.tsx`](src/components/CenterView.tsx) — Central canvas shell toggling between 2D topology network and 3D Three.js interactive globe.
* [`src/components/RightPanel.tsx`](src/components/RightPanel.tsx) — Live telemetry panel displaying real-time throughput, system utilization, packet loss, active path statuses, and bottleneck warnings.
* [`src/components/Topology2DView.tsx`](src/components/Topology2DView.tsx) — High-performance 2D Canvas rendering animated packet particles along active paths, node statuses, and bottleneck highlights.
* [`src/components/Globe3DView.tsx`](src/components/Globe3DView.tsx) — Interactive Three.js 3D earth visualizing international datacenter nodes and bezier arc connections.
* [`src/components/Footer.tsx`](src/components/Footer.tsx) — Bottom status bar displaying live link stability, security state, and packet counters.
* [`src/components/ToastContainer.tsx`](src/components/ToastContainer.tsx) — Toast notification container for system events, alerts, and completed transfers.

### Screen Views (`src/components/views/`)
* [`src/components/views/TopologyScreen.tsx`](src/components/views/TopologyScreen.tsx) — Dedicated topology inspection workbench with node filters and path drop controls.
* [`src/components/views/AnalysisScreen.tsx`](src/components/views/AnalysisScreen.tsx) — Congestion and network health analytics screen.
* [`src/components/views/AlgorithmsScreen.tsx`](src/components/views/AlgorithmsScreen.tsx) — Interactive algorithm workbench comparing Dinic's, Edmonds-Karp, and Ford-Fulkerson with step-by-step visualizer.
* [`src/components/views/HistorySpaceScreen.tsx`](src/components/views/HistorySpaceScreen.tsx) — Comprehensive transfer log interface with search, filters, audit download, and state rehydration/restore.

### Modals (`src/components/modals/`)
* [`src/components/modals/TransmissionDetailsModal.tsx`](src/components/modals/TransmissionDetailsModal.tsx) — Transmission progress and route breakdown modal.
* [`src/components/modals/RouteAnalysisModal.tsx`](src/components/modals/RouteAnalysisModal.tsx) — Multi-path comparative evaluation and hop analysis.
* [`src/components/modals/HistoryDetailModal.tsx`](src/components/modals/HistoryDetailModal.tsx) — Deep inspection of historical transfer records.
* [`src/components/modals/FilePreviewModal.tsx`](src/components/modals/FilePreviewModal.tsx) — Interactive file previewer (images, video, text, raw bytes).
* [`src/components/modals/SettingsModal.tsx`](src/components/modals/SettingsModal.tsx) — Telemetry refresh intervals, visual effects, and simulation speeds.
* [`src/components/modals/DeployConfigModal.tsx`](src/components/modals/DeployConfigModal.tsx) — JSON export of active datacenter and path topology.
* [`src/components/modals/NotificationsDrawer.tsx`](src/components/modals/NotificationsDrawer.tsx) — Slide-out activity drawer.
* [`src/components/modals/TransferErrorModal.tsx`](src/components/modals/TransferErrorModal.tsx) — Error modal handling path severance and transmission aborts.
* [`src/components/modals/InfoModals.tsx`](src/components/modals/InfoModals.tsx) — Informational dialogues explaining algorithms and quantum encryption concepts.

### Java Backend (`backend/`)
* [`backend/src/com/datacenter/flow/server/NetworkFlowServer.java`](backend/src/com/datacenter/flow/server/NetworkFlowServer.java) — Multi-threaded HTTP API server providing `/api/flow/compute`, `/api/flow/compare`, `/api/flow/stages`, `/api/flow/topology`, and `/api/health`.
* [`backend/src/com/datacenter/flow/model/FlowEdge.java`](backend/src/com/datacenter/flow/model/FlowEdge.java) — Edge data structure tracking capacity, current flow, residual forward/backward capacity, and companion back-edge references.
* [`backend/src/com/datacenter/flow/model/FlowNetwork.java`](backend/src/com/datacenter/flow/model/FlowNetwork.java) — Adjacency list representation supporting directed flow additions, residual graph resets, and vertex counts.
* [`backend/src/com/datacenter/flow/model/AlgorithmResult.java`](backend/src/com/datacenter/flow/model/AlgorithmResult.java) — Output model encapsulating max flow, run time in microseconds, cut partitions (S, T), min-cut edges, and phase stages.
* [`backend/src/com/datacenter/flow/algorithm/DinicsAlgorithm.java`](backend/src/com/datacenter/flow/algorithm/DinicsAlgorithm.java) — Implementation of Dinic's Algorithm using BFS Level Graph construction and DFS Blocking Flow augmentation.
* [`backend/src/com/datacenter/flow/algorithm/EdmondsKarp.java`](backend/src/com/datacenter/flow/algorithm/EdmondsKarp.java) — Implementation of Edmonds-Karp using BFS shortest augmenting paths.
* [`backend/src/com/datacenter/flow/algorithm/FordFulkerson.java`](backend/src/com/datacenter/flow/algorithm/FordFulkerson.java) — Implementation of Ford-Fulkerson using DFS augmenting paths.
* [`backend/src/com/datacenter/flow/algorithm/MinCutSolver.java`](backend/src/com/datacenter/flow/algorithm/MinCutSolver.java) — S-T Cut solver finding saturated cut edges via residual reachability.
* [`backend/src/com/datacenter/flow/algorithm/PerformanceComparator.java`](backend/src/com/datacenter/flow/algorithm/PerformanceComparator.java) — Benchmarks all 3 algorithms on identical graph topologies to compute execution speedups.
* [`backend/src/com/datacenter/flow/test/NetworkFlowTestSuite.java`](backend/src/com/datacenter/flow/test/NetworkFlowTestSuite.java) — 33-test automated test suite validating capacity constraints, conservation of flow, Max-Flow Min-Cut Theorem, and scalability.

---

## 5. End-to-End Operational Workflow

```
[1. User Drops/Selects Files]
            │
            ▼
[2. File Ingestion & Checksum Calculation]
   (FileReader extracts data URLs / previews; SHA-256 hash created)
            │
            ▼
[3. Mode & User Endpoint Selection]
   (Send or Receive mode selected; source endpoint configured)
            │
            ▼
[4. Transmission Initiation]
   (Simulated progress loop starts; transfer metrics update in real-time)
            │
            ▼
[5. Dynamic Telemetry & Degradation Simulation]
   (Periodic jitter updates link throughputs; dropped paths trigger auto-rerouting)
            │
            ▼
[6. Route Telemetry & Max-Flow Computation]
   (Java backend / TS engine computes optimal multi-path throughput and min-cut)
            │
            ▼
[7. Transfer Completion & History Persistence]
   (Progress reaches 100%; record saved to LocalStorage; audit log updated)
            │
            ▼
[8. Auto-Preview / History Replay]
   (Delivered files opened in preview; history screen allows full state rehydration)
```

---

## 6. Self-Testing & Verification via Terminal

### 1. Frontend Type Validation
Verify that all TypeScript code passes strict compiler checks:
```bash
npx tsc --noEmit
```

### 2. Frontend Production Build
Verify that Vite packages the entire bundle without bundling errors:
```bash
npm run build
```

### 3. Backend Compilation
Compile all Java 25 backend classes:
```bash
npm run backend:compile
```

### 4. Backend Algorithmic Test Suite
Run the 33-assertion backend verification suite:
```bash
npm run backend:test
```

### 5. Running the Application
Start the Java backend in one terminal and the frontend in another:
```bash
# Terminal 1:
npm run backend:server

# Terminal 2:
npm run dev
```
Open `http://localhost:3000` in your web browser.
