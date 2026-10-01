# Live Network Traffic & Secure Transmission Control

A full-stack network simulation and traffic optimization platform. It features an interactive React + TypeScript frontend for real-time 2D/3D topology visualization, secure file transmission pipelines, route calculation, and historical transfer logs, paired with a high-performance Java 25 backend implementing standard max-flow network optimization algorithms (Ford-Fulkerson, Edmonds-Karp, and Dinic's algorithm) with automated Max-Flow Min-Cut verification.

---

## 🏛️ System Architecture

```
+---------------------------------------------------------------------------------------+
|                                    USER BROWSER                                       |
|                                                                                       |
|  +---------------------+   +-----------------------+   +---------------------------+  |
|  |  Navigation / Tabs  |   | Ingest & Transmit UI  |   | 2D / 3D Canvas Viewports  |  |
|  | (Topology/Analysis/ |   | (File Drop, Encr Mode,|   | (Canvas2D & Three.js 3D   |  |
|  | Algorithms/History) |   | User Source, Send/Rec)|   | Interactive Globe Engine) |  |
|  +----------+----------+   +-----------+-----------+   +-------------+-------------+  |
|             |                          |                             |                |
|             +--------------------------+-----------------------------+                |
|                                        |                                              |
|                         [src/App.tsx] Root Orchestrator                               |
|                         (Central State Tree & Telemetry)                              |
|                                        |                                              |
|            +---------------------------+---------------------------+                  |
|            |                           |                           |                  |
|  +---------v----------+      +---------v----------+      +---------v----------+       |
|  | routeCalculator.ts |      |  historyStorage.ts |      |   flowEngine.ts    |       |
|  | (Candidate Routes, |      | (LocalStorage Sync,|      | (Client-side TS    |       |
|  | Latency, Bottleneck|      |  Restore Sessions, |      |  Dinic Max-Flow    |       |
|  | Scoring, Telemetry)|      |  Audit Snapshots)  |      |  Fallback Engine)  |       |
|  +--------------------+      +--------------------+      +---------+----------+       |
|                                                                    |                  |
+--------------------------------------------------------------------|------------------+
                                                                     |
                                      HTTP JSON REST API             | Fallback when
                                      (Port 8080)                    | Backend Offline
                                                                     |
+--------------------------------------------------------------------v------------------+
|                              JAVA 25 BACKEND SERVER                                   |
|                                                                                       |
|  [NetworkFlowServer.java] (Sun HttpServer, CORS enabled)                              |
|  ├── POST /api/flow/compute    -> Computes max flow, min-cut, and edge saturation     |
|  ├── POST /api/flow/compare    -> Runs Dinic vs Edmonds-Karp vs Ford-Fulkerson        |
|  ├── GET  /api/flow/stages     -> Returns phase-by-phase Dinic level graph execution  |
|  ├── GET  /api/flow/topology   -> Provides sample backbone and mesh topologies        |
|  └── GET  /api/health          -> Server status and uptime verification               |
|                                                                                       |
|  [Algorithm Engine & Model Core]                                                      |
|  ├── FlowNetwork.java          -> Residual graph with forward/backward residual edges |
|  ├── DinicsAlgorithm.java      -> O(V^2 * E) Level Graph BFS + Blocking Flow DFS      |
|  ├── EdmondsKarp.java          -> O(V * E^2) BFS Shortest Augmenting Path             |
|  ├── FordFulkerson.java        -> O(E * MaxFlow) DFS Augmenting Path                  |
|  ├── MinCutSolver.java         -> S-T Graph Cut & Saturated Bottleneck Detection      |
|  └── PerformanceComparator.java-> Microsecond Benchmarking Suite                      |
+---------------------------------------------------------------------------------------+
```

---

## 💻 Tech Stack & Languages

| Domain | Technologies & Libraries | Language |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite 6, HTML5, Vanilla CSS / TailwindCSS | `TypeScript`, `TSX`, `CSS` |
| **Visualizations** | Three.js (3D Globe), HTML5 Canvas (2D Topology Network) | `TypeScript`, `JavaScript` |
| **Icons & Animation** | Lucide React, Canvas Confetti, Motion | `TypeScript`, `TSX` |
| **Client Flow Engine** | Custom Graph & Dinic's Algorithm implementation for offline fallback | `TypeScript` |
| **Backend Server** | Built-in Java HTTP Server (`com.sun.net.httpserver`) | `Java 25` |
| **Backend Algorithms** | Graph Models, Dinic's Algorithm, Edmonds-Karp, Ford-Fulkerson, Min-Cut | `Java 25` |

---

## 📁 Repository Structure & File Breakdown

### Root Configuration
* [`package.json`](package.json) — NPM project configuration, scripts for dev server, production build, and Java backend compilation / test tasks.
* [`vite.config.ts`](vite.config.ts) — Vite bundler configuration including React plugins and port settings.
* [`tsconfig.json`](tsconfig.json) — Strict TypeScript compilation rules.
* [`index.html`](index.html) — HTML5 entry template mounting the React root.
* [`workflow.md`](workflow.md) — Comprehensive technical architecture, lifecycle explanation, and system design document.

### Frontend (`src/`)
* [`src/main.tsx`](src/main.tsx) — Entry point rendering `<App />` into the DOM.
* [`src/App.tsx`](src/App.tsx) — Central orchestrator managing state, live telemetry loops, file ingestion, transmission simulations, modals, and tabs.
* [`src/types.ts`](src/types.ts) — TypeScript interfaces for datacenter hubs, graph nodes, paths, transmission metrics, history records, and algorithm outputs.
* [`src/mockData.ts`](src/mockData.ts) — Seed topologies, datacenter hubs, default nodes, edges, and sample test files.
* [`src/index.css`](src/index.css) — Global styles, cybernetic theme definitions, scrollbar styles, and glassmorphism styling.

#### Frontend Utilities (`src/utils/`)
* [`src/utils/flowEngine.ts`](src/utils/flowEngine.ts) — Client-side TypeScript implementation of Dinic's Algorithm, level graphs, and residual flow networks used for offline fallback.
* [`src/utils/routeCalculator.ts`](src/utils/routeCalculator.ts) — Generates candidate transmission routes (Alpha, Beta, Gamma, Delta), latency scoring, bottleneck capacities, and transmission time estimates.
* [`src/utils/historyStorage.ts`](src/utils/historyStorage.ts) — Handles LocalStorage persistence, seed history initialization, audit logs, and session rehydration.

#### Frontend Core Panels & Views (`src/components/`)
* [`src/components/Navbar.tsx`](src/components/Navbar.tsx) — Header bar with screen switching (Topology, Analysis, Algorithms, History), quick stats, and global actions.
* [`src/components/LeftPanel.tsx`](src/components/LeftPanel.tsx) — File ingestion dropzone, encryption mode selector, transmission mode toggle (Send/Receive), and transfer triggers.
* [`src/components/CenterView.tsx`](src/components/CenterView.tsx) — Primary viewport shell hosting 2D canvas, 3D Three.js globe, and screen switchers.
* [`src/components/RightPanel.tsx`](src/components/RightPanel.tsx) — Live telemetry dashboard, throughput metrics, bottleneck monitors, node stats, and active paths.
* [`src/components/Topology2DView.tsx`](src/components/Topology2DView.tsx) — 2D canvas network graph displaying animated traffic packets, capacity lines, and node statuses.
* [`src/components/Globe3DView.tsx`](src/components/Globe3DView.tsx) — 3D Three.js globe displaying global datacenter locations, arcs, and traffic flows.
* [`src/components/Footer.tsx`](src/components/Footer.tsx) — Bottom status bar displaying system connection, encryption status, and packet counter.
* [`src/components/ToastContainer.tsx`](src/components/ToastContainer.tsx) — Notification system for transfer statuses, route drops, and alerts.

#### Screen Views (`src/components/views/`)
* [`src/components/views/TopologyScreen.tsx`](src/components/views/TopologyScreen.tsx) — Full topology view with 2D/3D controls and path inspection.
* [`src/components/views/AnalysisScreen.tsx`](src/components/views/AnalysisScreen.tsx) — Deep-dive analytics on congestion ratios, link variance, and packet loss.
* [`src/components/views/AlgorithmsScreen.tsx`](src/components/views/AlgorithmsScreen.tsx) — Interactive max-flow algorithm benchmarking workbench connecting to Java backend or TS fallback.
* [`src/components/views/HistorySpaceScreen.tsx`](src/components/views/HistorySpaceScreen.tsx) — Historical transfer log viewer with filters, search, snapshot restore, and file download triggers.

#### Modals (`src/components/modals/`)
* [`src/components/modals/TransmissionDetailsModal.tsx`](src/components/modals/TransmissionDetailsModal.tsx) — Detailed breakdown of active or completed file transfers.
* [`src/components/modals/RouteAnalysisModal.tsx`](src/components/modals/RouteAnalysisModal.tsx) — In-depth route evaluation dialog with multi-path scoring and hop breakdowns.
* [`src/components/modals/HistoryDetailModal.tsx`](src/components/modals/HistoryDetailModal.tsx) — Historical record inspector.
* [`src/components/modals/FilePreviewModal.tsx`](src/components/modals/FilePreviewModal.tsx) — In-browser file previewer supporting text, images, video, and raw payloads.
* [`src/components/modals/SettingsModal.tsx`](src/components/modals/SettingsModal.tsx) — Telemetry refresh rates, visualization density, and audio toggles.
* [`src/components/modals/DeployConfigModal.tsx`](src/components/modals/DeployConfigModal.tsx) — Exportable datacenter network configurations.
* [`src/components/modals/NotificationsDrawer.tsx`](src/components/modals/NotificationsDrawer.tsx) — Slide-over activity and audit notification center.
* [`src/components/modals/TransferErrorModal.tsx`](src/components/modals/TransferErrorModal.tsx) — Error analysis modal with suggested remediation steps.
* [`src/components/modals/InfoModals.tsx`](src/components/modals/InfoModals.tsx) — Algorithm and architecture quick guides.

### Java Backend (`backend/`)
* [`backend/src/com/datacenter/flow/server/NetworkFlowServer.java`](backend/src/com/datacenter/flow/server/NetworkFlowServer.java) — Built-in HTTP server listening on `http://localhost:8080` exposing REST endpoints for flow calculations.
* [`backend/src/com/datacenter/flow/model/FlowEdge.java`](backend/src/com/datacenter/flow/model/FlowEdge.java) — Directed edge representation tracking capacity, flow, residual capacities, and back-edges.
* [`backend/src/com/datacenter/flow/model/FlowNetwork.java`](backend/src/com/datacenter/flow/model/FlowNetwork.java) — Adjacency-list network representation with residual graph mutation support.
* [`backend/src/com/datacenter/flow/model/AlgorithmResult.java`](backend/src/com/datacenter/flow/model/AlgorithmResult.java) — Encapsulates max flow, execution time, cut partitions, min-cut edges, and execution phase data.
* [`backend/src/com/datacenter/flow/algorithm/DinicsAlgorithm.java`](backend/src/com/datacenter/flow/algorithm/DinicsAlgorithm.java) — $O(V^2 E)$ Level Graph BFS + Blocking Flow DFS with stage tracking.
* [`backend/src/com/datacenter/flow/algorithm/EdmondsKarp.java`](backend/src/com/datacenter/flow/algorithm/EdmondsKarp.java) — $O(V E^2)$ BFS Shortest Augmenting Path implementation.
* [`backend/src/com/datacenter/flow/algorithm/FordFulkerson.java`](backend/src/com/datacenter/flow/algorithm/FordFulkerson.java) — $O(E \cdot \text{MaxFlow})$ DFS Augmenting Path implementation.
* [`backend/src/com/datacenter/flow/algorithm/MinCutSolver.java`](backend/src/com/datacenter/flow/algorithm/MinCutSolver.java) — BFS Reachability partition finder ($S, T$) and cut capacity validator.
* [`backend/src/com/datacenter/flow/algorithm/PerformanceComparator.java`](backend/src/com/datacenter/flow/algorithm/PerformanceComparator.java) — Microsecond comparative benchmarking suite.
* [`backend/src/com/datacenter/flow/test/NetworkFlowTestSuite.java`](backend/src/com/datacenter/flow/test/NetworkFlowTestSuite.java) — Comprehensive 33-test automated validation suite verifying constraints, algorithms, and theorems.

---

## 🛠️ Step-by-Step Terminal Testing Guide

### Prerequisites
* **Node.js** (v18+ recommended)
* **Java Development Kit (JDK 21+)** (e.g. Java 25)

---

### Step 1: Install Frontend Dependencies
Run this in the repository root to install all node modules:
```bash
npm install
```

---

### Step 2: Validate Frontend Code & Type Safety
To verify that all TypeScript types, React components, and imports are valid with zero errors:
```bash
# Run TypeScript type check
npx tsc --noEmit
```

To run a full production bundle build:
```bash
# Build the production bundle
npm run build
```

---

### Step 3: Compile and Test the Java Backend Suite
Compile all Java backend classes into `backend/bin`:
```bash
# Compile all backend models, algorithms, and tests
npm run backend:compile
```

Execute the comprehensive 33-assertion backend test suite:
```bash
# Run all unit tests and algorithmic benchmarks
npm run backend:test
```
*(All 33 tests should report `[PASS]` covering capacity constraints, residual graphs, Dinic, Edmonds-Karp, Ford-Fulkerson, Min-Cut verification, and performance benchmarks.)*

---

### Step 4: Run the Complete System Locally

#### Terminal 1 — Start the Java Backend Server (Optional but Recommended for Live Computation):
```bash
npm run backend:server
```
*The server will start on `http://localhost:8080` with endpoints ready for real-time flow computation.*

#### Terminal 2 — Start the React Frontend Dev Server:
```bash
npm run dev
```
*Open your browser and navigate to `http://localhost:3000` to interact with the platform.*

---

## 🧪 Testing Features in the Browser
1. **Send / Receive Simulation**: Drop files in the left panel, choose encryption mode (Quantum-Resistant / AES-256-GCM), select user endpoint, and click **"INITIATE SECURE TRANSMISSION"**.
2. **Path Degradation / Failover**: Click on any network path in the 2D view or click "Drop Link" to see real-time route rerouting and bottleneck recalculation.
3. **Algorithm Benchmark**: Navigate to the **"Algorithms"** tab and run Dinic's Algorithm vs Edmonds-Karp to see the live speedup comparison against the Java backend.
4. **History & State Replay**: Navigate to the **"History"** tab to inspect previous transmissions and click **"Restore State"** to rehydrate past payloads, routes, and network topologies.
