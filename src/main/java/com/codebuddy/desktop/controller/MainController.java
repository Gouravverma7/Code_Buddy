package com.codebuddy.desktop.controller;

import com.codebuddy.desktop.component.CodeEditorPane;
import com.codebuddy.desktop.component.ChatPane;
import com.codebuddy.desktop.component.AIResponsePane;
import com.codebuddy.desktop.websocket.DesktopWebSocketClient;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.*;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.VBox;

import java.net.URL;
import java.util.ResourceBundle;

/**
 * Main controller for the JavaFX desktop application
 */
public class MainController implements Initializable {

    @FXML private BorderPane mainPane;
    @FXML private MenuBar menuBar;
    @FXML private ToolBar toolBar;
    @FXML private TabPane fileTabPane;
    @FXML private VBox sidePanel;
    @FXML private TextField sessionIdField;
    @FXML private Button connectButton;
    @FXML private Button disconnectButton;
    @FXML private Label statusLabel;

    private CodeEditorPane codeEditor;
    private ChatPane chatPane;
    private AIResponsePane aiResponsePane;
    private DesktopWebSocketClient webSocketClient;

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        initializeComponents();
        setupEventHandlers();
        updateConnectionStatus(false);
    }

    private void initializeComponents() {
        // Initialize code editor
        codeEditor = new CodeEditorPane();
        
        // Initialize chat pane
        chatPane = new ChatPane();
        
        // Initialize AI response pane
        aiResponsePane = new AIResponsePane();
        
        // Add components to UI
        Tab editorTab = new Tab("Main.java", codeEditor);
        editorTab.setClosable(false);
        fileTabPane.getTabs().add(editorTab);
        
        // Add chat and AI panels to side panel
        TitledPane chatTitledPane = new TitledPane("Team Chat", chatPane);
        TitledPane aiTitledPane = new TitledPane("AI Assistant", aiResponsePane);
        
        Accordion accordion = new Accordion(chatTitledPane, aiTitledPane);
        accordion.setExpandedPane(chatTitledPane);
        
        sidePanel.getChildren().add(accordion);
    }

    private void setupEventHandlers() {
        connectButton.setOnAction(e -> connectToSession());
        disconnectButton.setOnAction(e -> disconnectFromSession());
        
        // Setup menu actions
        setupMenuActions();
    }

    private void setupMenuActions() {
        // File menu actions would be implemented here
        // Edit menu actions would be implemented here
        // AI menu actions would be implemented here
    }

    @FXML
    private void connectToSession() {
        String sessionId = sessionIdField.getText().trim();
        if (sessionId.isEmpty()) {
            showAlert("Error", "Please enter a session ID");
            return;
        }

        try {
            webSocketClient = new DesktopWebSocketClient(sessionId, codeEditor, chatPane);
            webSocketClient.connect();
            updateConnectionStatus(true);
            statusLabel.setText("Connected to session: " + sessionId);
        } catch (Exception e) {
            showAlert("Connection Error", "Failed to connect to session: " + e.getMessage());
        }
    }

    @FXML
    private void disconnectFromSession() {
        if (webSocketClient != null) {
            webSocketClient.disconnect();
            webSocketClient = null;
        }
        updateConnectionStatus(false);
        statusLabel.setText("Disconnected");
    }

    private void updateConnectionStatus(boolean connected) {
        connectButton.setDisable(connected);
        disconnectButton.setDisable(!connected);
        sessionIdField.setDisable(connected);
    }

    @FXML
    private void newSession() {
        // Implementation for creating new session
        showAlert("Info", "New session functionality would be implemented here");
    }

    @FXML
    private void openSession() {
        // Implementation for opening existing session
        showAlert("Info", "Open session functionality would be implemented here");
    }

    @FXML
    private void saveSession() {
        // Implementation for saving session
        showAlert("Info", "Save session functionality would be implemented here");
    }

    @FXML
    private void exportToGitHub() {
        // Implementation for GitHub export
        showAlert("Info", "GitHub export functionality would be implemented here");
    }

    @FXML
    private void explainCode() {
        String selectedCode = codeEditor.getSelectedText();
        if (selectedCode.isEmpty()) {
            showAlert("Info", "Please select code to explain");
            return;
        }
        
        aiResponsePane.requestExplanation(selectedCode, "java");
    }

    @FXML
    private void fixBugs() {
        String selectedCode = codeEditor.getSelectedText();
        if (selectedCode.isEmpty()) {
            showAlert("Info", "Please select code to fix");
            return;
        }
        
        aiResponsePane.requestBugFix(selectedCode, "java");
    }

    @FXML
    private void addComments() {
        String selectedCode = codeEditor.getSelectedText();
        if (selectedCode.isEmpty()) {
            showAlert("Info", "Please select code to comment");
            return;
        }
        
        aiResponsePane.requestComments(selectedCode, "java");
    }

    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}