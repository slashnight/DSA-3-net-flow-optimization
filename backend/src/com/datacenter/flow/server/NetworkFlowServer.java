package com.datacenter.flow.server;

import com.datacenter.flow.algorithm.DinicsAlgorithm;
import com.datacenter.flow.algorithm.EdmondsKarp;
import com.datacenter.flow.algorithm.FordFulkerson;
import com.datacenter.flow.algorithm.PerformanceComparator;
import com.datacenter.flow.model.AlgorithmResult;
import com.datacenter.flow.model.FlowEdge;
import com.datacenter.flow.model.FlowNetwork;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;

/**
 * Built-in High-Performance Java HTTP REST Server.
 * Exposes endpoints for real-time Dinic's computation, stage visualizer,
 * Edmonds-Karp comparison, and Max-Flow Min-Cut verification.
 */
public class NetworkFlowServer {
    public static final int DEFAULT_PORT = 8080;
    private final HttpServer server;
    private final int port;

    public NetworkFlowServer(int port) throws IOException {
        this.port = port;
        this.server = HttpServer.create(new InetSocketAddress(port), 0);
        this.server.setExecutor(Executors.newVirtualThreadPerTaskExecutor()); // Java 21+ Virtual Threads
        configureRoutes();
    }

    private void configureRoutes() {
        server.createContext("/api/health", new HealthHandler());
        server.createContext("/api/flow/compute", new ComputeFlowHandler());
        server.createContext("/api/flow/compare", new CompareAlgorithmsHandler());
        server.createContext("/api/flow/stages", new StagesVisualizerHandler());
        server.createContext("/api/flow/topology", new DatacenterTopologyHandler());
    }

    public void start() {
        server.start();
        System.out.printf("=================================================================%n");
        System.out.printf("🚀 Network Flow Optimization System (Java 25 Backend Active)%n");
        System.out.printf("   Port: http://localhost:%d%n", port);
        System.out.printf("   Endpoints:%n");
        System.out.printf("     - GET  /api/health%n");
        System.out.printf("     - GET  /api/flow/topology%n");
        System.out.printf("     - POST /api/flow/compute%n");
        System.out.printf("     - POST /api/flow/compare%n");
        System.out.printf("     - GET  /api/flow/stages%n");
        System.out.printf("=================================================================%n");
    }

    public void stop() {
        server.stop(0);
        System.out.println("Java Backend Server stopped.");
    }

