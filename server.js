const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');

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

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

// In-memory storage for demo (use database in production)
const sessions = new Map();
const users = new Map();
const collaborators = new Map();

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
        this.callParticipants = new Set();
        
        // Initialize with sample file
        this.files.set('src/Main.java', `package com.codebuddy.example;

public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Welcome to CodeBuddy.ai Enhanced!");
    }
}`);
    }
    
    addCollaborator(userId, permission = 'edit') {
        this.collaborators.add(userId);
        collaborators.set(userId, { sessionId: this.id, permission });
    }
    
    removeCollaborator(userId) {
        this.collaborators.delete(userId);
        collaborators.delete(userId);
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

// Enhanced AI API endpoint with OpenAI integration
app.post('/api/ai/chat', async (req, res) => {
    const { message, context, sessionId, userId } = req.body;
    
    try {
        // Prepare messages for OpenAI
        const messages = [
            {
                role: 'system',
                content: `You are an expert programming assistant for CodeBuddy.ai, a collaborative code editor. 
                You help developers with code explanations, debugging, optimization, and best practices. 
                Always provide clear, helpful, and actionable advice. When showing code examples, 
                use proper formatting and explain your reasoning.`
            }
        ];

        if (context) {
            messages.push({
                role: 'user',
                content: `Context: ${context}\n\nQuestion: ${message}`
            });
        } else {
            messages.push({
                role: 'user',
                content: message
            });
        }

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7
        });

        const response = completion.choices[0].message.content;

        res.json({
            response: response,
            success: true,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('OpenAI API error:', error);
        
        // Fallback response if OpenAI fails
        const fallbackResponse = generateFallbackResponse(message);
        
        res.json({
            response: fallbackResponse,
            success: true,
            fallback: true,
            timestamp: new Date()
        });
    }
});

// Fallback AI responses when OpenAI is not available
function generateFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('explain') || lowerMessage.includes('what does')) {
        return "I'd be happy to explain your code! However, I'm currently running in fallback mode. For the best AI assistance, please ensure your OpenAI API key is configured. In the meantime, I can suggest breaking down your code into smaller functions and adding comments to improve readability.";
    }
    
    if (lowerMessage.includes('bug') || lowerMessage.includes('error') || lowerMessage.includes('fix')) {
        return "To help debug your code, I recommend: 1) Check for syntax errors, 2) Verify variable names and types, 3) Add console.log statements to trace execution, 4) Use your browser's developer tools. For more advanced debugging assistance, please configure your OpenAI API key.";
    }
    
    if (lowerMessage.includes('optimize') || lowerMessage.includes('performance')) {
        return "For code optimization, consider: 1) Reducing nested loops, 2) Using efficient data structures, 3) Minimizing DOM manipulations, 4) Implementing caching where appropriate. For detailed optimization suggestions, please set up your OpenAI API key.";
    }
    
    return "I'm here to help with your coding questions! Currently running in fallback mode - for the best AI assistance, please configure your OpenAI API key in the server environment. I can still help with general programming advice and best practices.";
}

