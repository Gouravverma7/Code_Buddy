package com.codebuddy.controller;

import com.codebuddy.model.AIRequest;
import com.codebuddy.model.AIResponse;
import com.codebuddy.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for AI assistance
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    @Autowired
    private AIService aiService;

    @PostMapping("/explain")
    public ResponseEntity<AIResponse> explainCode(@RequestBody AIRequest request) {
        request.setAction(AIRequest.AIAction.EXPLAIN);
        AIResponse response = aiService.processRequest(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/fix")
    public ResponseEntity<AIResponse> fixBugs(@RequestBody AIRequest request) {
        request.setAction(AIRequest.AIAction.FIX_BUGS);
        AIResponse response = aiService.processRequest(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/comment")
    public ResponseEntity<AIResponse> addComments(@RequestBody AIRequest request) {
        request.setAction(AIRequest.AIAction.ADD_COMMENTS);
        AIResponse response = aiService.processRequest(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate")
    public ResponseEntity<AIResponse> generateFunction(@RequestBody AIRequest request) {
        request.setAction(AIRequest.AIAction.GENERATE_FUNCTION);
        AIResponse response = aiService.processRequest(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/optimize")
    public ResponseEntity<AIResponse> optimizeCode(@RequestBody AIRequest request) {
        request.setAction(AIRequest.AIAction.OPTIMIZE);
        AIResponse response = aiService.processRequest(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/review")
    public ResponseEntity<AIResponse> reviewCode(@RequestBody AIRequest request) {
        request.setAction(AIRequest.AIAction.REVIEW);
        AIResponse response = aiService.processRequest(request);
        return ResponseEntity.ok(response);
    }
}