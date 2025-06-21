package com.codebuddy.controller;

import com.codebuddy.model.CodeSession;
import com.codebuddy.service.GitHubService;
import com.codebuddy.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for GitHub integration
 */
@RestController
@RequestMapping("/api/github")
@CrossOrigin(origins = "*")
public class GitHubController {

    @Autowired
    private GitHubService gitHubService;

    @Autowired
    private SessionService sessionService;

    @PostMapping("/export/repository")
    public ResponseEntity<Map<String, String>> exportToRepository(@RequestBody Map<String, String> request) {
        try {
            String accessToken = request.get("accessToken");
            String repoName = request.get("repoName");
            String sessionId = request.get("sessionId");
            
            CodeSession session = sessionService.getSession(sessionId).orElse(null);
            if (session == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Session not found"));
            }
            
            String repoUrl = gitHubService.exportToRepository(accessToken, repoName, session);
            return ResponseEntity.ok(Map.of("url", repoUrl, "message", "Successfully exported to GitHub repository"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/export/gist")
    public ResponseEntity<Map<String, String>> exportToGist(@RequestBody Map<String, String> request) {
        try {
            String accessToken = request.get("accessToken");
            String sessionId = request.get("sessionId");
            
            CodeSession session = sessionService.getSession(sessionId).orElse(null);
            if (session == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Session not found"));
            }
            
            String gistUrl = gitHubService.exportToGist(accessToken, session);
            return ResponseEntity.ok(Map.of("url", gistUrl, "message", "Successfully exported to GitHub Gist"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}