package com.codebuddy.desktop.websocket;

import com.codebuddy.desktop.component.ChatPane;
import com.codebuddy.desktop.component.CodeEditorPane;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

import java.net.URI;
import java.time.LocalDateTime;

/**
 * WebSocket client for desktop application
 */
public class DesktopWebSocketClient {

    private final String sessionId;
    private final CodeEditorPane codeEditor;
    private final ChatPane chatPane;
    private final ObjectMapper objectMapper;
    
    private WebSocketClient codeWebSocket;
    private WebSocketClient chatWebSocket;

    public DesktopWebSocketClient(String sessionId, CodeEditorPane codeEditor, ChatPane chatPane) {
        this.sessionId = sessionId;
        this.codeEditor = codeEditor;
        this.chatPane = chatPane;
        this.objectMapper = new ObjectMapper();
    }

    public void connect() throws Exception {
        // Connect to code WebSocket
        URI codeUri = new URI("ws://localhost:8080/ws/code/" + sessionId);
        codeWebSocket = new WebSocketClient(codeUri) {
            @Override
            public void onOpen(ServerHandshake handshake) {
                System.out.println("Connected to code WebSocket");
            }

            @Override
            public void onMessage(String message) {
                handleCodeMessage(message);
            }

            @Override
            public void onClose(int code, String reason, boolean remote) {
                System.out.println("Code WebSocket closed: " + reason);
            }

            @Override
            public void onError(Exception ex) {
                System.err.println("Code WebSocket error: " + ex.getMessage());
            }
        };

        // Connect to chat WebSocket
        URI chatUri = new URI("ws://localhost:8080/ws/chat/" + sessionId);
        chatWebSocket = new WebSocketClient(chatUri) {
            @Override
            public void onOpen(ServerHandshake handshake) {
                System.out.println("Connected to chat WebSocket");
            }

            @Override
            public void onMessage(String message) {
                handleChatMessage(message);
            }

            @Override
            public void onClose(int code, String reason, boolean remote) {
                System.out.println("Chat WebSocket closed: " + reason);
            }

            @Override
            public void onError(Exception ex) {
                System.err.println("Chat WebSocket error: " + ex.getMessage());
            }
        };

        codeWebSocket.connect();
        chatWebSocket.connect();
    }

    public void disconnect() {
        if (codeWebSocket != null) {
            codeWebSocket.close();
        }
        if (chatWebSocket != null) {
            chatWebSocket.close();
        }
    }

    private void handleCodeMessage(String message) {
        try {
            JsonNode messageNode = objectMapper.readTree(message);
            String type = messageNode.get("type").asText();
            
            switch (type) {
                case "code_change":
                    String content = messageNode.get("content").asText();
                    // Update code editor (be careful to avoid infinite loops)
                    // codeEditor.setText(content);
                    break;
                case "connection_established":
                    System.out.println("Code connection established");
                    break;
            }
        } catch (Exception e) {
            System.err.println("Error handling code message: " + e.getMessage());
        }
    }

    private void handleChatMessage(String message) {
        try {
            JsonNode messageNode = objectMapper.readTree(message);
            String type = messageNode.get("type").asText();
            
            if ("chat_message".equals(type)) {
                String username = messageNode.get("username").asText();
                String content = messageNode.get("content").asText();
                
                ChatPane.ChatMessage chatMessage = new ChatPane.ChatMessage(
                    username, content, LocalDateTime.now(), false
                );
                chatPane.addMessage(chatMessage);
            }
        } catch (Exception e) {
            System.err.println("Error handling chat message: " + e.getMessage());
        }
    }

    public void sendCodeChange(String filename, String content) {
        if (codeWebSocket != null && codeWebSocket.isOpen()) {
            try {
                String message = objectMapper.writeValueAsString(Map.of(
                    "type", "code_change",
                    "filename", filename,
                    "content", content,
                    "userId", "desktop-user"
                ));
                codeWebSocket.send(message);
            } catch (Exception e) {
                System.err.println("Error sending code change: " + e.getMessage());
            }
        }
    }

    public void sendChatMessage(String content) {
        if (chatWebSocket != null && chatWebSocket.isOpen()) {
            try {
                String message = objectMapper.writeValueAsString(Map.of(
                    "type", "chat_message",
                    "userId", "desktop-user",
                    "username", "Desktop User",
                    "content", content
                ));
                chatWebSocket.send(message);
            } catch (Exception e) {
                System.err.println("Error sending chat message: " + e.getMessage());
            }
        }
    }
}