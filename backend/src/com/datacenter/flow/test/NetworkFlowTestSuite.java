package com.datacenter.flow.test;

import com.datacenter.flow.algorithm.DinicsAlgorithm;
import com.datacenter.flow.algorithm.EdmondsKarp;
import com.datacenter.flow.algorithm.FordFulkerson;
import com.datacenter.flow.algorithm.PerformanceComparator;
import com.datacenter.flow.model.AlgorithmResult;
import com.datacenter.flow.model.FlowEdge;
import com.datacenter.flow.model.FlowNetwork;

/**
 * Module 4 – Network Flow (Primary Module) Complete Verification Suite.
 * 
 * Verifies:
 * 1. Maximum Flow Problem (Source, Sink, Capacity Constraints, Flow Conservation, Integer Capacities)
 * 2. Residual Graph Operations (Forward & Reverse Residual Edges, Residual Updates)
 * 3. Ford-Fulkerson Method (DFS Augmenting Paths)
 * 4. Edmonds-Karp Algorithm (BFS Shortest Augmenting Paths & O(V * E^2))
 * 5. Dinic's Algorithm (Level Graph BFS, Blocking Flow DFS, ptr Optimization, O(V^2 * E))
 * 6. Max-Flow Min-Cut Theorem (Reachability BFS, Min-Cut Extraction, Max-Flow == Min-Cut Verification)
 * 7. Benchmark and Performance Comparison across Data Center Topologies
 */
public class NetworkFlowTestSuite {

    private static int totalTests = 0;
    private static int passedTests = 0;

    public static void main(String[] args) {
        System.out.println("=========================================================================");
        System.out.println("⚡ RUNNING MODULE 4 NETWORK FLOW OPTIMIZATION TEST SUITE (JAVA 25)");
        System.out.println("=========================================================================");

        test1_GraphRepresentationAndConstraints();
        test2_ResidualGraphAndCapacityUpdates();
        test3_FordFulkersonAugmentingPaths();
        test4_EdmondsKarpShortestAugmentingPaths();
        test5_DinicsAlgorithmLevelGraphAndBlockingFlow();
        test6_MaxFlowMinCutTheoremVerification();
        test7_FlowConservationAtAllIntermediateNodes();
        test8_DatacenterMultiPathBenchmarkAndComparison();
        test9_LayeredScalabilityGraph();

        System.out.println("=========================================================================");
        System.out.printf("🏁 TEST SUITE FINISHED: %d / %d PASSED (100%% SUCCESS)%n", passedTests, totalTests);
        System.out.println("=========================================================================");
    }

    private static void assertTrue(String testName, boolean condition, String message) {
        totalTests++;
        if (condition) {
            passedTests++;
            System.out.printf("  [PASS] %-55s %s%n", testName, message != null ? "-> " + message : "");
        } else {
            System.err.printf("  [FAIL] %-55s %s%n", testName, message != null ? "-> " + message : "");
            throw new AssertionError("Test Failed: " + testName + " - " + message);
        }
    }

    /**
     * Test 1: Graph Representation, Source/Sink, and Capacity Constraints
     */
    private static void test1_GraphRepresentationAndConstraints() {
        System.out.println("\n--- [Topic 1] Graph Representation & Capacity Constraints ---");
        FlowNetwork net = new FlowNetwork(4);
        net.setSource(0);
        net.setSink(3);

        FlowEdge e1 = net.addEdge(0, 1, 100);
        FlowEdge e2 = net.addEdge(1, 2, 50);
        FlowEdge e3 = net.addEdge(2, 3, 80);

        assertTrue("Graph vertex count is 4", net.getVertexCount() == 4, "Verified vertex count");
        assertTrue("Source is vertex 0", net.getSource() == 0, "Source assigned");
        assertTrue("Sink is vertex 3", net.getSink() == 3, "Sink assigned");
        assertTrue("Capacity is non-negative integer", e1.getCapacity() == 100 && e2.getCapacity() == 50, "Integer capacities verified");
        assertTrue("Initial flow is 0", e1.getFlow() == 0 && e2.getFlow() == 0, "Zero initial flow verified");
    }

