package com.codebuddy.model;

/**
 * Represents an AI assistance request
 */
public class AIRequest {
    private String sessionId;
    private String userId;
    private String code;
    private String language;
    private AIAction action;
    private String context;

    public enum AIAction {
        EXPLAIN, FIX_BUGS, ADD_COMMENTS, GENERATE_FUNCTION, OPTIMIZE, REVIEW
    }

    // Constructors
    public AIRequest() {}

    public AIRequest(String sessionId, String userId, String code, String language, AIAction action) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.code = code;
        this.language = language;
        this.action = action;
    }

    // Getters and Setters
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public AIAction getAction() { return action; }
    public void setAction(AIAction action) { this.action = action; }

    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }
}