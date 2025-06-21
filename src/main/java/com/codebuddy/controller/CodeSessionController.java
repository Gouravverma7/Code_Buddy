package com.codebuddy.controller;

import com.codebuddy.model.CodeSession;
import com.codebuddy.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for managing coding sessions
 */
@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class CodeSessionController {

    @Autowired
    private SessionService sessionService;

    @PostMapping
    public ResponseEntity<CodeSession> createSession(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String ownerId = request.get("ownerId");
        String language = request.get("language");
        
        CodeSession session = sessionService.createSession(name, ownerId, language);
        return ResponseEntity.ok(session);
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<CodeSession> getSession(@PathVariable String sessionId) {
        return sessionService.getSession(sessionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CodeSession>> getUserSessions(@PathVariable String userId) {
        List<CodeSession> sessions = sessionService.getUserSessions(userId);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/active")
    public ResponseEntity<List<CodeSession>> getActiveSessions() {
        List<CodeSession> sessions = sessionService.getActiveSessions();
        return ResponseEntity.ok(sessions);
    }

    @PutMapping("/{sessionId}/code")
    public ResponseEntity<CodeSession> updateCode(
            @PathVariable String sessionId,
            @RequestBody Map<String, String> request) {
        String filename = request.get("filename");
        String content = request.get("content");
        
        CodeSession session = sessionService.updateSessionCode(sessionId, filename, content);
        if (session != null) {
            return ResponseEntity.ok(session);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{sessionId}/collaborators")
    public ResponseEntity<CodeSession> addCollaborator(
            @PathVariable String sessionId,
            @RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        
        CodeSession session = sessionService.addCollaborator(sessionId, userId);
        if (session != null) {
            return ResponseEntity.ok(session);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable String sessionId) {
        sessionService.deleteSession(sessionId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{sessionId}/deactivate")
    public ResponseEntity<CodeSession> deactivateSession(@PathVariable String sessionId) {
        CodeSession session = sessionService.deactivateSession(sessionId);
        if (session != null) {
            return ResponseEntity.ok(session);
        }
        return ResponseEntity.notFound().build();
    }
}