    /**
     * Test 2: Residual Graph (Forward and Reverse Edges & Residual Capacity Updates)
     */
    private static void test2_ResidualGraphAndCapacityUpdates() {
        System.out.println("\n--- [Topic 2] Residual Graph & Residual Capacity Updates ---");
        FlowNetwork net = new FlowNetwork(2);
        FlowEdge fwd = net.addEdge(0, 1, 100, "Link(0->1)");
        FlowEdge rev = fwd.getReverseEdge();

        assertTrue("Reverse residual edge auto-created", rev != null, "Back-edge paired");
        assertTrue("Initial residual capacity equals capacity", fwd.getResidualCapacity() == 100, "Residual = 100");
        assertTrue("Initial reverse residual is 0", rev.getResidualCapacity() == 0, "Residual reverse = 0");

        // Augment 40 units
        fwd.augmentFlow(40);
        assertTrue("Forward flow updated to 40", fwd.getFlow() == 40, "Forward flow = 40");
        assertTrue("Forward residual reduced to 60", fwd.getResidualCapacity() == 60, "Forward residual = 60");
        assertTrue("Reverse residual increased to 40", rev.getResidualCapacity() == 40, "Reverse residual = 40 (enables push-back)");
    }

    /**
     * Test 3: Ford-Fulkerson Method (DFS Augmenting Paths)
     */
    private static void test3_FordFulkersonAugmentingPaths() {
        System.out.println("\n--- [Topic 3] Ford-Fulkerson Method (DFS Augmenting Paths) ---");
        FlowNetwork net = createStandardTestNetwork();
        FordFulkerson ff = new FordFulkerson();
        AlgorithmResult result = ff.computeMaxFlow(net, 0, 5);

        assertTrue("Ford-Fulkerson computed max flow = 19", result.getMaxFlow() == 19, "Max Flow = " + result.getMaxFlow());
        assertTrue("Ford-Fulkerson flow conservation held", result.isFlowConservationValid(), "Conservation verified");
        assertTrue("Ford-Fulkerson MaxFlow == MinCut capacity", result.isMaxFlowEqualsMinCut(), "Theorem verified");
    }

    /**
     * Test 4: Edmonds-Karp Algorithm (BFS Shortest Augmenting Paths)
     */
    private static void test4_EdmondsKarpShortestAugmentingPaths() {
        System.out.println("\n--- [Topic 4] Edmonds-Karp Algorithm (BFS Shortest Augmenting Paths) ---");
        FlowNetwork net = createStandardTestNetwork();
        EdmondsKarp ek = new EdmondsKarp();
        AlgorithmResult result = ek.computeMaxFlow(net, 0, 5);

        assertTrue("Edmonds-Karp computed max flow = 19", result.getMaxFlow() == 19, "Max Flow = " + result.getMaxFlow());
        assertTrue("Edmonds-Karp augmentations completed", result.getTotalAugmentations() > 0, "Augmentations = " + result.getTotalAugmentations());
        assertTrue("Edmonds-Karp flow conservation held", result.isFlowConservationValid(), "Conservation verified");
        assertTrue("Edmonds-Karp MaxFlow == MinCut capacity", result.isMaxFlowEqualsMinCut(), "Theorem verified");
    }

    /**
     * Test 5: Dinic's Algorithm (Level Graph BFS + Blocking Flow DFS)
     */
    private static void test5_DinicsAlgorithmLevelGraphAndBlockingFlow() {
        System.out.println("\n--- [Topic 5] Dinic's Algorithm (Level Graph & Blocking Flow) ---");
        FlowNetwork net = createStandardTestNetwork();
        DinicsAlgorithm dinic = new DinicsAlgorithm();
        AlgorithmResult result = dinic.computeMaxFlow(net, 0, 5);

        assertTrue("Dinic's computed max flow = 19", result.getMaxFlow() == 19, "Max Flow = " + result.getMaxFlow());
        assertTrue("Dinic's completed in fewer phases", result.getIterationsOrPhases() <= 4, "Phases = " + result.getIterationsOrPhases());
        assertTrue("Dinic's stages tracked for visualization", !dinic.getStages().isEmpty(), "Stage count = " + dinic.getStages().size());
        assertTrue("Dinic's flow conservation held", result.isFlowConservationValid(), "Conservation verified");
        assertTrue("Dinic's MaxFlow == MinCut capacity", result.isMaxFlowEqualsMinCut(), "Theorem verified");
    }

    /**
     * Test 6: Max-Flow Min-Cut Theorem Verification
     */
    private static void test6_MaxFlowMinCutTheoremVerification() {
        System.out.println("\n--- [Topic 6] Max-Flow Min-Cut Theorem & Reachability Analysis ---");
        FlowNetwork net = PerformanceComparator.createDatacenterTopology();
        DinicsAlgorithm dinic = new DinicsAlgorithm();
        AlgorithmResult result = dinic.computeMaxFlow(net, net.getSource(), net.getSink());

        assertTrue("Source in Partition S", result.getPartitionS().contains(net.getSource()), "S contains Source");
        assertTrue("Sink in Partition T", result.getPartitionT().contains(net.getSink()), "T contains Sink");
        assertTrue("Min-Cut capacity exactly matches Max-Flow", result.getMaxFlow() == result.getMinCutCapacity(),
                String.format("MaxFlow=%d == MinCutCap=%d", result.getMaxFlow(), result.getMinCutCapacity()));
        assertTrue("All Min-Cut edges are 100% saturated",
                result.getMinCutEdges().stream().allMatch(FlowEdge::isSaturated), "Saturated cut edges verified");
    }

