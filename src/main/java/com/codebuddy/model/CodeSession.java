package com.codebuddy.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Represents a collaborative coding session
 */
@Document(collection = "code_sessions")
public class CodeSession {
    @Id
    private String id;
    private String name;
    private String ownerId;
    private List<String> collaborators;
    private Map<String, String> files; // filename -> content
    private String language;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isActive;

    // Constructors
    public CodeSession() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isActive = true;
    }

    public CodeSession(String name, String ownerId, String language) {
        this();
        this.name = name;
        this.ownerId = ownerId;
        this.language = language;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public List<String> getCollaborators() { return collaborators; }
    public void setCollaborators(List<String> collaborators) { this.collaborators = collaborators; }

    public Map<String, String> getFiles() { return files; }
    public void setFiles(Map<String, String> files) { this.files = files; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}