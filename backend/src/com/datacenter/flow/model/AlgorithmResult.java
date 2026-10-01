package com.datacenter.flow.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Encapsulates the results of a Maximum Flow and Minimum Cut computation.
 */
public class AlgorithmResult {
    private final String algorithmName;
    private final int maxFlow;
    private final double executionTimeMicros;
    private final int iterationsOrPhases;
    private final int totalAugmentations;
    private final boolean flowConservationValid;
    private final List<Integer> partitionS;
    private final List<Integer> partitionT;
    private final List<FlowEdge> minCutEdges;
    private final int minCutCapacity;
    private final boolean maxFlowEqualsMinCut;
    private final List<String> executionLog;

    public AlgorithmResult(
            String algorithmName,
            int maxFlow,
            double executionTimeMicros,
            int iterationsOrPhases,
            int totalAugmentations,
            boolean flowConservationValid,
            List<Integer> partitionS,
            List<Integer> partitionT,
            List<FlowEdge> minCutEdges,
            int minCutCapacity,
            boolean maxFlowEqualsMinCut,
            List<String> executionLog
    ) {
        this.algorithmName = algorithmName;
        this.maxFlow = maxFlow;
        this.executionTimeMicros = executionTimeMicros;
        this.iterationsOrPhases = iterationsOrPhases;
        this.totalAugmentations = totalAugmentations;
        this.flowConservationValid = flowConservationValid;
        this.partitionS = partitionS != null ? new ArrayList<>(partitionS) : Collections.emptyList();
        this.partitionT = partitionT != null ? new ArrayList<>(partitionT) : Collections.emptyList();
        this.minCutEdges = minCutEdges != null ? new ArrayList<>(minCutEdges) : Collections.emptyList();
        this.minCutCapacity = minCutCapacity;
        this.maxFlowEqualsMinCut = maxFlowEqualsMinCut;
        this.executionLog = executionLog != null ? new ArrayList<>(executionLog) : Collections.emptyList();
    }

    public String getAlgorithmName() {
        return algorithmName;
    }

    public int getMaxFlow() {
        return maxFlow;
    }

    public double getExecutionTimeMicros() {
        return executionTimeMicros;
    }

    public int getIterationsOrPhases() {
        return iterationsOrPhases;
    }

    public int getTotalAugmentations() {
        return totalAugmentations;
    }

    public boolean isFlowConservationValid() {
        return flowConservationValid;
    }

    public List<Integer> getPartitionS() {
        return Collections.unmodifiableList(partitionS);
    }

    public List<Integer> getPartitionT() {
        return Collections.unmodifiableList(partitionT);
    }

    public List<FlowEdge> getMinCutEdges() {
        return Collections.unmodifiableList(minCutEdges);
    }

    public int getMinCutCapacity() {
        return minCutCapacity;
    }

    public boolean isMaxFlowEqualsMinCut() {
        return maxFlowEqualsMinCut;
    }

    public List<String> getExecutionLog() {
        return Collections.unmodifiableList(executionLog);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("=== %s Execution Result ===%n", algorithmName));
        sb.append(String.format("  * Max Flow: %d Mbps%n", maxFlow));
        sb.append(String.format("  * Min Cut Capacity: %d Mbps%n", minCutCapacity));
        sb.append(String.format("  * Max-Flow Min-Cut Verified: %s%n", maxFlowEqualsMinCut ? "YES (Theorem holds)" : "NO (Mismatch)"));
        sb.append(String.format("  * Execution Time: %.2f µs (%.4f ms)%n", executionTimeMicros, executionTimeMicros / 1000.0));
        sb.append(String.format("  * Phases/Iterations: %d%n", iterationsOrPhases));
        sb.append(String.format("  * Total Augmentations: %d%n", totalAugmentations));
        sb.append(String.format("  * Flow Conservation Valid: %s%n", flowConservationValid ? "PASSED" : "FAILED"));
        sb.append(String.format("  * Cut Partition S (Source side): %s%n", partitionS));
        sb.append(String.format("  * Cut Partition T (Sink side): %s%n", partitionT));
        sb.append(String.format("  * Saturated Cut Edges (%d):%n", minCutEdges.size()));
        for (FlowEdge edge : minCutEdges) {
            sb.append(String.format("      -> %s (Capacity: %d Mbps, Flow: %d Mbps)%n",
                    edge.getLabel(), edge.getCapacity(), edge.getFlow()));
        }
        return sb.toString();
    }
}
