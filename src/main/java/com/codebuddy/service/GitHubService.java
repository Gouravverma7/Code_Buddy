package com.codebuddy.service;

import com.codebuddy.model.CodeSession;
import org.kohsuke.github.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

/**
 * Service for GitHub integration
 */
@Service
public class GitHubService {

    @Value("${github.client.id:}")
    private String clientId;

    @Value("${github.client.secret:}")
    private String clientSecret;

    public String exportToRepository(String accessToken, String repoName, CodeSession session) {
        try {
            GitHub github = new GitHubBuilder().withOAuthToken(accessToken).build();
            GHUser user = github.getMyself();
            
            // Create or get repository
            GHRepository repo;
            try {
                repo = user.getRepository(repoName);
            } catch (IOException e) {
                repo = user.createRepository(repoName)
                    .description("CodeBuddy.ai collaborative session: " + session.getName())
                    .create();
            }
            
            // Add files to repository
            for (Map.Entry<String, String> file : session.getFiles().entrySet()) {
                try {
                    GHContentBuilder contentBuilder = repo.createContent()
                        .content(file.getValue())
                        .path(file.getKey())
                        .message("CodeBuddy.ai session export: " + session.getName());
                    
                    contentBuilder.commit();
                } catch (IOException e) {
                    // File might already exist, try to update
                    GHContent existingFile = repo.getFileContent(file.getKey());
                    existingFile.update(file.getValue(), "Update from CodeBuddy.ai session: " + session.getName());
                }
            }
            
            return repo.getHtmlUrl().toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to export to GitHub: " + e.getMessage(), e);
        }
    }

    public String exportToGist(String accessToken, CodeSession session) {
        try {
            GitHub github = new GitHubBuilder().withOAuthToken(accessToken).build();
            
            GHGistBuilder gistBuilder = github.createGist()
                .description("CodeBuddy.ai session: " + session.getName())
                .public_(false);
            
            for (Map.Entry<String, String> file : session.getFiles().entrySet()) {
                gistBuilder.file(file.getKey(), file.getValue());
            }
            
            GHGist gist = gistBuilder.create();
            return gist.getHtmlUrl().toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to export to Gist: " + e.getMessage(), e);
        }
    }
}