    private static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            String response = "{\"status\":\"NOMINAL\",\"version\":\"2026.4.1-quantum-java\",\"engine\":\"Dinic-ZeroGC\"}";
            sendJsonResponse(exchange, 200, response);
        }
    }

    private static class DatacenterTopologyHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            FlowNetwork net = PerformanceComparator.createDatacenterTopology();
            DinicsAlgorithm dinic = new DinicsAlgorithm();
            AlgorithmResult result = dinic.computeMaxFlow(net, net.getSource(), net.getSink());

            StringBuilder sb = new StringBuilder();
            sb.append("{");
            sb.append("\"topologyName\":\"Global Core Edge Data Center Network\",");
            sb.append("\"vertexCount\":").append(net.getVertexCount()).append(",");
            sb.append("\"maxFlowMbps\":").append(result.getMaxFlow()).append(",");
            sb.append("\"minCutCapacityMbps\":").append(result.getMinCutCapacity()).append(",");
            sb.append("\"theoremVerified\":").append(result.isMaxFlowEqualsMinCut()).append(",");
            sb.append("\"executionTimeMicros\":").append(result.getExecutionTimeMicros()).append(",");
            sb.append("\"phases\":").append(result.getIterationsOrPhases()).append(",");
            sb.append("\"cutEdgesCount\":").append(result.getMinCutEdges().size());
            sb.append("}");

            sendJsonResponse(exchange, 200, sb.toString());
        }
    }

    private static class ComputeFlowHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            FlowNetwork net = PerformanceComparator.createDatacenterTopology();
            DinicsAlgorithm dinic = new DinicsAlgorithm();
            AlgorithmResult result = dinic.computeMaxFlow(net, net.getSource(), net.getSink());

            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append("\"algorithm\":\"").append(result.getAlgorithmName()).append("\",");
            json.append("\"maxFlow\":").append(result.getMaxFlow()).append(",");
            json.append("\"minCutCapacity\":").append(result.getMinCutCapacity()).append(",");
            json.append("\"theoremHolds\":").append(result.isMaxFlowEqualsMinCut()).append(",");
            json.append("\"executionTimeMicros\":").append(result.getExecutionTimeMicros()).append(",");
            json.append("\"phases\":").append(result.getIterationsOrPhases()).append(",");
            json.append("\"totalAugmentations\":").append(result.getTotalAugmentations()).append(",");
            json.append("\"flowConservationValid\":").append(result.isFlowConservationValid()).append(",");
            json.append("\"partitionS\":").append(result.getPartitionS().toString()).append(",");
            json.append("\"partitionT\":").append(result.getPartitionT().toString()).append(",");
            json.append("\"saturatedCutEdges\":[");
            for (int i = 0; i < result.getMinCutEdges().size(); i++) {
                FlowEdge e = result.getMinCutEdges().get(i);
                if (i > 0) json.append(",");
                json.append("{\"from\":").append(e.getFrom())
                    .append(",\"to\":").append(e.getTo())
                    .append(",\"capacity\":").append(e.getCapacity())
                    .append(",\"flow\":").append(e.getFlow())
                    .append(",\"label\":\"").append(e.getLabel()).append("\"}");
            }
            json.append("]}");

            sendJsonResponse(exchange, 200, json.toString());
        }
    }

    private static class CompareAlgorithmsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            FlowNetwork net = PerformanceComparator.createDatacenterTopology();
            PerformanceComparator.BenchmarkComparison comp = PerformanceComparator.runComparison("Datacenter Backbone", net);

            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append("\"topology\":\"").append(comp.topologyName).append("\",");
            json.append("\"nodes\":").append(comp.vertexCount).append(",");
            json.append("\"edges\":").append(comp.edgeCount).append(",");
            json.append("\"speedupFactor\":").append(comp.speedupFactor).append(",");
            json.append("\"dinics\":{")
                .append("\"maxFlow\":").append(comp.dinicsResult.getMaxFlow()).append(",")
                .append("\"timeMicros\":").append(comp.dinicsResult.getExecutionTimeMicros()).append(",")
                .append("\"phases\":").append(comp.dinicsResult.getIterationsOrPhases()).append(",")
                .append("\"augmentations\":").append(comp.dinicsResult.getTotalAugmentations())
                .append("},");
            json.append("\"edmondsKarp\":{")
                .append("\"maxFlow\":").append(comp.edmondsKarpResult.getMaxFlow()).append(",")
                .append("\"timeMicros\":").append(comp.edmondsKarpResult.getExecutionTimeMicros()).append(",")
                .append("\"augmentations\":").append(comp.edmondsKarpResult.getTotalAugmentations())
                .append("},");
            json.append("\"fordFulkerson\":{")
                .append("\"maxFlow\":").append(comp.fordFulkersonResult.getMaxFlow()).append(",")
                .append("\"timeMicros\":").append(comp.fordFulkersonResult.getExecutionTimeMicros()).append(",")
                .append("\"augmentations\":").append(comp.fordFulkersonResult.getTotalAugmentations())
                .append("}");
            json.append("}");

            sendJsonResponse(exchange, 200, json.toString());
        }
    }

    private static class StagesVisualizerHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            FlowNetwork net = PerformanceComparator.createDatacenterTopology();
            DinicsAlgorithm dinic = new DinicsAlgorithm();
            dinic.computeMaxFlow(net, net.getSource(), net.getSink());

            StringBuilder json = new StringBuilder();
            json.append("{\"stages\":[");
            for (int i = 0; i < dinic.getStages().size(); i++) {
                DinicsAlgorithm.DinicStage stage = dinic.getStages().get(i);
                if (i > 0) json.append(",");
                json.append("{")
                    .append("\"phase\":").append(stage.phaseNumber).append(",")
                    .append("\"flowPushed\":").append(stage.flowPushedInPhase).append(",")
                    .append("\"cumulativeMaxFlow\":").append(stage.cumulativeMaxFlow).append(",")
                    .append("\"description\":\"").append(stage.description).append("\",")
                    .append("\"levels\":[");
                for (int l = 0; l < stage.levels.length; l++) {
                    if (l > 0) json.append(",");
                    json.append(stage.levels[l]);
                }
                json.append("]}");
            }
            json.append("]}");

            sendJsonResponse(exchange, 200, json.toString());
        }
    }

    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    public static void main(String[] args) throws IOException {
        int port = DEFAULT_PORT;
        if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException ignored) {}
        }
        NetworkFlowServer server = new NetworkFlowServer(port);
        server.start();
    }
}
