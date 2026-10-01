package com.datacenter.flow.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Adjacency List Implementation of a Capacity-Constrained Network Flow Graph.
 * Supports forward and reverse edges for residual network representation,
 * source and sink node assignments, and flow conservation verification.
 */
public class FlowNetwork {
    private final int vertexCount;
    private final List<List<FlowEdge>> adjacencyList;
    private final List<FlowEdge> allEdges;
    private int source = -1;
    private int sink = -1;
    private final String[] nodeNames;

    public FlowNetwork(int vertexCount) {
        if (vertexCount <= 0) {
            throw new IllegalArgumentException("Vertex count must be positive: " + vertexCount);
        }
        this.vertexCount = vertexCount;
        this.adjacencyList = new ArrayList<>(vertexCount);
        this.allEdges = new ArrayList<>();
        this.nodeNames = new String[vertexCount];

        for (int i = 0; i < vertexCount; i++) {
            this.adjacencyList.add(new ArrayList<>());
            this.nodeNames[i] = "Node-" + i;
        }
    }

    public void setNodeName(int vertex, String name) {
        validateVertex(vertex);
        this.nodeNames[vertex] = name;
    }

    public String getNodeName(int vertex) {
        validateVertex(vertex);
        return this.nodeNames[vertex];
    }

    public void setSource(int source) {
        validateVertex(source);
        this.source = source;
    }

    public void setSink(int sink) {
        validateVertex(sink);
        this.sink = sink;
    }

    public int getSource() {
        return source;
    }

    public int getSink() {
        return sink;
    }

    public int getVertexCount() {
        return vertexCount;
    }

    public List<FlowEdge> getEdgesFrom(int u) {
        validateVertex(u);
        return Collections.unmodifiableList(adjacencyList.get(u));
    }

    public List<FlowEdge> getAllEdges() {
        return Collections.unmodifiableList(allEdges);
    }

    /**
     * Adds a directed fiber / transmission link from u to v with capacity in Mbps.
     * Automatically registers the forward edge and reverse residual edge with 0 initial capacity.
     */
    public FlowEdge addEdge(int from, int to, int capacity) {
        return addEdge(from, to, capacity, String.format("%s->%s", getNodeName(from), getNodeName(to)));
    }

    public FlowEdge addEdge(int from, int to, int capacity, String label) {
        validateVertex(from);
        validateVertex(to);
        if (from == to) {
            throw new IllegalArgumentException("Self-loops are not allowed in flow network: " + from);
        }

        FlowEdge forward = new FlowEdge(from, to, capacity, label);
        FlowEdge reverse = new FlowEdge(to, from, 0, label + " (Residual Back-Edge)");

        forward.setReverseEdge(reverse);
        reverse.setReverseEdge(forward);

        adjacencyList.get(from).add(forward);
        adjacencyList.get(to).add(reverse);

        allEdges.add(forward);
        return forward;
    }

    public void resetAllFlows() {
        for (FlowEdge edge : allEdges) {
            edge.resetFlow();
            if (edge.getReverseEdge() != null) {
                edge.getReverseEdge().resetFlow();
            }
        }
    }

    /**
     * Verifies the Flow Conservation condition:
     * For every node u (except source S and sink T):
     * Sum of incoming flow == Sum of outgoing flow.
     */
    public boolean verifyFlowConservation(int source, int sink) {
        for (int i = 0; i < vertexCount; i++) {
            if (i == source || i == sink) {
                continue;
            }
            int inFlow = 0;
            int outFlow = 0;

            for (FlowEdge edge : allEdges) {
                if (edge.getTo() == i && edge.getCapacity() > 0) {
                    inFlow += edge.getFlow();
                }
                if (edge.getFrom() == i && edge.getCapacity() > 0) {
                    outFlow += edge.getFlow();
                }
            }

            if (inFlow != outFlow) {
                System.err.printf("[Flow Conservation Violation] Node %s (%d): Inflow=%d != Outflow=%d%n",
                        getNodeName(i), i, inFlow, outFlow);
                return false;
            }
        }
        return true;
    }

    /**
     * Computes the total net flow leaving the source node.
     */
    public int computeSourceNetFlow(int source) {
        int net = 0;
        for (FlowEdge edge : adjacencyList.get(source)) {
            if (edge.getCapacity() > 0) {
                net += edge.getFlow();
            }
        }
        return net;
    }

    /**
     * Computes the total net flow entering the sink node.
     */
    public int computeSinkNetFlow(int sink) {
        int net = 0;
        for (FlowEdge edge : allEdges) {
            if (edge.getTo() == sink && edge.getCapacity() > 0) {
                net += edge.getFlow();
            }
        }
        return net;
    }

    private void validateVertex(int v) {
        if (v < 0 || v >= vertexCount) {
            throw new IndexOutOfBoundsException("Vertex index out of bounds: " + v + " (size: " + vertexCount + ")");
        }
    }

    /**
     * Clones this network structure with 0 initial flow.
     */
    public FlowNetwork cloneNetwork() {
        FlowNetwork copy = new FlowNetwork(this.vertexCount);
        copy.setSource(this.source);
        copy.setSink(this.sink);
        for (int i = 0; i < vertexCount; i++) {
            copy.setNodeName(i, this.nodeNames[i]);
        }
        for (FlowEdge edge : allEdges) {
            copy.addEdge(edge.getFrom(), edge.getTo(), edge.getCapacity(), edge.getLabel());
        }
        return copy;
    }
}
