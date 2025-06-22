package com.codebuddy.model;

import java.time.LocalDateTime;

/**
 * Represents an AI assistance response
 */
public class AIResponse {
    private String requestId;
    private String sessionId;
    private String userId;
    private String response;
    private String suggestedCode;
    private boolean success;
    private String error;
    private LocalDateTime timestamp;

    // Constructors
    public AIResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public AIResponse(String sessionId, String userId, String response) {
        this();
        this.sessionId = sessionId;
        this.userId = userId;
        this.response = response;
        this.success = true;
    }

    // Getters and Setters
    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

    public String getSuggestedCode() { return suggestedCode; }
    public void setSuggestedCode(String suggestedCode) { this.suggestedCode = suggestedCode; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}