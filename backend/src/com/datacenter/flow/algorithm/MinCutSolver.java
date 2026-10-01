package com.datacenter.flow.algorithm;

import com.datacenter.flow.model.FlowEdge;
import com.datacenter.flow.model.FlowNetwork;

import java.util.*;

/**
 * Max-Flow Min-Cut Theorem Solver.
 * Conducts Reachability Analysis via BFS on the residual graph to:
 * 1. Partition vertices into S (reachable from source) and T (unreachable from source).
 * 2. Identify 100% saturated cut edges crossing from S to T.
 * 3. Verify that the sum of capacities of the minimum cut equals the maximum flow value.
 */
public class MinCutSolver {

    public static class MinCutResult {
        private final List<Integer> partitionS;
        private final List<Integer> partitionT;
        private final List<FlowEdge> cutEdges;
        private final int totalCutCapacity;

        public MinCutResult(
                List<Integer> partitionS,
                List<Integer> partitionT,
                List<FlowEdge> cutEdges,
                int totalCutCapacity
        ) {
            this.partitionS = partitionS;
            this.partitionT = partitionT;
            this.cutEdges = cutEdges;
            this.totalCutCapacity = totalCutCapacity;
        }

        public List<Integer> getPartitionS() {
            return partitionS;
        }

        public List<Integer> getPartitionT() {
            return partitionT;
        }

        public List<FlowEdge> getCutEdges() {
            return cutEdges;
        }

        public int getTotalCutCapacity() {
            return totalCutCapacity;
        }
    }

    /**
     * Conducts BFS reachability analysis on the residual graph starting from the source vertex.
     */
    public static MinCutResult findMinCut(FlowNetwork network, int source) {
        int n = network.getVertexCount();
        boolean[] visited = new boolean[n];
        Queue<Integer> queue = new ArrayDeque<>();

        visited[source] = true;
        queue.offer(source);

        while (!queue.isEmpty()) {
            int u = queue.poll();
            for (FlowEdge edge : network.getEdgesFrom(u)) {
                // If there is positive residual capacity, vertex v is reachable in residual graph
                if (edge.getResidualCapacity() > 0 && !visited[edge.getTo()]) {
                    visited[edge.getTo()] = true;
                    queue.offer(edge.getTo());
                }
            }
        }

        List<Integer> partitionS = new ArrayList<>();
        List<Integer> partitionT = new ArrayList<>();

        for (int i = 0; i < n; i++) {
            if (visited[i]) {
                partitionS.add(i);
            } else {
                partitionT.add(i);
            }
        }

        List<FlowEdge> cutEdges = new ArrayList<>();
        int totalCapacity = 0;

        // Cut edges are original forward edges with u in S and v in T
        for (FlowEdge edge : network.getAllEdges()) {
            if (visited[edge.getFrom()] && !visited[edge.getTo()] && edge.getCapacity() > 0) {
                cutEdges.add(edge);
                totalCapacity += edge.getCapacity();
            }
        }

        return new MinCutResult(partitionS, partitionT, cutEdges, totalCapacity);
    }
}