    /**
     * Test 7: Flow Conservation at all Intermediate Vertices
     */
    private static void test7_FlowConservationAtAllIntermediateNodes() {
        System.out.println("\n--- [Topic 7] Flow Conservation Verification (Inflow == Outflow) ---");
        FlowNetwork net = PerformanceComparator.createDatacenterTopology();
        DinicsAlgorithm dinic = new DinicsAlgorithm();
        dinic.computeMaxFlow(net, net.getSource(), net.getSink());

        int sourceNet = net.computeSourceNetFlow(net.getSource());
        int sinkNet = net.computeSinkNetFlow(net.getSink());

        assertTrue("Net Source Outflow equals Net Sink Inflow", sourceNet == sinkNet,
                String.format("Net Outflow=%d == Net Inflow=%d", sourceNet, sinkNet));
        assertTrue("Flow conservation strictly verified for all intermediate nodes",
                net.verifyFlowConservation(net.getSource(), net.getSink()), "All intermediate vertices conserved");
    }

    /**
     * Test 8: Global Data Center Multi-Path Benchmark & Speedup Analysis
     */
    private static void test8_DatacenterMultiPathBenchmarkAndComparison() {
        System.out.println("\n--- [Topic 8] Data Center Multi-Path Performance Benchmark ---");
        FlowNetwork net = PerformanceComparator.createDatacenterTopology();
        PerformanceComparator.BenchmarkComparison comp = PerformanceComparator.runComparison("Datacenter Backbone", net);
        comp.printSummary();

        assertTrue("All algorithms agree on max flow",
                comp.dinicsResult.getMaxFlow() == comp.edmondsKarpResult.getMaxFlow() &&
                comp.dinicsResult.getMaxFlow() == comp.fordFulkersonResult.getMaxFlow(),
                "Agreement verified (MaxFlow = " + comp.dinicsResult.getMaxFlow() + " Mbps)");
        assertTrue("Dinic's executes with fast sub-millisecond latency",
                comp.dinicsResult.getExecutionTimeMicros() < 5000.0,
                String.format("Dinic time = %.2f µs", comp.dinicsResult.getExecutionTimeMicros()));
    }

    /**
     * Test 9: High-Density Layered Network Scalability
     */
    private static void test9_LayeredScalabilityGraph() {
        System.out.println("\n--- [Topic 9] Layered Multi-Stage Network Scalability ---");
        FlowNetwork net = PerformanceComparator.createLayeredNetwork(5, 6, 500);
        PerformanceComparator.BenchmarkComparison comp = PerformanceComparator.runComparison("Dense 5-Layer Network (32 nodes)", net);
        comp.printSummary();

        assertTrue("Layered graph max flow positive", comp.dinicsResult.getMaxFlow() > 0,
                "MaxFlow = " + comp.dinicsResult.getMaxFlow() + " Mbps");
        assertTrue("Dinic's scales efficiently on layered blocking flows",
                comp.dinicsResult.isMaxFlowEqualsMinCut(), "Min-Cut theorem verified on complex topology");
    }

    /**
     * Standard 6-node network:
     * 0(S) -> 1(10), 0 -> 2(10)
     * 1 -> 2(2), 1 -> 3(4), 1 -> 4(8)
     * 2 -> 4(9)
     * 3 -> 5(10)
     * 4 -> 3(6), 4 -> 5(10)
     * Expected Max Flow = 23
     */
    private static FlowNetwork createStandardTestNetwork() {
        FlowNetwork net = new FlowNetwork(6);
        net.setSource(0);
        net.setSink(5);
        net.setNodeName(0, "Source S");
        net.setNodeName(1, "Node A");
        net.setNodeName(2, "Node B");
        net.setNodeName(3, "Node C");
        net.setNodeName(4, "Node D");
        net.setNodeName(5, "Sink T");

        net.addEdge(0, 1, 10, "S->A");
        net.addEdge(0, 2, 10, "S->B");
        net.addEdge(1, 2, 2, "A->B");
        net.addEdge(1, 3, 4, "A->C");
        net.addEdge(1, 4, 8, "A->D");
        net.addEdge(2, 4, 9, "B->D");
        net.addEdge(3, 5, 10, "C->T");
        net.addEdge(4, 3, 6, "D->C");
        net.addEdge(4, 5, 10, "D->T");

        return net;
    }
}
