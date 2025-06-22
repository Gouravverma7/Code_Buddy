package com.codebuddy.desktop.component;

import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Chat component for team communication
 */
public class ChatPane extends VBox {

    private final ListView<ChatMessage> chatListView;
    private final TextField messageField;
    private final Button sendButton;

    public ChatPane() {
        setSpacing(10);
        setPadding(new Insets(10));
        
        // Chat messages list
        chatListView = new ListView<>();
        chatListView.setCellFactory(listView -> new ChatMessageCell());
        VBox.setVgrow(chatListView, Priority.ALWAYS);
        
        // Message input
        messageField = new TextField();
        messageField.setPromptText("Type a message...");
        messageField.setOnAction(e -> sendMessage());
        
        sendButton = new Button("Send");
        sendButton.setOnAction(e -> sendMessage());
        
        HBox inputBox = new HBox(5);
        inputBox.getChildren().addAll(messageField, sendButton);
        HBox.setHgrow(messageField, Priority.ALWAYS);
        
        getChildren().addAll(
            new Label("Team Chat"),
            chatListView,
            inputBox
        );
        
        // Add some sample messages
        addSampleMessages();
    }

    private void sendMessage() {
        String text = messageField.getText().trim();
        if (!text.isEmpty()) {
            ChatMessage message = new ChatMessage("You", text, LocalDateTime.now(), true);
            addMessage(message);
            messageField.clear();
            
            // Here you would send the message via WebSocket
            // webSocketClient.sendChatMessage(text);
        }
    }

    public void addMessage(ChatMessage message) {
        Platform.runLater(() -> {
            chatListView.getItems().add(message);
            chatListView.scrollTo(chatListView.getItems().size() - 1);
        });
    }

    private void addSampleMessages() {
        addMessage(new ChatMessage("Alice", "Hey everyone! Ready to start coding?", LocalDateTime.now().minusMinutes(5), false));
        addMessage(new ChatMessage("Bob", "Yes! I've got some ideas for the algorithm", LocalDateTime.now().minusMinutes(3), false));
        addMessage(new ChatMessage("Charlie", "Let me share my screen", LocalDateTime.now().minusMinutes(1), false));
    }

    public static class ChatMessage {
        private final String username;
        private final String content;
        private final LocalDateTime timestamp;
        private final boolean isOwnMessage;

        public ChatMessage(String username, String content, LocalDateTime timestamp, boolean isOwnMessage) {
            this.username = username;
            this.content = content;
            this.timestamp = timestamp;
            this.isOwnMessage = isOwnMessage;
        }

        public String getUsername() { return username; }
        public String getContent() { return content; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public boolean isOwnMessage() { return isOwnMessage; }
    }

    private static class ChatMessageCell extends ListCell<ChatMessage> {
        @Override
        protected void updateItem(ChatMessage message, boolean empty) {
            super.updateItem(message, empty);
            
            if (empty || message == null) {
                setGraphic(null);
            } else {
                VBox messageBox = new VBox(2);
                
                // Header with username and timestamp
                HBox header = new HBox(5);
                Label usernameLabel = new Label(message.getUsername());
                usernameLabel.setStyle("-fx-font-weight: bold;");
                
                Label timestampLabel = new Label(message.getTimestamp().format(DateTimeFormatter.ofPattern("HH:mm")));
                timestampLabel.setStyle("-fx-text-fill: gray; -fx-font-size: 10px;");
                
                header.getChildren().addAll(usernameLabel, timestampLabel);
                
                // Message content
                Label contentLabel = new Label(message.getContent());
                contentLabel.setWrapText(true);
                
                messageBox.getChildren().addAll(header, contentLabel);
                
                // Style own messages differently
                if (message.isOwnMessage()) {
                    messageBox.setStyle("-fx-background-color: #e3f2fd; -fx-padding: 5; -fx-background-radius: 5;");
                    messageBox.setAlignment(Pos.CENTER_RIGHT);
                } else {
                    messageBox.setStyle("-fx-background-color: #f5f5f5; -fx-padding: 5; -fx-background-radius: 5;");
                    messageBox.setAlignment(Pos.CENTER_LEFT);
                }
                
                setGraphic(messageBox);
            }
        }
    }
}