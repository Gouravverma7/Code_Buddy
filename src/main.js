// Enhanced CodeBuddy.ai Web Application with Advanced Features
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
        this.fileSystem = new Map();
        this.openTabs = new Map();
        this.currentFile = 'src/Main.java';
        this.collaborators = new Map();
        this.aiMessages = [];
        this.peer = null;
        this.localStream = null;
        this.remoteStreams = new Map();
        this.isInCall = false;
        
        this.init();
    }

    async init() {
        await this.initializeEditor();
        this.setupEventListeners();
        this.initializeFileSystem();
        this.loadSampleCode();
        this.setupWebRTC();
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
                    this.saveFileContent();
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

        // AI Chat
        document.getElementById('aiChatBtn').addEventListener('click', () => this.openAiChat());
        document.getElementById('closeAiChat').addEventListener('click', () => this.closeAiChat());
        document.getElementById('sendAiMessage').addEventListener('click', () => this.sendAiMessage());
        document.getElementById('aiInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendAiMessage();
            }
        });

        // File Explorer
        document.getElementById('newFileBtn').addEventListener('click', () => this.createNewFile());
        document.getElementById('newFolderBtn').addEventListener('click', () => this.createNewFolder());
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshFileTree());

        // Chat controls
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Video/Audio call controls
        document.getElementById('videoCallBtn').addEventListener('click', () => this.startVideoCall());
        document.getElementById('audioCallBtn').addEventListener('click', () => this.startAudioCall());
        document.getElementById('endCall').addEventListener('click', () => this.endCall());
        document.getElementById('toggleMic').addEventListener('click', () => this.toggleMicrophone());
        document.getElementById('toggleCamera').addEventListener('click', () => this.toggleCamera());
        document.getElementById('shareScreen').addEventListener('click', () => this.shareScreen());

        // Collaborator management
        document.getElementById('addCollaboratorBtn').addEventListener('click', () => this.openAddCollaboratorModal());
        document.getElementById('cancelAddCollaborator').addEventListener('click', () => this.closeAddCollaboratorModal());
        document.getElementById('confirmAddCollaborator').addEventListener('click', () => this.addCollaborator());

        // File tree interactions
        this.setupFileTreeListeners();

        // GitHub export
        document.getElementById('githubExport').addEventListener('click', () => this.exportToGitHub());

        // Save functionality
        document.getElementById('saveBtn').addEventListener('click', () => this.saveSession());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    setupFileTreeListeners() {
        const fileTree = document.getElementById('fileTree');
        
        fileTree.addEventListener('click', (e) => {
            const treeItem = e.target.closest('.tree-item');
            if (!treeItem) return;

            const action = e.target.closest('.item-action');
            if (action) {
                e.stopPropagation();
                this.handleFileAction(action, treeItem);
                return;
            }

            if (treeItem.classList.contains('file')) {
                this.openFile(treeItem.dataset.path);
            } else if (treeItem.classList.contains('folder')) {
                this.toggleFolder(treeItem);
            }
        });
    }

    handleFileAction(actionBtn, treeItem) {
        const action = actionBtn.title.toLowerCase();
        const path = treeItem.dataset.path;

        switch (action) {
            case 'add file':
                this.createNewFile(path);
                break;
            case 'rename':
                this.renameItem(path);
                break;
            case 'delete':
                this.deleteItem(path);
                break;
        }
    }

    initializeFileSystem() {
        this.fileSystem.set('src/', { type: 'folder', children: ['src/Main.java', 'src/Utils.java'] });
        this.fileSystem.set('src/Main.java', { type: 'file', content: '', language: 'java' });
        this.fileSystem.set('src/Utils.java', { type: 'file', content: '', language: 'java' });
        this.fileSystem.set('README.md', { type: 'file', content: '', language: 'markdown' });
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
    
    public static void main(String[] args) {
        System.out.println("Welcome to CodeBuddy.ai Enhanced!");
        AdvancedJavaDemo demo = new AdvancedJavaDemo();
        // Implementation continues...
    }
}`;
        
        this.fileSystem.set('src/Main.java', { 
            type: 'file', 
            content: sampleCode, 
            language: 'java' 
        });
        
        if (this.editor) {
            this.editor.setValue(sampleCode);
        }
    }

    // File Management Methods
    createNewFile(parentPath = '') {
        const fileName = prompt('Enter file name:');
        if (!fileName) return;

        const fullPath = parentPath ? `${parentPath}/${fileName}` : fileName;
        const language = this.getLanguageFromExtension(fileName);
        
        this.fileSystem.set(fullPath, {
            type: 'file',
            content: '',
            language: language
        });

        this.refreshFileTree();
        this.openFile(fullPath);
        this.showNotification(`Created file: ${fileName}`, 'success');
    }

    createNewFolder() {
        const folderName = prompt('Enter folder name:');
        if (!folderName) return;

        this.fileSystem.set(`${folderName}/`, {
            type: 'folder',
            children: []
        });

        this.refreshFileTree();
        this.showNotification(`Created folder: ${folderName}`, 'success');
    }

    renameItem(path) {
        const currentName = path.split('/').pop();
        const newName = prompt('Enter new name:', currentName);
        if (!newName || newName === currentName) return;

        const parentPath = path.substring(0, path.lastIndexOf('/'));
        const newPath = parentPath ? `${parentPath}/${newName}` : newName;

        const item = this.fileSystem.get(path);
        this.fileSystem.delete(path);
        this.fileSystem.set(newPath, item);

        this.refreshFileTree();
        this.showNotification(`Renamed to: ${newName}`, 'success');
    }

    deleteItem(path) {
        if (!confirm(`Are you sure you want to delete ${path}?`)) return;

        this.fileSystem.delete(path);
        
        // Close tab if file is open
        if (this.openTabs.has(path)) {
            this.closeTab(path);
        }

        this.refreshFileTree();
        this.showNotification(`Deleted: ${path}`, 'success');
    }

    openFile(path) {
        const file = this.fileSystem.get(path);
        if (!file || file.type !== 'file') return;

        // Add to open tabs
        if (!this.openTabs.has(path)) {
            this.openTabs.set(path, file);
            this.addFileTab(path);
        }

        // Switch to file
        this.currentFile = path;
        this.editor.setValue(file.content);
        this.setEditorLanguage(file.language);
        this.updateActiveTab(path);
        this.updateActiveFileInTree(path);
    }

    saveFileContent() {
        if (this.currentFile && this.fileSystem.has(this.currentFile)) {
            const file = this.fileSystem.get(this.currentFile);
            file.content = this.editor.getValue();
        }
    }

    addFileTab(path) {
        const fileName = path.split('/').pop();
        const icon = this.getFileIcon(fileName);
        
        const tabsContainer = document.getElementById('fileTabs');
        const tab = document.createElement('div');
        tab.className = 'file-tab';
        tab.dataset.file = path;
        tab.innerHTML = `
            <i class="${icon}"></i>
            <span>${fileName}</span>
            <button class="tab-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        tab.addEventListener('click', (e) => {
            if (e.target.closest('.tab-close')) {
                this.closeTab(path);
            } else {
                this.openFile(path);
            }
        });

        tabsContainer.appendChild(tab);
    }

    closeTab(path) {
        this.openTabs.delete(path);
        const tab = document.querySelector(`[data-file="${path}"]`);
        if (tab) tab.remove();

        // Switch to another tab if current file is closed
        if (this.currentFile === path) {
            const remainingTabs = Array.from(this.openTabs.keys());
            if (remainingTabs.length > 0) {
                this.openFile(remainingTabs[0]);
            } else {
                this.editor.setValue('');
                this.currentFile = null;
            }
        }
    }

    updateActiveTab(path) {
        document.querySelectorAll('.file-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.file === path);
        });
    }

    updateActiveFileInTree(path) {
        document.querySelectorAll('.tree-item').forEach(item => {
            item.classList.toggle('active', item.dataset.path === path);
        });
    }

    refreshFileTree() {
        const fileTree = document.getElementById('fileTree');
        fileTree.innerHTML = '';

        // Sort files and folders
        const items = Array.from(this.fileSystem.entries()).sort((a, b) => {
            const [pathA, itemA] = a;
            const [pathB, itemB] = b;
            
            // Folders first
            if (itemA.type === 'folder' && itemB.type === 'file') return -1;
            if (itemA.type === 'file' && itemB.type === 'folder') return 1;
            
            return pathA.localeCompare(pathB);
        });

        items.forEach(([path, item]) => {
            const treeItem = this.createTreeItem(path, item);
            fileTree.appendChild(treeItem);
        });
    }

    createTreeItem(path, item) {
        const div = document.createElement('div');
        div.className = `tree-item ${item.type}`;
        div.dataset.path = path;

        const name = path.split('/').pop() || path;
        const icon = item.type === 'folder' ? 'fas fa-folder folder-icon' : this.getFileIcon(name);

        div.innerHTML = `
            <i class="tree-icon ${icon}"></i>
            <span>${name}</span>
            <div class="tree-item-actions">
                ${item.type === 'folder' ? '<button class="item-action" title="Add File"><i class="fas fa-plus"></i></button>' : ''}
                <button class="item-action" title="Rename"><i class="fas fa-edit"></i></button>
                <button class="item-action" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        `;

        return div;
    }

    getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const iconMap = {
            'java': 'fab fa-java file-icon',
            'js': 'fab fa-js file-icon',
            'ts': 'fab fa-js file-icon',
            'py': 'fab fa-python file-icon',
            'html': 'fab fa-html5 file-icon',
            'css': 'fab fa-css3 file-icon',
            'md': 'fab fa-markdown file-icon',
            'json': 'fas fa-code file-icon',
            'xml': 'fas fa-code file-icon'
        };
        return iconMap[ext] || 'fas fa-file file-icon';
    }

    getLanguageFromExtension(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const langMap = {
            'java': 'java',
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'html': 'html',
            'css': 'css',
            'md': 'markdown',
            'json': 'json',
            'xml': 'xml'
        };
        return langMap[ext] || 'plaintext';
    }

    setEditorLanguage(language) {
        const model = this.editor.getModel();
        monaco.editor.setModelLanguage(model, language);
    }

    // AI Chat Methods
    openAiChat() {
        document.getElementById('aiChatModal').classList.add('active');
    }

    closeAiChat() {
        document.getElementById('aiChatModal').classList.remove('active');
    }

    async sendAiMessage() {
        const input = document.getElementById('aiInput');
        const message = input.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addAiMessage('user', message);
        input.value = '';

        // Show loading
        const loadingId = this.addAiMessage('assistant', 'Thinking...', true);

        try {
            // Get current code context
            const currentCode = this.editor.getValue();
            const context = currentCode ? `Current code:\n\`\`\`${this.getCurrentLanguage()}\n${currentCode}\n\`\`\`` : '';
            
            const response = await this.callOpenAI(message, context);
            
            // Remove loading message and add response
            this.removeAiMessage(loadingId);
            this.addAiMessage('assistant', response);
            
        } catch (error) {
            this.removeAiMessage(loadingId);
            this.addAiMessage('assistant', `Sorry, I encountered an error: ${error.message}`);
        }
    }

    async callOpenAI(message, context = '') {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                context: context,
                sessionId: this.sessionId,
                userId: this.currentUser.id
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    }

    addAiMessage(role, content, isLoading = false) {
        const messagesContainer = document.getElementById('aiChatMessages');
        const messageDiv = document.createElement('div');
        const messageId = 'msg-' + Date.now();
        
        messageDiv.id = messageId;
        messageDiv.className = `ai-message ${role} fade-in`;
        
        const icon = role === 'user' ? 'fas fa-user' : 'fas fa-robot';
        const roleText = role === 'user' ? 'You' : 'AI Assistant';
        
        messageDiv.innerHTML = `
            <div class="ai-message-header">
                <i class="${icon}"></i>
                <span class="ai-message-role ${role}">${roleText}</span>
            </div>
            <div class="ai-message-content">${isLoading ? this.getLoadingHTML() : this.formatAiContent(content)}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return messageId;
    }

    removeAiMessage(messageId) {
        const message = document.getElementById(messageId);
        if (message) message.remove();
    }

    formatAiContent(content) {
        // Basic markdown-like formatting
        return content
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    getLoadingHTML() {
        return `
            <div class="loading">
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
                <span style="margin-left: 12px;">Thinking...</span>
            </div>
        `;
    }

    getCurrentLanguage() {
        if (!this.currentFile) return 'plaintext';
        const file = this.fileSystem.get(this.currentFile);
        return file ? file.language : 'plaintext';
    }

    // WebRTC Video/Audio Call Methods
    setupWebRTC() {
        // Initialize WebRTC capabilities
        this.checkWebRTCSupport();
    }

    checkWebRTCSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('WebRTC not supported in this browser');
            document.getElementById('videoCallBtn').disabled = true;
            document.getElementById('audioCallBtn').disabled = true;
        }
    }

    async startVideoCall() {
        if (this.isInCall) {
            this.showNotification('Already in a call', 'warning');
            return;
        }

        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            this.isInCall = true;
            this.showVideoCallModal();
            this.setupLocalVideo();
            this.updateCallButtons();
            
            // Notify other participants
            if (this.socket) {
                this.socket.emit('call-start', {
                    sessionId: this.sessionId,
                    userId: this.currentUser.id,
                    type: 'video'
                });
            }

        } catch (error) {
            console.error('Error starting video call:', error);
            this.showNotification('Failed to start video call', 'error');
        }
    }

    async startAudioCall() {
        if (this.isInCall) {
            this.showNotification('Already in a call', 'warning');
            return;
        }

        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true
            });

            this.isInCall = true;
            this.showVideoCallModal();
            this.updateCallButtons();
            
            // Notify other participants
            if (this.socket) {
                this.socket.emit('call-start', {
                    sessionId: this.sessionId,
                    userId: this.currentUser.id,
                    type: 'audio'
                });
            }

        } catch (error) {
            console.error('Error starting audio call:', error);
            this.showNotification('Failed to start audio call', 'error');
        }
    }

    setupLocalVideo() {
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = this.localStream;
    }

    showVideoCallModal() {
        document.getElementById('videoCallModal').classList.add('active');
    }

    hideVideoCallModal() {
        document.getElementById('videoCallModal').classList.remove('active');
    }

    endCall() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        this.remoteStreams.forEach(stream => {
            stream.getTracks().forEach(track => track.stop());
        });
        this.remoteStreams.clear();

        this.isInCall = false;
        this.hideVideoCallModal();
        this.updateCallButtons();

        // Notify other participants
        if (this.socket) {
            this.socket.emit('call-end', {
                sessionId: this.sessionId,
                userId: this.currentUser.id
            });
        }
    }

    toggleMicrophone() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                const btn = document.getElementById('toggleMic');
                btn.classList.toggle('mute', !audioTrack.enabled);
                btn.querySelector('i').className = audioTrack.enabled ? 'fas fa-microphone' : 'fas fa-microphone-slash';
            }
        }
    }

    toggleCamera() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                const btn = document.getElementById('toggleCamera');
                btn.classList.toggle('mute', !videoTrack.enabled);
                btn.querySelector('i').className = videoTrack.enabled ? 'fas fa-video' : 'fas fa-video-slash';
            }
        }
    }

    async shareScreen() {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            // Replace video track with screen share
            if (this.localStream) {
                const videoTrack = screenStream.getVideoTracks()[0];
                const sender = this.peer?.getSenders?.().find(s => 
                    s.track && s.track.kind === 'video'
                );
                
                if (sender) {
                    await sender.replaceTrack(videoTrack);
                }
            }

            this.showNotification('Screen sharing started', 'success');
        } catch (error) {
            console.error('Error sharing screen:', error);
            this.showNotification('Failed to share screen', 'error');
        }
    }

    updateCallButtons() {
        const videoBtn = document.getElementById('videoCallBtn');
        const audioBtn = document.getElementById('audioCallBtn');
        
        videoBtn.classList.toggle('active', this.isInCall);
        audioBtn.classList.toggle('active', this.isInCall);
    }

    // Collaborator Management
    openAddCollaboratorModal() {
        document.getElementById('addCollaboratorModal').classList.add('active');
    }

    closeAddCollaboratorModal() {
        document.getElementById('addCollaboratorModal').classList.remove('active');
        document.getElementById('collaboratorId').value = '';
        document.getElementById('permissionLevel').value = 'edit';
    }

    async addCollaborator() {
        const collaboratorId = document.getElementById('collaboratorId').value.trim();
        const permissionLevel = document.getElementById('permissionLevel').value;

        if (!collaboratorId) {
            this.showNotification('Please enter a collaborator ID', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/collaborators/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    collaboratorId: collaboratorId,
                    permissionLevel: permissionLevel
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification(`Added collaborator: ${collaboratorId}`, 'success');
                this.closeAddCollaboratorModal();
                this.updateCollaboratorsList();
            } else {
                const error = await response.json();
                this.showNotification(`Failed to add collaborator: ${error.message}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Error adding collaborator: ${error.message}`, 'error');
        }
    }

    updateCollaboratorsList() {
        // This would typically fetch the updated list from the server
        // For now, we'll simulate adding a new collaborator
        const collaboratorsList = document.getElementById('collaboratorsList');
        // Implementation would update the collaborators list
    }

    // Connection and Communication Methods
    connect() {
        const sessionIdInput = document.getElementById('sessionId');
        this.sessionId = sessionIdInput.value.trim();
        
        if (!this.sessionId) {
            this.showNotification('Please enter a session ID', 'error');
            return;
        }

        try {
            // Initialize Socket.IO connection
            this.socket = io();
            
            this.socket.on('connect', () => {
                this.socket.emit('join-session', {
                    sessionId: this.sessionId,
                    userId: this.currentUser.id,
                    username: this.currentUser.name
                });
            });

            this.socket.on('session-joined', (data) => {
                this.isConnected = true;
                this.updateConnectionStatus(true, 'Connected');
                this.showNotification(`Connected to session: ${this.sessionId}`, 'success');
            });

            this.socket.on('user-joined', (data) => {
                this.addChatMessage('System', `${data.username} joined the session`, new Date(), false, 'system');
            });

            this.socket.on('user-left', (data) => {
                this.addChatMessage('System', `${data.username} left the session`, new Date(), false, 'system');
            });

            this.socket.on('code-change', (data) => {
                if (data.userId !== this.currentUser.id) {
                    this.handleRemoteCodeChange(data);
                }
            });

            this.socket.on('chat-message', (data) => {
                if (data.userId !== this.currentUser.id) {
                    this.addChatMessage(data.username, data.message, new Date(data.timestamp), false);
                }
            });

            this.socket.on('disconnect', () => {
                this.isConnected = false;
                this.updateConnectionStatus(false, 'Disconnected');
                this.showNotification('Disconnected from session', 'warning');
            });

        } catch (error) {
            console.error('Connection error:', error);
            this.showNotification('Failed to connect to session', 'error');
        }
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
        if (!this.isConnected || !this.socket) return;
        
        this.socket.emit('code-change', {
            sessionId: this.sessionId,
            userId: this.currentUser.id,
            filename: this.currentFile,
            content: this.editor.getValue(),
            timestamp: Date.now()
        });
    }

    sendCursorPosition(position) {
        if (!this.isConnected || !this.socket) return;
        
        this.socket.emit('cursor-position', {
            sessionId: this.sessionId,
            userId: this.currentUser.id,
            position: position,
            timestamp: Date.now()
        });
    }

    handleRemoteCodeChange(data) {
        if (data.filename === this.currentFile) {
            const currentPosition = this.editor.getPosition();
            this.editor.setValue(data.content);
            this.editor.setPosition(currentPosition);
        }
        
        // Update file system
        if (this.fileSystem.has(data.filename)) {
            const file = this.fileSystem.get(data.filename);
            file.content = data.content;
        }
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const content = messageInput.value.trim();
        
        if (!content) return;
        
        // Add message to local chat
        this.addChatMessage(this.currentUser.name, content, new Date(), true);
        messageInput.value = '';
        
        // Send message via socket
        if (this.isConnected && this.socket) {
            this.socket.emit('chat-message', {
                sessionId: this.sessionId,
                userId: this.currentUser.id,
                username: this.currentUser.name,
                message: content,
                timestamp: Date.now()
            });
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

    // Utility Methods
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.saveSession();
                    break;
                case 'n':
                    e.preventDefault();
                    this.createNewFile();
                    break;
                case 'o':
                    e.preventDefault();
                    // Open file dialog would go here
                    break;
            }
        }
    }

    saveSession() {
        this.saveFileContent();
        this.showNotification('Session saved successfully!', 'success');
    }

    async exportToGitHub() {
        if (!this.sessionId) {
            this.showNotification('Please connect to a session first', 'warning');
            return;
        }

        const repoName = prompt('Enter GitHub repository name:');
        if (!repoName) return;

        const accessToken = prompt('Enter your GitHub access token:');
        if (!accessToken) return;

        try {
            const response = await fetch('/api/github/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    repoName: repoName,
                    accessToken: accessToken,
                    files: Object.fromEntries(
                        Array.from(this.fileSystem.entries())
                            .filter(([path, item]) => item.type === 'file')
                            .map(([path, item]) => [path, item.content])
                    )
                })
            });

            const result = await response.json();
            if (response.ok) {
                this.showNotification(`Successfully exported to GitHub: ${result.url}`, 'success');
            } else {
                this.showNotification(`Export failed: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Export failed: ${error.message}`, 'error');
        }
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
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CodeBuddyApp();
});