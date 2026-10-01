package com.datacenter.flow.algorithm;

import com.datacenter.flow.model.AlgorithmResult;
import com.datacenter.flow.model.FlowEdge;
import com.datacenter.flow.model.FlowNetwork;

import java.util.*;

/**
 * Dinic's Algorithm for Maximum Flow Optimization (Core Implementation).
 * 
 * Performance: O(V^2 * E) on general integer graphs, O(E * sqrt(V)) on unit networks.
 * 
 * Stages:
 * 1. Breadth-First Search (BFS): Constructs the Level Graph where level[v] = level[u] + 1.
 * 2. Depth-First Search (DFS): Finds Blocking Flows pushing flow only along admissible edges.
 * 3. Current-edge Pointer (ptr[]): Eliminates dead-end edges in O(1) during DFS.
 * 4. Iteration: Repeats until sink T is unreachable in the level graph.
 */
public class DinicsAlgorithm {

    public static class DinicStage {
        public final int phaseNumber;
        public final int[] levels;
        public final int flowPushedInPhase;
        public final int cumulativeMaxFlow;
        public final String description;

        public DinicStage(int phaseNumber, int[] levels, int flowPushedInPhase, int cumulativeMaxFlow, String description) {
            this.phaseNumber = phaseNumber;
            this.levels = levels != null ? levels.clone() : new int[0];
            this.flowPushedInPhase = flowPushedInPhase;
            this.cumulativeMaxFlow = cumulativeMaxFlow;
            this.description = description;
        }
    }

    private final List<DinicStage> stages = new ArrayList<>();

    public List<DinicStage> getStages() {
        return Collections.unmodifiableList(stages);
    }

    public AlgorithmResult computeMaxFlow(FlowNetwork network, int source, int sink) {
        long startTime = System.nanoTime();
        network.resetAllFlows();
        stages.clear();

        int n = network.getVertexCount();
        int[] level = new int[n];
        int[] ptr = new int[n];

        int maxFlow = 0;
        int phases = 0;
        int totalAugmentations = 0;
        List<String> log = new ArrayList<>();

        log.add(String.format("Starting Dinic's Algorithm on %d vertices (Source=%s, Sink=%s)",
                n, network.getNodeName(source), network.getNodeName(sink)));

        // Repeated Level Graph Generation
        while (constructLevelGraphBFS(network, source, sink, level)) {
            phases++;
            Arrays.fill(ptr, 0);

            int phaseFlow = 0;
            int phaseAugmentations = 0;

            log.add(String.format("Phase #%d: BFS Level Graph built. Sink level = %d. Commencing DFS blocking flows...",
                    phases, level[sink]));

            while (true) {
                int pushed = pushBlockingFlowDFS(network, source, sink, Integer.MAX_VALUE, level, ptr);
                if (pushed <= 0) {
                    break;
                }
                phaseFlow += pushed;
                maxFlow += pushed;
                phaseAugmentations++;
                totalAugmentations++;
            }

            log.add(String.format("Phase #%d Completed: Pushed %d Mbps blocking flow across %d paths (Cumulative: %d Mbps)",
                    phases, phaseFlow, phaseAugmentations, maxFlow));

            stages.add(new DinicStage(
                    phases,
                    level,
                    phaseFlow,
                    maxFlow,
                    String.format("Phase %d: Pushed %d Mbps blocking flow (Sink Level: %d)", phases, phaseFlow, level[sink])
            ));
        }

        long elapsedNanos = System.nanoTime() - startTime;
        double elapsedMicros = elapsedNanos / 1000.0;

        boolean flowConservation = network.verifyFlowConservation(source, sink);
        MinCutSolver.MinCutResult minCut = MinCutSolver.findMinCut(network, source);
        boolean theoremVerified = (maxFlow == minCut.getTotalCutCapacity());

        log.add(String.format("Dinic's Algorithm Complete: Max Flow = %d Mbps in %.2f µs (%d phases, %d blocking augmentations)",
                maxFlow, elapsedMicros, phases, totalAugmentations));

        return new AlgorithmResult(
                "Dinic's Algorithm (Level Graph + Blocking Flow)",
                maxFlow,
                elapsedMicros,
                phases,
                totalAugmentations,
                flowConservation,
                minCut.getPartitionS(),
                minCut.getPartitionT(),
                minCut.getCutEdges(),
                minCut.getTotalCutCapacity(),
                theoremVerified,
                log
        );
    }

    /**
     * Stage 1: Level Graph Construction using Breadth-First Search (BFS).
     * Computes shortest hop distance level[v] from source in residual network.
     */
    public boolean constructLevelGraphBFS(FlowNetwork network, int source, int sink, int[] level) {
        Arrays.fill(level, -1);
        level[source] = 0;

        Queue<Integer> queue = new ArrayDeque<>();
        queue.offer(source);

        while (!queue.isEmpty()) {
            int u = queue.poll();

            for (FlowEdge edge : network.getEdgesFrom(u)) {
                int v = edge.getTo();
                if (edge.getResidualCapacity() > 0 && level[v] == -1) {
                    level[v] = level[u] + 1;
                    queue.offer(v);
                }
            }
        }

        return level[sink] != -1;
    }

    /**
     * Stage 2: Blocking Flow Computation using Depth-First Search (DFS).
     * Traverses strictly admissible edges where level[v] == level[u] + 1.
     * Uses ptr[u] to skip exhausted / saturated edges in O(1).
     */
    public int pushBlockingFlowDFS(
            FlowNetwork network,
            int u,
            int t,
            int pushed,
            int[] level,
            int[] ptr
    ) {
        if (pushed == 0 || u == t) {
            return pushed;
        }

        List<FlowEdge> edges = network.getEdgesFrom(u);

        for (int i = ptr[u]; i < edges.size(); i = ++ptr[u]) {
            FlowEdge edge = edges.get(i);
            int v = edge.getTo();
            int residual = edge.getResidualCapacity();

            // Admissible edge condition
            if (level[v] == level[u] + 1 && residual > 0) {
                int tr = pushBlockingFlowDFS(network, v, t, Math.min(pushed, residual), level, ptr);
                if (tr > 0) {
                    edge.augmentFlow(tr);
                    return tr;
                }
            }
        }

        return 0;
    }
}
