package com.datacenter.flow.algorithm;

import com.datacenter.flow.model.AlgorithmResult;
import com.datacenter.flow.model.FlowNetwork;

import java.util.Random;

/**
 * Performance Comparison Suite.
 * Benchmarks Dinic's Algorithm against Edmonds-Karp and Ford-Fulkerson
 * across various graph densities (Sparse, Dense Mesh, Layered Data Center topologies).
 */
public class PerformanceComparator {

    public static class BenchmarkComparison {
        public final String topologyName;
        public final int vertexCount;
        public final int edgeCount;
        public final AlgorithmResult dinicsResult;
        public final AlgorithmResult edmondsKarpResult;
        public final AlgorithmResult fordFulkersonResult;
        public final double speedupFactor;

        public BenchmarkComparison(
                String topologyName,
                int vertexCount,
                int edgeCount,
                AlgorithmResult dinicsResult,
                AlgorithmResult edmondsKarpResult,
                AlgorithmResult fordFulkersonResult
        ) {
            this.topologyName = topologyName;
            this.vertexCount = vertexCount;
            this.edgeCount = edgeCount;
            this.dinicsResult = dinicsResult;
            this.edmondsKarpResult = edmondsKarpResult;
            this.fordFulkersonResult = fordFulkersonResult;
            double ekTime = edmondsKarpResult.getExecutionTimeMicros();
            double dinicTime = Math.max(0.1, dinicsResult.getExecutionTimeMicros());
            this.speedupFactor = Math.round((ekTime / dinicTime) * 100.0) / 100.0;
        }

        public void printSummary() {
            System.out.println("=========================================================================");
            System.out.printf("BENCHMARK: %s (%d nodes, %d directed links)%n", topologyName, vertexCount, edgeCount);
            System.out.println("=========================================================================");
            System.out.printf("  * Max Flow Computed : Dinic's=%d Mbps | Edmonds-Karp=%d Mbps | Ford-Fulkerson=%d Mbps%n",
                    dinicsResult.getMaxFlow(), edmondsKarpResult.getMaxFlow(), fordFulkersonResult.getMaxFlow());
            System.out.printf("  * Dinic's Time      : %.2f µs (Phases: %d, Blocking Augmentations: %d)%n",
                    dinicsResult.getExecutionTimeMicros(), dinicsResult.getIterationsOrPhases(), dinicsResult.getTotalAugmentations());
            System.out.printf("  * Edmonds-Karp Time : %.2f µs (BFS Augmentations: %d)%n",
                    edmondsKarpResult.getExecutionTimeMicros(), edmondsKarpResult.getTotalAugmentations());
            System.out.printf("  * Ford-Fulkerson Time: %.2f µs (DFS Augmentations: %d)%n",
                    fordFulkersonResult.getExecutionTimeMicros(), fordFulkersonResult.getTotalAugmentations());
            System.out.printf("  >>> Dinic's Speedup over Edmonds-Karp: %.2fx faster%n", speedupFactor);
            System.out.printf("  >>> Max-Flow Min-Cut Theorem: Verified (%s)%n",
                    dinicsResult.isMaxFlowEqualsMinCut() ? "PASSED" : "FAILED");
            System.out.println();
        }
    }

