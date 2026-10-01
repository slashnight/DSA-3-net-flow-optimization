package com.datacenter.flow.model;

/**
 * Represents a capacity-constrained directed edge in a Network Flow Graph.
 * Supports residual graph operations for Ford-Fulkerson, Edmonds-Karp, and Dinic's algorithms.
 */
public class FlowEdge {
    private final int from;
    private final int to;
    private final int capacity;
    private int flow;
    private FlowEdge reverseEdge;
    private final String label;

    public FlowEdge(int from, int to, int capacity) {
        this(from, to, capacity, "Edge(" + from + "->" + to + ")");
    }

    public FlowEdge(int from, int to, int capacity, String label) {
        if (capacity < 0) {
            throw new IllegalArgumentException("Edge capacity must be non-negative: " + capacity);
        }
        this.from = from;
        this.to = to;
        this.capacity = capacity;
        this.flow = 0;
        this.label = label;
    }

    public int getFrom() {
        return from;
    }

    public int getTo() {
        return to;
    }

    public int getCapacity() {
        return capacity;
    }

    public int getFlow() {
        return flow;
    }

    public FlowEdge getReverseEdge() {
        return reverseEdge;
    }

    public void setReverseEdge(FlowEdge reverseEdge) {
        this.reverseEdge = reverseEdge;
    }

    public String getLabel() {
        return label;
    }

    /**
     * Calculates residual capacity along this edge:
     * - Forward edge: capacity - flow
     * - Reverse edge: flow along original edge (which equals capacity of residual)
     */
    public int getResidualCapacity() {
        return capacity - flow;
    }

    /**
     * Augments flow along this edge by delta:
     * - Adds delta to this edge's flow
     * - Subtracts delta from the reverse edge's flow
     */
    public void augmentFlow(int delta) {
        if (delta < 0) {
            throw new IllegalArgumentException("Flow augmentation delta must be positive: " + delta);
        }
        if (flow + delta > capacity) {
            throw new IllegalStateException("Flow exceeds capacity: " + (flow + delta) + " > " + capacity);
        }
        this.flow += delta;
        if (this.reverseEdge != null) {
            this.reverseEdge.flow -= delta;
        }
    }

    public void resetFlow() {
        this.flow = 0;
    }

    public boolean isSaturated() {
        return flow == capacity && capacity > 0;
    }

    public double getUtilization() {
        return capacity > 0 ? (double) flow / capacity : 0.0;
    }

    @Override
    public String toString() {
        return String.format("%s [u=%d -> v=%d, flow=%d/%d Mbps, residual=%d Mbps%s]",
                label, from, to, flow, capacity, getResidualCapacity(), isSaturated() ? " (SATURATED)" : "");
    }
}