// Collaborator management
app.post('/api/collaborators/add', async (req, res) => {
    const { sessionId, collaboratorId, permissionLevel } = req.body;
    
    try {
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // In a real implementation, you would:
        // 1. Validate the collaborator ID (check if user exists)
        // 2. Send invitation notification
        // 3. Handle GitHub integration for GitHub usernames
        
        session.addCollaborator(collaboratorId, permissionLevel);
        
        // Notify other session participants
        io.to(sessionId).emit('collaborator-added', {
            collaboratorId,
            permissionLevel,
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: `Collaborator ${collaboratorId} added successfully`
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GitHub export with enhanced file support
app.post('/api/github/export', async (req, res) => {
    const { sessionId, repoName, accessToken, files } = req.body;
    
    try {
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // In a real implementation, you would use the GitHub API
        // to create a repository and upload files
        
        // Simulate GitHub API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const repoUrl = `https://github.com/user/${repoName}`;
        
        res.json({
            url: repoUrl,
            message: 'Successfully exported to GitHub repository',
            filesExported: Object.keys(files).length
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Socket.IO connection handling with enhanced features
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
        socket.emit('session-joined', {
            sessionId,
            files: Object.fromEntries(session.files),
            collaborators: Array.from(session.collaborators),
            chatMessages: session.chatMessages.slice(-50)
        });
        
        console.log(`User ${username} joined session ${sessionId}`);
    });
    
    socket.on('code-change', (data) => {
        const user = users.get(socket.id);
        if (!user) return;
        
        const { filename, content, timestamp } = data;
        const session = sessions.get(user.sessionId);
        
        if (session) {
            session.updateFile(filename, content);
            
            // Broadcast to other users in the session
            socket.to(user.sessionId).emit('code-change', {
                filename,
                content,
                userId: user.userId,
                username: user.username,
                timestamp
            });
        }
    });
    
    socket.on('chat-message', (data) => {
        const user = users.get(socket.id);
        if (!user) return;
        
        const { message, timestamp } = data;
        const session = sessions.get(user.sessionId);
        
        if (session) {
            session.addChatMessage(user.userId, user.username, message);
            
            // Broadcast to all users in the session
            io.to(user.sessionId).emit('chat-message', {
                userId: user.userId,
                username: user.username,
                message,
                timestamp: timestamp || new Date()
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
            timestamp: data.timestamp
        });
    });

    // Video/Audio call signaling
    socket.on('call-start', (data) => {
        const user = users.get(socket.id);
        if (!user) return;

        const session = sessions.get(user.sessionId);
        if (session) {
            session.callParticipants.add(user.userId);
            
            // Notify other participants about the call
            socket.to(user.sessionId).emit('call-invitation', {
                userId: user.userId,
                username: user.username,
                type: data.type,
                timestamp: new Date()
            });
        }
    });

    socket.on('call-answer', (data) => {
        const user = users.get(socket.id);
        if (!user) return;

        // Handle WebRTC signaling
        socket.to(user.sessionId).emit('call-answer', {
            userId: user.userId,
            answer: data.answer
        });
    });

    socket.on('call-offer', (data) => {
        const user = users.get(socket.id);
        if (!user) return;

        // Handle WebRTC signaling
        socket.to(user.sessionId).emit('call-offer', {
            userId: user.userId,
            offer: data.offer
        });
    });

    socket.on('ice-candidate', (data) => {
        const user = users.get(socket.id);
        if (!user) return;

        // Handle ICE candidates for WebRTC
        socket.to(user.sessionId).emit('ice-candidate', {
            userId: user.userId,
            candidate: data.candidate
        });
    });

    socket.on('call-end', (data) => {
        const user = users.get(socket.id);
        if (!user) return;

        const session = sessions.get(user.sessionId);
        if (session) {
            session.callParticipants.delete(user.userId);
            
            // Notify other participants
            socket.to(user.sessionId).emit('call-ended', {
                userId: user.userId,
                username: user.username,
                timestamp: new Date()
            });
        }
    });
    
    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        if (user) {
            const session = sessions.get(user.sessionId);
            if (session) {
                session.removeCollaborator(user.userId);
                session.callParticipants.delete(user.userId);
                
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
        connectedUsers: users.size,
        features: {
            aiChat: !!process.env.OPENAI_API_KEY,
            videoCall: true,
            collaboration: true,
            githubIntegration: true
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 CodeBuddy.ai Enhanced server running on port ${PORT}`);
    console.log(`📝 Web interface: http://localhost:${PORT}`);
    console.log(`🔧 Health check: http://localhost:${PORT}/health`);
    console.log(`🤖 AI Chat: ${process.env.OPENAI_API_KEY ? 'Enabled' : 'Fallback mode (set OPENAI_API_KEY)'}`);
});

module.exports = { app, server, io };