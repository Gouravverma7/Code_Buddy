package com.codebuddy.desktop.component;

import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;

/**
 * AI assistant component for code assistance
 */
public class AIResponsePane extends VBox {

    private final TextArea responseArea;
    private final TextArea codeArea;
    private final Button explainButton;
    private final Button fixButton;
    private final Button commentButton;
    private final Button optimizeButton;
    private final ProgressIndicator loadingIndicator;

    public AIResponsePane() {
        setSpacing(10);
        setPadding(new Insets(10));
        
        // AI response area
        responseArea = new TextArea();
        responseArea.setEditable(false);
        responseArea.setWrapText(true);
        responseArea.setPrefRowCount(8);
        responseArea.setPromptText("AI responses will appear here...");
        
        // Code suggestion area
        codeArea = new TextArea();
        codeArea.setEditable(false);
        codeArea.setWrapText(true);
        codeArea.setPrefRowCount(6);
        codeArea.setPromptText("Code suggestions will appear here...");
        codeArea.setStyle("-fx-font-family: 'Courier New', monospace;");
        
        // Action buttons
        explainButton = new Button("Explain Code");
        fixButton = new Button("Fix Bugs");
        commentButton = new Button("Add Comments");
        optimizeButton = new Button("Optimize");
        
        explainButton.setOnAction(e -> showInfo("Select code in the editor first, then use the AI menu"));
        fixButton.setOnAction(e -> showInfo("Select code in the editor first, then use the AI menu"));
        commentButton.setOnAction(e -> showInfo("Select code in the editor first, then use the AI menu"));
        optimizeButton.setOnAction(e -> showInfo("Select code in the editor first, then use the AI menu"));
        
        HBox buttonBox = new HBox(5);
        buttonBox.getChildren().addAll(explainButton, fixButton, commentButton, optimizeButton);
        
        // Loading indicator
        loadingIndicator = new ProgressIndicator();
        loadingIndicator.setVisible(false);
        loadingIndicator.setPrefSize(30, 30);
        
        VBox.setVgrow(responseArea, Priority.ALWAYS);
        
        getChildren().addAll(
            new Label("AI Assistant"),
            buttonBox,
            new Label("Response:"),
            responseArea,
            new Label("Code Suggestion:"),
            codeArea,
            loadingIndicator
        );
        
        // Add sample response
        addSampleResponse();
    }

    public void requestExplanation(String code, String language) {
        showLoading(true);
        responseArea.setText("Analyzing code...");
        
        // Simulate AI response (in real implementation, this would call the AI service)
        Platform.runLater(() -> {
            try {
                Thread.sleep(2000); // Simulate processing time
                showLoading(false);
                responseArea.setText("This code defines a Java class called 'HelloWorld' with a constructor that takes a message parameter. The class has a method 'printMessage()' that prints a greeting, and a main method that demonstrates creating an instance and using it. The code also shows Java 8 streams to filter and print even numbers from a list.");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }

    public void requestBugFix(String code, String language) {
        showLoading(true);
        responseArea.setText("Looking for bugs...");
        
        Platform.runLater(() -> {
            try {
                Thread.sleep(2000);
                showLoading(false);
                responseArea.setText("No critical bugs found in the selected code. However, consider adding null checks for the message parameter in the constructor to make the code more robust.");
                codeArea.setText("""
                    public HelloWorld(String message) {
                        if (message == null) {
                            throw new IllegalArgumentException("Message cannot be null");
                        }
                        this.message = message;
                    }
                    """);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }

    public void requestComments(String code, String language) {
        showLoading(true);
        responseArea.setText("Adding comments...");
        
        Platform.runLater(() -> {
            try {
                Thread.sleep(2000);
                showLoading(false);
                responseArea.setText("I've added comprehensive comments to explain the code structure and functionality.");
                codeArea.setText("""
                    /**
                     * Prints a personalized greeting message to the console
                     */
                    public void printMessage() {
                        // Concatenate greeting with the stored message and print
                        System.out.println("Hello, " + message + "!");
                    }
                    """);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }

    private void showLoading(boolean show) {
        Platform.runLater(() -> loadingIndicator.setVisible(show));
    }

    private void showInfo(String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle("AI Assistant");
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }

    private void addSampleResponse() {
        responseArea.setText("Welcome to CodeBuddy.ai AI Assistant!\n\nSelect code in the editor and use the AI menu or buttons above to get help with:\n• Code explanations\n• Bug fixes\n• Adding comments\n• Code optimization\n• Code reviews");
    }
}