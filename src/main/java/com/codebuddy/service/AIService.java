package com.codebuddy.service;

import com.codebuddy.model.AIRequest;
import com.codebuddy.model.AIResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Service for AI assistance using OpenAI API
 */
@Service
public class AIService {

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String openaiApiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public AIResponse processRequest(AIRequest request) {
        try {
            String prompt = buildPrompt(request);
            String aiResponse = callOpenAI(prompt);
            
            AIResponse response = new AIResponse(request.getSessionId(), request.getUserId(), aiResponse);
            
            // Extract code suggestions if present
            if (aiResponse.contains("```")) {
                String suggestedCode = extractCodeFromResponse(aiResponse);
                response.setSuggestedCode(suggestedCode);
            }
            
            return response;
        } catch (Exception e) {
            AIResponse errorResponse = new AIResponse();
            errorResponse.setSessionId(request.getSessionId());
            errorResponse.setUserId(request.getUserId());
            errorResponse.setSuccess(false);
            errorResponse.setError("AI service error: " + e.getMessage());
            return errorResponse;
        }
    }

    private String buildPrompt(AIRequest request) {
        StringBuilder prompt = new StringBuilder();
        
        switch (request.getAction()) {
            case EXPLAIN:
                prompt.append("Please explain the following ").append(request.getLanguage()).append(" code:\n\n");
                break;
            case FIX_BUGS:
                prompt.append("Please identify and fix any bugs in the following ").append(request.getLanguage()).append(" code:\n\n");
                break;
            case ADD_COMMENTS:
                prompt.append("Please add helpful comments to the following ").append(request.getLanguage()).append(" code:\n\n");
                break;
            case GENERATE_FUNCTION:
                prompt.append("Please generate a ").append(request.getLanguage()).append(" function based on this description:\n\n");
                break;
            case OPTIMIZE:
                prompt.append("Please optimize the following ").append(request.getLanguage()).append(" code for better performance:\n\n");
                break;
            case REVIEW:
                prompt.append("Please review the following ").append(request.getLanguage()).append(" code and provide suggestions:\n\n");
                break;
        }
        
        prompt.append("```").append(request.getLanguage().toLowerCase()).append("\n");
        prompt.append(request.getCode());
        prompt.append("\n```");
        
        if (request.getContext() != null && !request.getContext().isEmpty()) {
            prompt.append("\n\nAdditional context: ").append(request.getContext());
        }
        
        return prompt.toString();
    }

    private String callOpenAI(String prompt) throws IOException {
        if (openaiApiKey == null || openaiApiKey.isEmpty()) {
            return "AI service is not configured. Please set your OpenAI API key.";
        }

        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost post = new HttpPost(openaiApiUrl);
            post.setHeader("Authorization", "Bearer " + openaiApiKey);
            post.setHeader("Content-Type", "application/json");

            String requestBody = String.format("""
                {
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a helpful coding assistant. Provide clear, concise explanations and suggestions."
                        },
                        {
                            "role": "user",
                            "content": "%s"
                        }
                    ],
                    "max_tokens": 1000,
                    "temperature": 0.7
                }
                """, prompt.replace("\"", "\\\"").replace("\n", "\\n"));

            post.setEntity(new StringEntity(requestBody, StandardCharsets.UTF_8));

            try (CloseableHttpResponse response = client.execute(post)) {
                String responseBody = new String(response.getEntity().getContent().readAllBytes(), StandardCharsets.UTF_8);
                JsonNode jsonResponse = objectMapper.readTree(responseBody);
                
                if (jsonResponse.has("choices") && jsonResponse.get("choices").size() > 0) {
                    return jsonResponse.get("choices").get(0).get("message").get("content").asText();
                } else if (jsonResponse.has("error")) {
                    return "AI Error: " + jsonResponse.get("error").get("message").asText();
                } else {
                    return "Unexpected response from AI service.";
                }
            }
        }
    }

    private String extractCodeFromResponse(String response) {
        int startIndex = response.indexOf("```");
        if (startIndex == -1) return null;
        
        int endIndex = response.indexOf("```", startIndex + 3);
        if (endIndex == -1) return null;
        
        String codeBlock = response.substring(startIndex + 3, endIndex);
        // Remove language identifier if present
        int newlineIndex = codeBlock.indexOf('\n');
        if (newlineIndex > 0 && newlineIndex < 20) {
            return codeBlock.substring(newlineIndex + 1);
        }
        
        return codeBlock;
    }
}