    /**
     * Creates a standardized 8-node Global Core Edge Data Center Network.
     */
    public static FlowNetwork createDatacenterTopology() {
        FlowNetwork net = new FlowNetwork(8);
        net.setNodeName(0, "US-EAST-01 (Virginia Core)");
        net.setNodeName(1, "EU-WEST-02 (Frankfurt Hub)");
        net.setNodeName(2, "JP-EAST-03 (Tokyo Metro)");
        net.setNodeName(3, "SG-CENT-04 (Singapore Equinix)");
        net.setNodeName(4, "AU-SOUTH-05 (Sydney Gateway)");
        net.setNodeName(5, "SA-EAST-06 (São Paulo Central)");
        net.setNodeName(6, "ME-WEST-07 (Dubai Internet City)");
        net.setNodeName(7, "IN-WEST-08 (Mumbai Cloud Zone)");

        net.setSource(0);
        net.setSink(7);

        // Core high-capacity multi-path fiber trunk lines (Mbps)
        net.addEdge(0, 1, 1500, "Virginia -> Frankfurt");
        net.addEdge(0, 2, 1200, "Virginia -> Tokyo");
        net.addEdge(0, 5, 800, "Virginia -> Sao Paulo");
        net.addEdge(1, 2, 600, "Frankfurt -> Tokyo");
        net.addEdge(1, 6, 1100, "Frankfurt -> Dubai");
        net.addEdge(2, 3, 1000, "Tokyo -> Singapore");
        net.addEdge(2, 4, 750, "Tokyo -> Sydney");
        net.addEdge(3, 7, 1400, "Singapore -> Mumbai");
        net.addEdge(4, 7, 700, "Sydney -> Mumbai");
        net.addEdge(5, 6, 500, "Sao Paulo -> Dubai");
        net.addEdge(6, 7, 1200, "Dubai -> Mumbai");

        return net;
    }

    /**
     * Creates a layered synthetic network to test Dinic's blocking flow scalability.
     */
    public static FlowNetwork createLayeredNetwork(int layers, int nodesPerLayer, int capacity) {
        int totalNodes = 2 + (layers * nodesPerLayer);
        FlowNetwork net = new FlowNetwork(totalNodes);
        int source = 0;
        int sink = totalNodes - 1;

        net.setSource(source);
        net.setSink(sink);
        net.setNodeName(source, "Source S");
        net.setNodeName(sink, "Sink T");

        Random rng = new Random(42);

        // Source to Layer 1
        for (int i = 1; i <= nodesPerLayer; i++) {
            net.setNodeName(i, "L1-Node" + i);
            net.addEdge(source, i, capacity + rng.nextInt(capacity / 2));
        }

        // Intermediate layers
        for (int l = 1; l < layers; l++) {
            int currentLayerStart = 1 + (l - 1) * nodesPerLayer;
            int nextLayerStart = 1 + l * nodesPerLayer;

            for (int u = 0; u < nodesPerLayer; u++) {
                int uIdx = currentLayerStart + u;
                for (int v = 0; v < nodesPerLayer; v++) {
                    int vIdx = nextLayerStart + v;
                    net.setNodeName(vIdx, "L" + (l + 1) + "-Node" + (v + 1));
                    net.addEdge(uIdx, vIdx, (capacity / 2) + rng.nextInt(capacity));
                }
            }
        }

        // Final layer to Sink
        int lastLayerStart = 1 + (layers - 1) * nodesPerLayer;
        for (int i = 0; i < nodesPerLayer; i++) {
            int uIdx = lastLayerStart + i;
            net.addEdge(uIdx, sink, capacity + rng.nextInt(capacity / 2));
        }

        return net;
    }

    public static BenchmarkComparison runComparison(String name, FlowNetwork network) {
        int s = network.getSource();
        int t = network.getSink();

        // 1. Dinic's
        FlowNetwork dinicNet = network.cloneNetwork();
        DinicsAlgorithm dinic = new DinicsAlgorithm();
        AlgorithmResult dinicResult = dinic.computeMaxFlow(dinicNet, s, t);

        // 2. Edmonds-Karp
        FlowNetwork ekNet = network.cloneNetwork();
        EdmondsKarp ek = new EdmondsKarp();
        AlgorithmResult ekResult = ek.computeMaxFlow(ekNet, s, t);

        // 3. Ford-Fulkerson
        FlowNetwork ffNet = network.cloneNetwork();
        FordFulkerson ff = new FordFulkerson();
        AlgorithmResult ffResult = ff.computeMaxFlow(ffNet, s, t);

        return new BenchmarkComparison(name, network.getVertexCount(), network.getAllEdges().size(),
                dinicResult, ekResult, ffResult);
    }
}
