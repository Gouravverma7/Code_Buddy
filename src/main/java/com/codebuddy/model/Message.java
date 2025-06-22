package com.codebuddy.model;

import java.time.LocalDateTime;

/**
 * Represents a chat message in a coding session
 */
public class Message {
    private String id;
    private String sessionId;
    private String userId;
    private String username;
    private String content;
    private MessageType type;
    private LocalDateTime timestamp;

    public enum MessageType {
        CHAT, CODE_CHANGE, USER_JOIN, USER_LEAVE, AI_RESPONSE
    }

    // Constructors
    public Message() {
        this.timestamp = LocalDateTime.now();
    }

    public Message(String sessionId, String userId, String username, String content, MessageType type) {
        this();
        this.sessionId = sessionId;
        this.userId = userId;
        this.username = username;
        this.content = content;
        this.type = type;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}