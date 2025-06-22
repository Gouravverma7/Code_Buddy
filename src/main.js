// CodeBuddy.ai Enhanced Web Application
class CodeBuddyApp {
    constructor() {
        this.editor = null;
        this.socket = null;
        this.sessionId = null;
        this.isConnected = false;
        this.currentUser = {
            id: 'user-' + Math.random().toString(36).substr(2, 9),
            name: 'You',
            avatar: 'Y'
        };
        
        this.init();
    }

    async init() {
        await this.initializeEditor();
        this.setupEventListeners();
        this.loadSampleCode();
        this.showWelcomeMessage();
    }

    async initializeEditor() {
        return new Promise((resolve) => {
            require.config({ 
                paths: { 
                    vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' 
                } 
            });
            
            require(['vs/editor/editor.main'], () => {
                this.editor = monaco.editor.create(document.getElementById('editor'), {
                    value: '',
                    language: 'java',
                    theme: 'vs-dark',
                    fontSize: 14,
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible'
                    },
                    wordWrap: 'on',
                    contextmenu: true,
                    mouseWheelZoom: true,
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    renderWhitespace: 'selection'
                });

                // Listen for content changes
                this.editor.onDidChangeModelContent((e) => {
                    if (this.isConnected && this.socket) {
                        this.sendCodeChange();
                    }
                });

                // Listen for cursor position changes
                this.editor.onDidChangeCursorPosition((e) => {
                    if (this.isConnected && this.socket) {
                        this.sendCursorPosition(e.position);
                    }
                });

                resolve();
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
        document.getElementById('reviewBtn').addEventListener('click', () => this.reviewCode());

        // AI panel controls
        document.getElementById('closeAiPanel').addEventListener('click', () => this.closeAiPanel());
        document.getElementById('applyCodeBtn').addEventListener('click', () => this.applyAiCode());

        // Chat controls
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // File controls
        document.getElementById('addFileBtn').addEventListener('click', () => this.addFile());

        // GitHub export
        document.getElementById('githubExport').addEventListener('click', () => this.exportToGitHub());

        // File tab switching
        document.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', (e) => this.switchFile(e.target.closest('.file-item')));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.saveSession();
                    break;
                case 'e':
                    e.preventDefault();
                    this.explainCode();
                    break;
                case '/':
                    e.preventDefault();
                    this.addComments();
                    break;
            }
        }
    }

    loadSampleCode() {
        const sampleCode = `package com.codebuddy.example;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Enhanced CodeBuddy.ai Demo - Advanced Java Features
 * Demonstrates modern Java programming patterns and best practices
 */
public class AdvancedJavaDemo {
    
    private final Map<String, List<Task>> tasksByCategory;
    private final TaskProcessor processor;
    
    public AdvancedJavaDemo() {
        this.tasksByCategory = new ConcurrentHashMap<>();
        this.processor = new TaskProcessor();
    }
    
    /**
     * Processes tasks using modern Java 8+ features
     */
    public void processTasks(List<Task> tasks) {
        // Group tasks by category and priority
        Map<String, Map<Priority, List<Task>>> groupedTasks = tasks.stream()
            .filter(task -> task.isActive())
            .collect(Collectors.groupingBy(
                Task::getCategory,
                Collectors.groupingBy(Task::getPriority)
            ));
        
        // Process high priority tasks first
        groupedTasks.forEach((category, priorityMap) -> {
            priorityMap.entrySet().stream()
                .sorted(Map.Entry.<Priority, List<Task>>comparingByKey().reversed())
                .forEach(entry -> {
                    System.out.printf("Processing %d %s tasks in category: %s%n", 
                        entry.getValue().size(), entry.getKey(), category);
                    
                    entry.getValue().parallelStream()
                        .forEach(processor::execute);
                });
        });
    }
    
    /**
     * Demonstrates optional handling and error management
     */
    public Optional<TaskResult> findBestResult(String category) {
        return Optional.ofNullable(tasksByCategory.get(category))
            .orElse(Collections.emptyList())
            .stream()
            .map(this::processTask)
            .filter(Objects::nonNull)
            .max(Comparator.comparing(TaskResult::getScore));
    }
    
    private TaskResult processTask(Task task) {
        try {
            return processor.process(task);
        } catch (ProcessingException e) {
            System.err.println("Failed to process task: " + task.getId());
            return null;
        }
    }
    
    // Inner classes for demonstration
    public static class Task {
        private final String id;
        private final String category;
        private final Priority priority;
        private final boolean active;
        
        public Task(String id, String category, Priority priority, boolean active) {
            this.id = id;
            this.category = category;
            this.priority = priority;
            this.active = active;
        }
        
        // Getters
        public String getId() { return id; }
        public String getCategory() { return category; }
        public Priority getPriority() { return priority; }
        public boolean isActive() { return active; }
    }
    
    public enum Priority {
        LOW(1), MEDIUM(2), HIGH(3), CRITICAL(4);
        
        private final int value;
        
        Priority(int value) {
            this.value = value;
        }
        
        public int getValue() { return value; }
    }
    
    public static class TaskResult {
        private final String taskId;
        private final double score;
        private final long processingTime;
        
        public TaskResult(String taskId, double score, long processingTime) {
            this.taskId = taskId;
            this.score = score;
            this.processingTime = processingTime;
        }
        
        public String getTaskId() { return taskId; }
        public double getScore() { return score; }
        public long getProcessingTime() { return processingTime; }
    }
    
    public static class TaskProcessor {
        public void execute(Task task) {
            // Simulate task execution
            System.out.println("Executing task: " + task.getId());
        }
        
        public TaskResult process(Task task) throws ProcessingException {
            long startTime = System.currentTimeMillis();
            
            // Simulate processing
            if (Math.random() < 0.1) {
                throw new ProcessingException("Random processing failure");
            }
            
            double score = Math.random() * 100;
            long processingTime = System.currentTimeMillis() - startTime;
            
            return new TaskResult(task.getId(), score, processingTime);
        }
    }
    
    public static class ProcessingException extends Exception {
        public ProcessingException(String message) {
            super(message);
        }
    }
    
    public static void main(String[] args) {
        AdvancedJavaDemo demo = new AdvancedJavaDemo();
        
        // Create sample tasks
        List<Task> tasks = Arrays.asList(
            new Task("T001", "Development", Priority.HIGH, true),
            new Task("T002", "Testing", Priority.MEDIUM, true),
            new Task("T003", "Documentation", Priority.LOW, true),
            new Task("T004", "Deployment", Priority.CRITICAL, true)
        );
        
        System.out.println("=== CodeBuddy.ai Advanced Java Demo ===");
        demo.processTasks(tasks);
        
        // Find best result
        demo.findBestResult("Development")
            .ifPresentOrElse(
                result -> System.out.printf("Best result: %.2f (processed in %dms)%n", 
                    result.getScore(), result.getProcessingTime()),
                () -> System.out.println("No results found")
            );
    }
}`;
        
        if (this.editor) {
            this.editor.setValue(sampleCode);
        }
    }

    showWelcomeMessage() {
        this.showAiPanel();
        document.getElementById('aiResponse').innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h3 style="color: #4ecdc4; margin-bottom: 16px;">
                    <i class="fas fa-rocket"></i> Welcome to CodeBuddy.ai Enhanced!
                </h3>
                <p style="margin-bottom: 16px;">Your AI-powered collaborative coding companion is ready to help you:</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0;">
                    <div style="background: rgba(78, 205, 196, 0.1); padding: 12px; border-radius: 8px;">
                        <i class="fas fa-lightbulb" style="color: #4ecdc4;"></i> <strong>Explain Code</strong><br>
                        <small>Get detailed explanations of complex code</small>
                    </div>
                    <div style="background: rgba(255, 107, 107, 0.1); padding: 12px; border-radius: 8px;">
                        <i class="fas fa-wrench" style="color: #ff6b6b;"></i> <strong>Fix Bugs</strong><br>
                        <small>Identify and resolve code issues</small>
                    </div>
                    <div style="background: rgba(255, 193, 7, 0.1); padding: 12px; border-radius: 8px;">
                        <i class="fas fa-comment" style="color: #ffc107;"></i> <strong>Add Comments</strong><br>
                        <small>Generate meaningful documentation</small>
                    </div>
                    <div style="background: rgba(156, 39, 176, 0.1); padding: 12px; border-radius: 8px;">
                        <i class="fas fa-rocket" style="color: #9c27b0;"></i> <strong>Optimize</strong><br>
                        <small>Improve performance and readability</small>
                    </div>
                </div>
                <p style="font-size: 14px; color: rgba(255, 255, 255, 0.7);">
                    Select code and click any AI button to get started, or connect to a session to collaborate in real-time!
                </p>
            </div>
        `;
    }

    connect() {
        const sessionIdInput = document.getElementById('sessionId');
        this.sessionId = sessionIdInput.value.trim();
        
        if (!this.sessionId) {
            this.showNotification('Please enter a session ID', 'error');
            return;
        }

        try {
            // Initialize Socket.IO connection (simulated for demo)
            this.simulateConnection();
            
        } catch (error) {
            console.error('Connection error:', error);
            this.showNotification('Failed to connect to session', 'error');
        }
    }

    simulateConnection() {
        // Simulate connection process
        this.updateConnectionStatus(true, 'Connecting...');
        
        setTimeout(() => {
            this.isConnected = true;
            this.updateConnectionStatus(true, 'Connected');
            this.showNotification(`Connected to session: ${this.sessionId}`, 'success');
            
            // Simulate receiving a welcome message
            setTimeout(() => {
                this.addChatMessage('System', `Welcome to session ${this.sessionId}! You can now collaborate in real-time.`, new Date(), false, 'system');
            }, 1000);
            
            // Simulate other users joining
            setTimeout(() => {
                this.addChatMessage('Alice Johnson', 'Hey! Great to see you in the session. Ready to code together?', new Date(), false);
            }, 3000);
            
        }, 2000);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        
        this.isConnected = false;
        this.updateConnectionStatus(false, 'Disconnected');
        this.showNotification('Disconnected from session', 'info');
    }

    updateConnectionStatus(connected, statusText) {
        const statusElement = document.getElementById('connectionStatus');
        const statusTextElement = document.getElementById('statusText');
        
        statusElement.className = `connection-status ${connected ? 'connected' : 'disconnected'}`;
        statusTextElement.textContent = statusText;
        
        document.getElementById('connectBtn').disabled = connected;
        document.getElementById('disconnectBtn').disabled = !connected;
        document.getElementById('sessionId').disabled = connected;
    }

    sendCodeChange() {
        if (!this.isConnected) return;
        
        // Simulate sending code changes
        const content = this.editor.getValue();
        console.log('Sending code change:', content.length, 'characters');
    }

    sendCursorPosition(position) {
        if (!this.isConnected) return;
        
        // Simulate sending cursor position
        console.log('Cursor position:', position.lineNumber, position.column);
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const content = messageInput.value.trim();
        
        if (!content) return;
        
        // Add message to local chat
        this.addChatMessage(this.currentUser.name, content, new Date(), true);
        messageInput.value = '';
        
        // Simulate sending message
        if (this.isConnected) {
            console.log('Sending chat message:', content);
            
            // Simulate response from other users
            setTimeout(() => {
                const responses = [
                    "That's a great point!",
                    "I agree with that approach.",
                    "Let me check that implementation.",
                    "Good catch! Thanks for pointing that out.",
                    "I'll work on that part next."
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                const users = ['Alice Johnson', 'Bob Smith', 'Charlie Brown'];
                const randomUser = users[Math.floor(Math.random() * users.length)];
                
                this.addChatMessage(randomUser, randomResponse, new Date(), false);
            }, 1000 + Math.random() * 3000);
        }
    }

    addChatMessage(username, content, timestamp, isOwn, type = 'user') {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message fade-in ${isOwn ? 'own' : ''}`;
        
        if (type === 'system') {
            messageDiv.style.background = 'rgba(78, 205, 196, 0.2)';
            messageDiv.style.border = '1px solid rgba(78, 205, 196, 0.3)';
        }
        
        const timeStr = timestamp.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-username">${username}</span>
                <span class="message-time">${timeStr}</span>
            </div>
            <div class="message-content">${content}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async explainCode() {
        const selectedText = this.getSelectedCode();
        const code = selectedText || this.editor.getValue();
        
        if (!code.trim()) {
            this.showNotification('Please select code to explain or ensure the editor has content', 'warning');
            return;
        }

        this.showAiPanel();
        this.setAiLoading(true, 'Analyzing your code...');
        
        try {
            // Simulate AI response
            await this.simulateAiResponse('explain', code);
        } catch (error) {
            this.displayAiResponse('Error: ' + error.message);
        } finally {
            this.setAiLoading(false);
        }
    }

    async fixCode() {
        const selectedText = this.getSelectedCode();
        const code = selectedText || this.editor.getValue();
        
        if (!code.trim()) {
            this.showNotification('Please select code to fix or ensure the editor has content', 'warning');
            return;
        }

        this.showAiPanel();
        this.setAiLoading(true, 'Scanning for bugs and issues...');
        
        try {
            await this.simulateAiResponse('fix', code);
        } catch (error) {
            this.displayAiResponse('Error: ' + error.message);
        } finally {
            this.setAiLoading(false);
        }
    }

    async addComments() {
        const selectedText = this.getSelectedCode();
        const code = selectedText || this.editor.getValue();
        
        if (!code.trim()) {
            this.showNotification('Please select code to comment or ensure the editor has content', 'warning');
            return;
        }

        this.showAiPanel();
        this.setAiLoading(true, 'Generating meaningful comments...');
        
        try {
            await this.simulateAiResponse('comment', code);
        } catch (error) {
            this.displayAiResponse('Error: ' + error.message);
        } finally {
            this.setAiLoading(false);
        }
    }

    async optimizeCode() {
        const selectedText = this.getSelectedCode();
        const code = selectedText || this.editor.getValue();
        
        if (!code.trim()) {
            this.showNotification('Please select code to optimize or ensure the editor has content', 'warning');
            return;
        }

        this.showAiPanel();
        this.setAiLoading(true, 'Optimizing for performance and readability...');
        
        try {
            await this.simulateAiResponse('optimize', code);
        } catch (error) {
            this.displayAiResponse('Error: ' + error.message);
        } finally {
            this.setAiLoading(false);
        }
    }

    async reviewCode() {
        const selectedText = this.getSelectedCode();
        const code = selectedText || this.editor.getValue();
        
        if (!code.trim()) {
            this.showNotification('Please select code to review or ensure the editor has content', 'warning');
            return;
        }

        this.showAiPanel();
        this.setAiLoading(true, 'Conducting comprehensive code review...');
        
        try {
            await this.simulateAiResponse('review', code);
        } catch (error) {
            this.displayAiResponse('Error: ' + error.message);
        } finally {
            this.setAiLoading(false);
        }
    }

    async simulateAiResponse(action, code) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let response = '';
                let suggestedCode = '';
                
                switch (action) {
                    case 'explain':
                        response = `This Java code demonstrates advanced programming patterns including:

• **Stream Processing**: Uses Java 8+ streams for efficient data processing and filtering
• **Functional Programming**: Leverages lambda expressions and method references
• **Concurrent Collections**: Implements thread-safe data structures with ConcurrentHashMap
• **Optional Handling**: Proper null-safety with Optional pattern
• **Exception Management**: Structured error handling with custom exceptions
• **Modern Java Features**: Utilizes records, enhanced switch expressions, and pattern matching

The code follows SOLID principles and demonstrates clean architecture with separation of concerns. The TaskProcessor class handles business logic while maintaining single responsibility.`;
                        break;
                        
                    case 'fix':
                        response = `I've identified several potential improvements and fixes:

✅ **Thread Safety**: The code properly uses ConcurrentHashMap for thread-safe operations
✅ **Null Safety**: Good use of Optional to prevent NullPointerException
✅ **Resource Management**: Proper exception handling in place

**Potential Enhancements:**
• Consider adding input validation for constructor parameters
• The random failure simulation in TaskProcessor could be configurable
• Add logging for better debugging and monitoring`;
                        
                        suggestedCode = `// Enhanced constructor with validation
public AdvancedJavaDemo() {
    this.tasksByCategory = new ConcurrentHashMap<>();
    this.processor = new TaskProcessor();
    
    // Add validation
    Objects.requireNonNull(processor, "TaskProcessor cannot be null");
}`;
                        break;
                        
                    case 'comment':
                        response = `I've analyzed your code and can add comprehensive documentation:`;
                        
                        suggestedCode = `/**
 * Processes a collection of tasks using modern Java streaming API
 * Groups tasks by category and priority, then processes them in order
 * 
 * @param tasks List of tasks to process (must not be null)
 * @throws IllegalArgumentException if tasks list is null
 * @since 1.0
 */
public void processTasks(List<Task> tasks) {
    // Validate input parameters
    Objects.requireNonNull(tasks, "Tasks list cannot be null");
    
    // Group tasks by category and priority using collectors
    Map<String, Map<Priority, List<Task>>> groupedTasks = tasks.stream()
        .filter(Task::isActive) // Only process active tasks
        .collect(Collectors.groupingBy(
            Task::getCategory,
            Collectors.groupingBy(Task::getPriority)
        ));
    
    // Process tasks in priority order (highest first)
    groupedTasks.forEach((category, priorityMap) -> {
        priorityMap.entrySet().stream()
            .sorted(Map.Entry.<Priority, List<Task>>comparingByKey().reversed())
            .forEach(entry -> {
                System.out.printf("Processing %d %s tasks in category: %s%n", 
                    entry.getValue().size(), entry.getKey(), category);
                
                // Use parallel processing for better performance
                entry.getValue().parallelStream()
                    .forEach(processor::execute);
            });
    });
}`;
                        break;
                        
                    case 'optimize':
                        response = `Here are several optimization opportunities I've identified:

🚀 **Performance Improvements:**
• Use parallel streams for large datasets
• Implement caching for frequently accessed results
• Consider using CompletableFuture for async processing
• Add connection pooling for external resources

📊 **Memory Optimization:**
• Use primitive collections where appropriate
• Implement object pooling for frequently created objects
• Consider lazy initialization for expensive resources`;
                        
                        suggestedCode = `// Optimized version with caching and async processing
private final Map<String, TaskResult> resultCache = new ConcurrentHashMap<>();

public CompletableFuture<Optional<TaskResult>> findBestResultAsync(String category) {
    return CompletableFuture.supplyAsync(() -> {
        // Check cache first
        TaskResult cached = resultCache.get(category);
        if (cached != null && !isExpired(cached)) {
            return Optional.of(cached);
        }
        
        // Process and cache result
        Optional<TaskResult> result = Optional.ofNullable(tasksByCategory.get(category))
            .orElse(Collections.emptyList())
            .parallelStream() // Use parallel processing
            .map(this::processTask)
            .filter(Objects::nonNull)
            .max(Comparator.comparing(TaskResult::getScore));
            
        result.ifPresent(r -> resultCache.put(category, r));
        return result;
    });
}`;
                        break;
                        
                    case 'review':
                        response = `## Code Review Summary

### ✅ Strengths
• **Modern Java Usage**: Excellent use of Java 8+ features
• **Clean Architecture**: Well-structured with clear separation of concerns
• **Thread Safety**: Proper use of concurrent collections
• **Error Handling**: Good exception management patterns
• **Functional Style**: Effective use of streams and lambdas

### 🔍 Areas for Improvement
• **Documentation**: Could benefit from more comprehensive JavaDoc
• **Testing**: Consider adding unit tests for critical methods
• **Configuration**: Make failure rates and timeouts configurable
• **Monitoring**: Add metrics and logging for production use

### 📈 Recommendations
1. Add comprehensive unit tests with JUnit 5
2. Implement proper logging with SLF4J
3. Consider using Spring Boot for dependency injection
4. Add metrics collection with Micrometer
5. Implement circuit breaker pattern for external calls

**Overall Rating: 8.5/10** - Well-written code with modern Java practices!`;
                        break;
                }
                
                this.displayAiResponse(response, suggestedCode);
                resolve();
            }, 2000 + Math.random() * 2000);
        });
    }

    getSelectedCode() {
        if (!this.editor) return '';
        const selection = this.editor.getSelection();
        return this.editor.getModel().getValueInRange(selection);
    }

    showAiPanel() {
        document.getElementById('aiPanel').classList.add('visible');
    }

    closeAiPanel() {
        document.getElementById('aiPanel').classList.remove('visible');
    }

    setAiLoading(loading, message = 'AI is thinking...') {
        const aiResponse = document.getElementById('aiResponse');
        if (loading) {
            aiResponse.innerHTML = `
                <div class="loading" style="display: flex; align-items: center; justify-content: center; padding: 40px;">
                    <div class="loading-dots">
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                    </div>
                    <span style="margin-left: 12px;">${message}</span>
                </div>
            `;
        }
    }

    displayAiResponse(response, suggestedCode) {
        document.getElementById('aiResponse').innerHTML = response.replace(/\n/g, '<br>');
        
        const aiCodeSection = document.getElementById('aiCodeSection');
        if (suggestedCode) {
            document.getElementById('aiCodeContent').textContent = suggestedCode;
            aiCodeSection.classList.remove('hidden');
        } else {
            aiCodeSection.classList.add('hidden');
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
                // Insert at cursor position
                const position = this.editor.getPosition();
                this.editor.executeEdits('ai-suggestion', [{
                    range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                    text: '\n' + suggestedCode + '\n'
                }]);
            }
            this.showNotification('Code applied successfully!', 'success');
        }
    }

    addFile() {
        const filename = prompt('Enter filename (e.g., Utils.java, README.md):');
        if (filename && filename.trim()) {
            this.showNotification(`File "${filename}" would be created in a real implementation`, 'info');
            // In a real implementation, this would create a new file and tab
        }
    }

    switchFile(fileItem) {
        // Remove active class from all file items
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked item
        fileItem.classList.add('active');
        
        // Update file tab
        const filename = fileItem.querySelector('span').textContent;
        document.querySelector('.file-tab span').textContent = filename;
        
        // In a real implementation, this would load the file content
        this.showNotification(`Switched to ${filename}`, 'info');
    }

    saveSession() {
        if (this.sessionId) {
            this.showNotification('Session saved successfully!', 'success');
        } else {
            this.showNotification('Please connect to a session first', 'warning');
        }
    }

    async exportToGitHub() {
        if (!this.sessionId) {
            this.showNotification('Please connect to a session first', 'warning');
            return;
        }

        // Simulate GitHub export
        this.showNotification('Preparing export to GitHub...', 'info');
        
        setTimeout(() => {
            const repoUrl = `https://github.com/user/codebuddy-session-${this.sessionId}`;
            this.showNotification(`Successfully exported to GitHub: ${repoUrl}`, 'success');
            
            // In a real implementation, this would open the GitHub repo
            console.log('Would open:', repoUrl);
        }, 2000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(20px);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // Set background color based on type
        const colors = {
            success: 'linear-gradient(45deg, #4caf50, #45a049)',
            error: 'linear-gradient(45deg, #f44336, #d32f2f)',
            warning: 'linear-gradient(45deg, #ff9800, #f57c00)',
            info: 'linear-gradient(45deg, #2196f3, #1976d2)'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CodeBuddyApp();
});