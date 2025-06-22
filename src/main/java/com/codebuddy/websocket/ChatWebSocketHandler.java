package com.codebuddy.websocket;

import com.codebuddy.model.Message;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * WebSocket handler for real-time chat
 */
@Component
public class ChatWebSocketHandler implements WebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Map of sessionId -> Set of WebSocket sessions
    private final ConcurrentHashMap<String, CopyOnWriteArraySet<WebSocketSession>> chatConnections = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = extractSessionId(session);
        if (sessionId != null) {
            chatConnections.computeIfAbsent(sessionId, k -> new CopyOnWriteArraySet<>()).add(session);
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        String sessionId = extractSessionId(session);
        if (sessionId == null) return;

        try {
            JsonNode messageNode = objectMapper.readTree(message.getPayload().toString());
            String type = messageNode.get("type").asText();
            
            if ("chat_message".equals(type)) {
                handleChatMessage(sessionId, messageNode, session);
            } else if ("user_typing".equals(type)) {
                handleUserTyping(sessionId, messageNode, session);
            }
        } catch (Exception e) {
            sendErrorMessage(session, "Error processing chat message: " + e.getMessage());
        }
    }

    private void handleChatMessage(String sessionId, JsonNode messageNode, WebSocketSession senderSession) throws IOException {
        String userId = messageNode.get("userId").asText();
        String username = messageNode.get("username").asText();
        String content = messageNode.get("content").asText();
        
        Message chatMessage = new Message(sessionId, userId, username, content, Message.MessageType.CHAT);
        
        String broadcastMessage = objectMapper.writeValueAsString(Map.of(
            "type", "chat_message",
            "userId", userId,
            "username", username,
            "content", content,
            "timestamp", chatMessage.getTimestamp().toString()
        ));
        
        broadcastToSession(sessionId, broadcastMessage, null); // Include sender
    }

    private void handleUserTyping(String sessionId, JsonNode messageNode, WebSocketSession senderSession) throws IOException {
        String userId = messageNode.get("userId").asText();
        String username = messageNode.get("username").asText();
        boolean isTyping = messageNode.get("isTyping").asBoolean();
        
        String broadcastMessage = objectMapper.writeValueAsString(Map.of(
            "type", "user_typing",
            "userId", userId,
            "username", username,
            "isTyping", isTyping
        ));
        
        broadcastToSession(sessionId, broadcastMessage, senderSession);
    }

    private void broadcastToSession(String sessionId, String message, WebSocketSession excludeSession) {
        CopyOnWriteArraySet<WebSocketSession> sessions = chatConnections.get(sessionId);
        if (sessions != null) {
            sessions.forEach(session -> {
                if (session != excludeSession && session.isOpen()) {
                    try {
                        session.sendMessage(new TextMessage(message));
                    } catch (IOException e) {
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
        String sessionId = extractSessionId(session);
        if (sessionId != null) {
            CopyOnWriteArraySet<WebSocketSession> sessions = chatConnections.get(sessionId);
            if (sessions != null) {
                sessions.remove(session);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        String sessionId = extractSessionId(session);
        if (sessionId != null) {
            CopyOnWriteArraySet<WebSocketSession> sessions = chatConnections.get(sessionId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    chatConnections.remove(sessionId);
                }
            }
        }
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }
}