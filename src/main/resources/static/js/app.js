// CodeBuddy.ai Web Application JavaScript

class CodeBuddyApp {
    constructor() {
        this.editor = null;
        this.codeWebSocket = null;
        this.chatWebSocket = null;
        this.sessionId = null;
        this.isConnected = false;
        
        this.init();
    }

    init() {
        this.initializeEditor();
        this.setupEventListeners();
        this.loadSampleCode();
    }

    initializeEditor() {
        require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
        
        require(['vs/editor/editor.main'], () => {
            this.editor = monaco.editor.create(document.getElementById('editor'), {
                value: '',
                language: 'java',
                theme: 'vs-dark',
                fontSize: 14,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true
            });

            // Listen for content changes
            this.editor.onDidChangeModelContent(() => {
                if (this.isConnected && this.codeWebSocket) {
                    this.sendCodeChange();
                }
            });
        });
    }

    setupEventListeners() {
        // Connection controls
        document.getElementById('connectBtn').addEventListener('click', () => this.connect());
        document.getElementById('disconnectBtn').addEventListener('click', () => this.disconnect());

        // AI controls
        document.getElementById('explainBtn').addEventListener('click', () => this.explainCode());
        document.getElementById('fixBtn').addEventListener('click', () => this.fixCode());
        document.getElementById('commentBtn').addEventListener('click', () => this.addComments());
        document.getElementById('optimizeBtn').addEventListener('click', () => this.optimizeCode());

        // AI panel controls
        document.getElementById('closeAiPanel').addEventListener('click', () => this.closeAiPanel());
        document.getElementById('applyCodeBtn').addEventListener('click', () => this.applyAiCode());

        // Chat controls
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // File controls
        document.getElementById('addFileBtn').addEventListener('click', () => this.addFile());

        // GitHub export
        document.getElementById('githubExport').addEventListener('click', () => this.exportToGitHub());
    }

    loadSampleCode() {
        const sampleCode = `package com.example;

import java.util.List;
import java.util.ArrayList;

/**
 * Sample Java class for CodeBuddy.ai
 */
public class HelloWorld {
    
    private String message;
    
    public HelloWorld(String message) {
        this.message = message;
    }
    
    public void printMessage() {
        System.out.println("Hello, " + message + "!");
    }
    
    public static void main(String[] args) {
        HelloWorld hello = new HelloWorld("CodeBuddy.ai");
        hello.printMessage();
        
        // Create a list of numbers
        List<Integer> numbers = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            numbers.add(i);
        }
        
        // Print even numbers
        numbers.stream()
               .filter(n -> n % 2 == 0)
               .forEach(System.out::println);
    }
}`;
        
        if (this.editor) {
            this.editor.setValue(sampleCode);
        }
    }

    connect() {
        const sessionIdInput = document.getElementById('sessionId');
        this.sessionId = sessionIdInput.value.trim();
        
        if (!this.sessionId) {
            alert('Please enter a session ID');
            return;
        }

        try {
            // Connect to code WebSocket
            this.codeWebSocket = new WebSocket(`ws://localhost:8080/ws/code/${this.sessionId}`);
            
            this.codeWebSocket.onopen = () => {
                console.log('Connected to code WebSocket');
                this.updateConnectionStatus(true);
            };

            this.codeWebSocket.onmessage = (event) => {
                this.handleCodeMessage(JSON.parse(event.data));
            };

            this.codeWebSocket.onclose = () => {
                console.log('Code WebSocket closed');
                this.updateConnectionStatus(false);
            };

            this.codeWebSocket.onerror = (error) => {
                console.error('Code WebSocket error:', error);
                alert('Failed to connect to code session');
            };

            // Connect to chat WebSocket
            this.chatWebSocket = new WebSocket(`ws://localhost:8080/ws/chat/${this.sessionId}`);
            
            this.chatWebSocket.onopen = () => {
                console.log('Connected to chat WebSocket');
            };

            this.chatWebSocket.onmessage = (event) => {
                this.handleChatMessage(JSON.parse(event.data));
            };

            this.chatWebSocket.onclose = () => {
                console.log('Chat WebSocket closed');
            };

            this.chatWebSocket.onerror = (error) => {
                console.error('Chat WebSocket error:', error);
            };

        } catch (error) {
            console.error('Connection error:', error);
            alert('Failed to connect to session');
        }
    }

    disconnect() {
        if (this.codeWebSocket) {
            this.codeWebSocket.close();
            this.codeWebSocket = null;
        }
        
        if (this.chatWebSocket) {
            this.chatWebSocket.close();
            this.chatWebSocket = null;
        }
        
        this.updateConnectionStatus(false);
    }

    updateConnectionStatus(connected) {
        this.isConnected = connected;
        document.getElementById('connectBtn').disabled = connected;
        document.getElementById('disconnectBtn').disabled = !connected;
        document.getElementById('sessionId').disabled = connected;
    }

    sendCodeChange() {
        if (this.codeWebSocket && this.codeWebSocket.readyState === WebSocket.OPEN) {
            const message = {
                type: 'code_change',
                filename: 'Main.java',
                content: this.editor.getValue(),
                userId: 'web-user'
            };
            this.codeWebSocket.send(JSON.stringify(message));
        }
    }

    handleCodeMessage(message) {
        switch (message.type) {
            case 'code_change':
                // Update editor content (avoid infinite loops)
                if (message.userId !== 'web-user') {
                    this.editor.setValue(message.content);
                }
                break;
            case 'connection_established':
                console.log('Code connection established');
                break;
        }
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const content = messageInput.value.trim();
        
        if (content && this.chatWebSocket && this.chatWebSocket.readyState === WebSocket.OPEN) {
            const message = {
                type: 'chat_message',
                userId: 'web-user',
                username: 'Web User',
                content: content
            };
            
            this.chatWebSocket.send(JSON.stringify(message));
            messageInput.value = '';
            
            // Add message to local chat
            this.addChatMessage('You', content, new Date(), true);
        }
    }

