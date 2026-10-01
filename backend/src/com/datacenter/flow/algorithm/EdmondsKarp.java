package com.datacenter.flow.algorithm;

import com.datacenter.flow.model.AlgorithmResult;
import com.datacenter.flow.model.FlowEdge;
import com.datacenter.flow.model.FlowNetwork;

import java.util.*;

/**
 * Edmonds-Karp Algorithm for Maximum Flow.
 * Computes max flow in O(V * E^2) time by always using Breadth-First Search (BFS)
 * to find the shortest augmenting path (fewest edges) in the residual graph.
 */
public class EdmondsKarp {

    public AlgorithmResult computeMaxFlow(FlowNetwork network, int source, int sink) {
        long startTime = System.nanoTime();
        network.resetAllFlows();

        int n = network.getVertexCount();
        int maxFlow = 0;
        int augmentations = 0;
        List<String> log = new ArrayList<>();

        log.add(String.format("Initializing Edmonds-Karp (BFS Shortest Augmenting Path) on %d vertices", n));

        FlowEdge[] edgeTo = new FlowEdge[n];

        while (hasAugmentingPathBFS(network, source, sink, edgeTo)) {
            // Find bottleneck capacity along the shortest augmenting path
            int bottleneck = Integer.MAX_VALUE;
            List<String> pathNodes = new ArrayList<>();

            for (int v = sink; v != source; v = edgeTo[v].getFrom()) {
                FlowEdge edge = edgeTo[v];
                bottleneck = Math.min(bottleneck, edge.getResidualCapacity());
                pathNodes.add(network.getNodeName(v));
            }
            pathNodes.add(network.getNodeName(source));
            Collections.reverse(pathNodes);

            // Augment flow along the path
            for (int v = sink; v != source; v = edgeTo[v].getFrom()) {
                edgeTo[v].augmentFlow(bottleneck);
            }

            maxFlow += bottleneck;
            augmentations++;

            log.add(String.format("Augment #%d: Path [%s] -> Bottleneck=%d Mbps, Current MaxFlow=%d Mbps",
                    augmentations, String.join(" -> ", pathNodes), bottleneck, maxFlow));
        }

        long elapsedNanos = System.nanoTime() - startTime;
        double elapsedMicros = elapsedNanos / 1000.0;

        boolean flowConservation = network.verifyFlowConservation(source, sink);
        MinCutSolver.MinCutResult minCut = MinCutSolver.findMinCut(network, source);
        boolean theoremVerified = (maxFlow == minCut.getTotalCutCapacity());

        log.add(String.format("Edmonds-Karp Complete: Max Flow = %d Mbps in %.2f µs (%d BFS augmentations)",
                maxFlow, elapsedMicros, augmentations));

        return new AlgorithmResult(
                "Edmonds-Karp (BFS Augmenting Path)",
                maxFlow,
                elapsedMicros,
                augmentations,
                augmentations,
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
     * Finds shortest augmenting path in the residual graph using BFS.
     * Records the edge used to reach each vertex in edgeTo[].
     */
    private boolean hasAugmentingPathBFS(FlowNetwork network, int source, int sink, FlowEdge[] edgeTo) {
        int n = network.getVertexCount();
        boolean[] visited = new boolean[n];
        Arrays.fill(edgeTo, null);

        Queue<Integer> queue = new ArrayDeque<>();
        queue.offer(source);
        visited[source] = true;

        while (!queue.isEmpty()) {
            int u = queue.poll();
            if (u == sink) {
                return true;
            }

            for (FlowEdge edge : network.getEdgesFrom(u)) {
                int v = edge.getTo();
                if (edge.getResidualCapacity() > 0 && !visited[v]) {
                    visited[v] = true;
                    edgeTo[v] = edge;
                    queue.offer(v);
                }
            }
        }

        return visited[sink];
    }
}
