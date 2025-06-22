package com.codebuddy.websocket;

import com.codebuddy.service.SessionService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * WebSocket handler for real-time code synchronization
 */
@Component
public class CodeWebSocketHandler implements WebSocketHandler {

    @Autowired
    private SessionService sessionService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Map of sessionId -> Set of WebSocket sessions
    private final ConcurrentHashMap<String, CopyOnWriteArraySet<WebSocketSession>> sessionConnections = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = extractSessionId(session);
        if (sessionId != null) {
            sessionConnections.computeIfAbsent(sessionId, k -> new CopyOnWriteArraySet<>()).add(session);
            
            // Send welcome message
            String welcomeMessage = objectMapper.writeValueAsString(Map.of(
                "type", "connection_established",
                "sessionId", sessionId,
                "message", "Connected to coding session"
            ));
            session.sendMessage(new TextMessage(welcomeMessage));
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        String sessionId = extractSessionId(session);
        if (sessionId == null) return;

        try {
            JsonNode messageNode = objectMapper.readTree(message.getPayload().toString());
            String type = messageNode.get("type").asText();
            
            switch (type) {
                case "code_change":
                    handleCodeChange(sessionId, messageNode, session);
                    break;
                case "cursor_position":
                    handleCursorPosition(sessionId, messageNode, session);
                    break;
                case "file_create":
                    handleFileCreate(sessionId, messageNode, session);
                    break;
                case "file_delete":
                    handleFileDelete(sessionId, messageNode, session);
                    break;
            }
        } catch (Exception e) {
            sendErrorMessage(session, "Error processing message: " + e.getMessage());
        }
    }

    private void handleCodeChange(String sessionId, JsonNode messageNode, WebSocketSession senderSession) throws IOException {
        String filename = messageNode.get("filename").asText();
        String content = messageNode.get("content").asText();
        String userId = messageNode.get("userId").asText();
        
        // Update session in database
        sessionService.updateSessionCode(sessionId, filename, content);
        
        // Broadcast to all other clients in the session
        String broadcastMessage = objectMapper.writeValueAsString(Map.of(
            "type", "code_change",
            "filename", filename,
            "content", content,
            "userId", userId,
            "timestamp", System.currentTimeMillis()
        ));
        
        broadcastToSession(sessionId, broadcastMessage, senderSession);
    }

    private void handleCursorPosition(String sessionId, JsonNode messageNode, WebSocketSession senderSession) throws IOException {
        String userId = messageNode.get("userId").asText();
        int line = messageNode.get("line").asInt();
        int column = messageNode.get("column").asInt();
        
        String broadcastMessage = objectMapper.writeValueAsString(Map.of(
            "type", "cursor_position",
            "userId", userId,
            "line", line,
            "column", column
        ));
        
        broadcastToSession(sessionId, broadcastMessage, senderSession);
    }

    private void handleFileCreate(String sessionId, JsonNode messageNode, WebSocketSession senderSession) throws IOException {
        String filename = messageNode.get("filename").asText();
        String userId = messageNode.get("userId").asText();
        
        // Create empty file in session
        sessionService.updateSessionCode(sessionId, filename, "");
        
        String broadcastMessage = objectMapper.writeValueAsString(Map.of(
            "type", "file_create",
            "filename", filename,
            "userId", userId
        ));
        
        broadcastToSession(sessionId, broadcastMessage, senderSession);
    }

    private void handleFileDelete(String sessionId, JsonNode messageNode, WebSocketSession senderSession) throws IOException {
        String filename = messageNode.get("filename").asText();
        String userId = messageNode.get("userId").asText();
        
        String broadcastMessage = objectMapper.writeValueAsString(Map.of(
            "type", "file_delete",
            "filename", filename,
            "userId", userId
        ));
        
        broadcastToSession(sessionId, broadcastMessage, senderSession);
    }

    private void broadcastToSession(String sessionId, String message, WebSocketSession excludeSession) {
        CopyOnWriteArraySet<WebSocketSession> sessions = sessionConnections.get(sessionId);
        if (sessions != null) {
            sessions.forEach(session -> {
                if (session != excludeSession && session.isOpen()) {
                    try {
                        session.sendMessage(new TextMessage(message));
                    } catch (IOException e) {
                        // Remove broken connection
                        sessions.remove(session);
                    }
                }
            });
        }
    }

    private void sendErrorMessage(WebSocketSession session, String error) {
        try {
            String errorMessage = objectMapper.writeValueAsString(Map.of(
                "type", "error",
                "message", error
            ));
            session.sendMessage(new TextMessage(errorMessage));
        } catch (IOException e) {
            // Log error
        }
    }

    private String extractSessionId(WebSocketSession session) {
        String path = session.getUri().getPath();
        String[] parts = path.split("/");
        return parts.length > 0 ? parts[parts.length - 1] : null;
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        // Log error and clean up
        String sessionId = extractSessionId(session);
        if (sessionId != null) {
            CopyOnWriteArraySet<WebSocketSession> sessions = sessionConnections.get(sessionId);
            if (sessions != null) {
                sessions.remove(session);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        String sessionId = extractSessionId(session);
        if (sessionId != null) {
            CopyOnWriteArraySet<WebSocketSession> sessions = sessionConnections.get(sessionId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    sessionConnections.remove(sessionId);
                }
            }
        }
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }
}