    handleChatMessage(message) {
        if (message.type === 'chat_message' && message.userId !== 'web-user') {
            this.addChatMessage(message.username, message.content, new Date(), false);
        }
    }

    addChatMessage(username, content, timestamp, isOwn) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        
        const timeStr = timestamp.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="username">${username}</span>
                <span class="timestamp">${timeStr}</span>
            </div>
            <div class="message-content">${content}</div>
        `;
        
        if (isOwn) {
            messageDiv.style.backgroundColor = '#1e3a5f';
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async explainCode() {
        const selectedText = this.editor.getModel().getValueInRange(this.editor.getSelection());
        const code = selectedText || this.editor.getValue();
        
        if (!code.trim()) {
            alert('Please select code to explain or ensure the editor has content');
            return;
        }

        this.showAiPanel();
        this.setAiLoading(true);
        
        try {
            const response = await this.callAiApi('/api/ai/explain', {
                sessionId: this.sessionId,
                userId: 'web-user',
                code: code,
                language: 'java'
            });
            
            this.displayAiResponse(response.response, response.suggestedCode);
        } catch (error) {
            this.displayAiResponse('Error: ' + error.message);
        } finally {
            this.setAiLoading(false);
        }
    }

    async fixCode() {
        const selectedText = this.editor.getModel().getValueInRange(this.editor.getSelection());
        const code = selectedText || this.editor.getValue();
        
        if (!code.trim()) {
            alert('Please select code to fix or ensure the editor has content');
            return;
        }

        this.showAiPanel();
        this.setAiLoading(true);
        
        try {
            const response = await this.callAiApi('/api/ai/fix', {
                sessionId: this.sessionId,
                userId: 'web-user',
                code: code,
                language: 'java'
            });
            
            this.displayAiResponse(response.response, response.suggestedCode);
        } catch (error) {
            this.displayAiResponse('Error: ' + error.message);
        } finally {
            this.setAiLoading(false);
        }
    }

    async addComments() {
        const selectedText = this.editor.getModel().getValueInRange(this.editor.getSelection());
        const code = selectedText || this.editor.getValue();
        
        if (!code.trim()) {
            alert('Please select code to comment or ensure the editor has content');
            return;
        }

        this.showAiPanel();
        this.setAiLoading(true);
        
        try {
            const response = await this.callAiApi('/api/ai/comment', {
                sessionId: this.sessionId,
                userId: 'web-user',
                code: code,
                language: 'java'
            });
            
            this.displayAiResponse(response.response, response.suggestedCode);
        } catch (error) {
            this.displayAiResponse('Error: ' + error.message);
        } finally {
            this.setAiLoading(false);
        }
    }

    async optimizeCode() {
        const selectedText = this.editor.getModel().getValueInRange(this.editor.getSelection());
        const code = selectedText || this.editor.getValue();
        
        if (!code.trim()) {
            alert('Please select code to optimize or ensure the editor has content');
            return;
        }

        this.showAiPanel();
        this.setAiLoading(true);
        
        try {
            const response = await this.callAiApi('/api/ai/optimize', {
                sessionId: this.sessionId,
                userId: 'web-user',
                code: code,
                language: 'java'
            });
            
            this.displayAiResponse(response.response, response.suggestedCode);
        } catch (error) {
            this.displayAiResponse('Error: ' + error.message);
        } finally {
            this.setAiLoading(false);
        }
    }

    async callAiApi(endpoint, data) {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    showAiPanel() {
        document.getElementById('aiPanel').classList.remove('hidden');
    }

    closeAiPanel() {
        document.getElementById('aiPanel').classList.add('hidden');
    }

    setAiLoading(loading) {
        const aiResponse = document.getElementById('aiResponse');
        if (loading) {
            aiResponse.textContent = 'AI is thinking...';
        }
    }

    displayAiResponse(response, suggestedCode) {
        document.getElementById('aiResponse').textContent = response;
        
        const aiCodeDiv = document.getElementById('aiCode');
        if (suggestedCode) {
            document.getElementById('aiCodeContent').textContent = suggestedCode;
            aiCodeDiv.classList.remove('hidden');
        } else {
            aiCodeDiv.classList.add('hidden');
        }
    }

    applyAiCode() {
        const suggestedCode = document.getElementById('aiCodeContent').textContent;
        if (suggestedCode && this.editor) {
            const selection = this.editor.getSelection();
            if (selection && !selection.isEmpty()) {
                this.editor.executeEdits('ai-suggestion', [{
                    range: selection,
                    text: suggestedCode
                }]);
            } else {
                this.editor.setValue(suggestedCode);
            }
        }
    }

    addFile() {
        const filename = prompt('Enter filename:');
        if (filename) {
            // In a real implementation, this would create a new file
            alert(`File "${filename}" would be created`);
        }
    }

    async exportToGitHub() {
        if (!this.sessionId) {
            alert('Please connect to a session first');
            return;
        }

        const repoName = prompt('Enter GitHub repository name:');
        if (!repoName) return;

        const accessToken = prompt('Enter your GitHub access token:');
        if (!accessToken) return;

        try {
            const response = await fetch('/api/github/export/repository', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    repoName: repoName,
                    accessToken: accessToken
                })
            });

            const result = await response.json();
            if (response.ok) {
                alert(`Successfully exported to GitHub: ${result.url}`);
            } else {
                alert(`Export failed: ${result.error}`);
            }
        } catch (error) {
            alert(`Export failed: ${error.message}`);
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CodeBuddyApp();
});