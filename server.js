const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// In-memory storage for demo (use database in production)
const sessions = new Map();
const users = new Map();

// Session management
class CodeSession {
    constructor(id, name, ownerId) {
        this.id = id;
        this.name = name;
        this.ownerId = ownerId;
        this.files = new Map();
        this.collaborators = new Set();
        this.chatMessages = [];
        this.createdAt = new Date();
        this.isActive = true;
        
        // Initialize with sample file
        this.files.set('Main.java', `package com.codebuddy.example;

public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Welcome to CodeBuddy.ai!");
    }
}`);
    }
    
    addCollaborator(userId) {
        this.collaborators.add(userId);
    }
    
    removeCollaborator(userId) {
        this.collaborators.delete(userId);
    }
    
    updateFile(filename, content) {
        this.files.set(filename, content);
    }
    
    addChatMessage(userId, username, message) {
        this.chatMessages.push({
            id: uuidv4(),
            userId,
            username,
            message,
            timestamp: new Date()
        });
    }
}

// API Routes
app.get('/api/sessions/:sessionId', (req, res) => {
    const session = sessions.get(req.params.sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({
        id: session.id,
        name: session.name,
        files: Object.fromEntries(session.files),
        collaborators: Array.from(session.collaborators),
        isActive: session.isActive
    });
});

app.post('/api/sessions', (req, res) => {
    const { name, ownerId } = req.body;
    const sessionId = uuidv4();
    const session = new CodeSession(sessionId, name || 'Untitled Session', ownerId);
    
    sessions.set(sessionId, session);
    
    res.json({
        id: session.id,
        name: session.name,
        ownerId: session.ownerId
    });
});

// AI API endpoints (mock responses for demo)
app.post('/api/ai/explain', async (req, res) => {
    const { code, language } = req.body;
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    res.json({
        response: `This ${language} code demonstrates several programming concepts including class definitions, method declarations, and basic I/O operations. The main method serves as the entry point for the application.`,
        suggestedCode: null,
        success: true
    });
});

app.post('/api/ai/fix', async (req, res) => {
    const { code, language } = req.body;
    
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
    
    res.json({
        response: "I've analyzed your code and found it to be well-structured. Here are some suggestions for improvement:",
        suggestedCode: `// Add input validation
if (args.length > 0) {
    System.out.println("Arguments provided: " + String.join(", ", args));
}
System.out.println("Welcome to CodeBuddy.ai!");`,
        success: true
    });
});

app.post('/api/ai/comment', async (req, res) => {
    const { code, language } = req.body;
    
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 1800));
    
    res.json({
        response: "I've added comprehensive comments to explain the code structure and functionality.",
        suggestedCode: `/**
 * Main application class for CodeBuddy.ai demo
 * Demonstrates basic Java program structure
 */
public class HelloWorld {
    /**
     * Application entry point
     * @param args Command line arguments
     */
    public static void main(String[] args) {
        // Print welcome message to console
        System.out.println("Welcome to CodeBuddy.ai!");
    }
}`,
        success: true
    });
});

app.post('/api/ai/optimize', async (req, res) => {
    const { code, language } = req.body;
    
    await new Promise(resolve => setTimeout(resolve, 1800 + Math.random() * 2200));
    
    res.json({
        response: "Here's an optimized version with improved performance and readability:",
        suggestedCode: `public class HelloWorld {
    private static final String WELCOME_MESSAGE = "Welcome to CodeBuddy.ai!";
    
    public static void main(String[] args) {
        displayWelcomeMessage();
    }
    
    private static void displayWelcomeMessage() {
        System.out.println(WELCOME_MESSAGE);
    }
}`,
        success: true
    });
});

app.post('/api/ai/review', async (req, res) => {
    const { code, language } = req.body;
    
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2500));
    
    res.json({
        response: `Code Review Summary:
        
✅ Strengths:
- Clean and readable code structure
- Proper use of main method
- Good naming conventions

🔍 Suggestions:
- Consider adding error handling
- Add documentation for public methods
- Follow consistent formatting standards

Overall Rating: 8/10 - Well-written code!`,
        suggestedCode: null,
        success: true
    });
});

// GitHub export simulation
app.post('/api/github/export', async (req, res) => {
    const { sessionId, repoName, accessToken } = req.body;
    
    const session = sessions.get(sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    
    // Simulate GitHub API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    res.json({
        url: `https://github.com/user/${repoName}`,
        message: 'Successfully exported to GitHub repository'
    });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('join-session', (data) => {
        const { sessionId, userId, username } = data;
        
        // Join the session room
        socket.join(sessionId);
        
        // Get or create session
        let session = sessions.get(sessionId);
        if (!session) {
            session = new CodeSession(sessionId, `Session ${sessionId}`, userId);
            sessions.set(sessionId, session);
        }
        
        // Add user to session
        session.addCollaborator(userId);
        users.set(socket.id, { userId, username, sessionId });
        
        // Notify others in the session
        socket.to(sessionId).emit('user-joined', {
            userId,
            username,
            timestamp: new Date()
        });
        
        // Send current session state to the new user
        socket.emit('session-state', {
            files: Object.fromEntries(session.files),
            collaborators: Array.from(session.collaborators),
            chatMessages: session.chatMessages.slice(-50) // Last 50 messages
        });
        
        console.log(`User ${username} joined session ${sessionId}`);
    });
    
    socket.on('code-change', (data) => {
        const user = users.get(socket.id);
        if (!user) return;
        
        const { filename, content, cursorPosition } = data;
        const session = sessions.get(user.sessionId);
        
        if (session) {
            session.updateFile(filename, content);
            
            // Broadcast to other users in the session
            socket.to(user.sessionId).emit('code-change', {
                filename,
                content,
                userId: user.userId,
                username: user.username,
                cursorPosition,
                timestamp: new Date()
            });
        }
    });
    
    socket.on('chat-message', (data) => {
        const user = users.get(socket.id);
        if (!user) return;
        
        const { message } = data;
        const session = sessions.get(user.sessionId);
        
        if (session) {
            session.addChatMessage(user.userId, user.username, message);
            
            // Broadcast to all users in the session (including sender)
            io.to(user.sessionId).emit('chat-message', {
                userId: user.userId,
                username: user.username,
                message,
                timestamp: new Date()
            });
        }
    });
    
    socket.on('cursor-position', (data) => {
        const user = users.get(socket.id);
        if (!user) return;
        
        // Broadcast cursor position to other users
        socket.to(user.sessionId).emit('cursor-position', {
            userId: user.userId,
            username: user.username,
            position: data.position,
            timestamp: new Date()
        });
    });
    
    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        if (user) {
            const session = sessions.get(user.sessionId);
            if (session) {
                session.removeCollaborator(user.userId);
                
                // Notify others in the session
                socket.to(user.sessionId).emit('user-left', {
                    userId: user.userId,
                    username: user.username,
                    timestamp: new Date()
                });
            }
            
            users.delete(socket.id);
            console.log(`User ${user.username} disconnected from session ${user.sessionId}`);
        }
        
        console.log('User disconnected:', socket.id);
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date(),
        sessions: sessions.size,
        connectedUsers: users.size
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 CodeBuddy.ai server running on port ${PORT}`);
    console.log(`📝 Web interface: http://localhost:${PORT}`);
    console.log(`🔧 Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server, io };