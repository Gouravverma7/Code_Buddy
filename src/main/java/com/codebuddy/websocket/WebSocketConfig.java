package com.codebuddy.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket configuration for real-time collaboration
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final CodeWebSocketHandler codeWebSocketHandler;
    private final ChatWebSocketHandler chatWebSocketHandler;

    public WebSocketConfig(CodeWebSocketHandler codeWebSocketHandler, ChatWebSocketHandler chatWebSocketHandler) {
        this.codeWebSocketHandler = codeWebSocketHandler;
        this.chatWebSocketHandler = chatWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(codeWebSocketHandler, "/ws/code/{sessionId}")
                .setAllowedOrigins("*");
        
        registry.addHandler(chatWebSocketHandler, "/ws/chat/{sessionId}")
                .setAllowedOrigins("*");
    }
}