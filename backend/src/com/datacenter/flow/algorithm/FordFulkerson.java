package com.datacenter.flow.algorithm;

import com.datacenter.flow.model.AlgorithmResult;
import com.datacenter.flow.model.FlowEdge;
import com.datacenter.flow.model.FlowNetwork;

import java.util.ArrayList;
import java.util.List;

/**
 * Ford-Fulkerson Method (Conceptual Foundation).
 * Finds augmenting paths in the residual graph using Depth-First Search (DFS).
 * Augments flow along the path until no augmenting path remains.
 */
public class FordFulkerson {

    public AlgorithmResult computeMaxFlow(FlowNetwork network, int source, int sink) {
        long startTime = System.nanoTime();
        network.resetAllFlows();

        List<String> log = new ArrayList<>();
        log.add(String.format("Starting Ford-Fulkerson DFS method from Source %d to Sink %d", source, sink));

        int maxFlow = 0;
        int augmentations = 0;
        boolean[] visited = new boolean[network.getVertexCount()];

        while (true) {
            java.util.Arrays.fill(visited, false);
            int pushed = dfsFindAugmentingPath(network, source, sink, Integer.MAX_VALUE, visited, log);
            if (pushed <= 0) {
                break;
            }
            maxFlow += pushed;
            augmentations++;
            log.add(String.format("Augmentation #%d: Pushed %d Mbps flow. Current total: %d Mbps",
                    augmentations, pushed, maxFlow));
        }

        long elapsedNanos = System.nanoTime() - startTime;
        double elapsedMicros = elapsedNanos / 1000.0;

        boolean flowConservation = network.verifyFlowConservation(source, sink);
        MinCutSolver.MinCutResult minCut = MinCutSolver.findMinCut(network, source);
        boolean theoremVerified = (maxFlow == minCut.getTotalCutCapacity());

        log.add(String.format("Ford-Fulkerson Completed: Max Flow = %d Mbps in %.2f µs (%d augmentations)",
                maxFlow, elapsedMicros, augmentations));

        return new AlgorithmResult(
                "Ford-Fulkerson (DFS-Based)",
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

    private int dfsFindAugmentingPath(
            FlowNetwork network,
            int u,
            int t,
            int pushed,
            boolean[] visited,
            List<String> log
    ) {
        if (u == t) {
            return pushed;
        }
        visited[u] = true;

        for (FlowEdge edge : network.getEdgesFrom(u)) {
            int residual = edge.getResidualCapacity();
            int v = edge.getTo();

            if (!visited[v] && residual > 0) {
                int tr = dfsFindAugmentingPath(network, v, t, Math.min(pushed, residual), visited, log);
                if (tr > 0) {
                    edge.augmentFlow(tr);
                    return tr;
                }
            }
        }
        return 0;
    }
}
