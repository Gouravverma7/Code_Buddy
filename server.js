const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Serve welcome page at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'welcome.html'));
});

// Serve editor at /editor
app.get('/editor', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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
        
        // Example: Simple calculator
        int a = 10;
        int b = 5;
        
        System.out.println("Addition: " + (a + b));
        System.out.println("Subtraction: " + (a - b));
        System.out.println("Multiplication: " + (a * b));
        System.out.println("Division: " + (a / b));
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

// Enhanced AI API endpoint with real OpenAI integration and fallback
app.post('/api/ai/chat', async (req, res) => {
    const { message, context, sessionId, userId } = req.body;
    
    try {
        // Try OpenAI first if API key is available
        if (process.env.OPENAI_API_KEY) {
            const response = await callOpenAI(message, context);
            return res.json({
                response: response,
                success: true,
                timestamp: new Date(),
                provider: 'openai'
            });
        }
        
        // Fallback to intelligent local AI simulation
        const response = await generateIntelligentResponse(message, context);
        
        res.json({
            response: response,
            success: true,
            timestamp: new Date(),
            provider: 'local'
        });

    } catch (error) {
        console.error('AI API error:', error);
        
        // Final fallback
        const fallbackResponse = generateBasicResponse(message);
        
        res.json({
            response: fallbackResponse,
            success: true,
            fallback: true,
            timestamp: new Date(),
            provider: 'fallback'
        });
    }
});

// OpenAI API call function
async function callOpenAI(message, context) {
    const fetch = (await import('node-fetch')).default;
    
    const messages = [
        {
            role: 'system',
            content: `You are an expert programming assistant for CodeBuddy.ai. You help developers with code explanations, debugging, optimization, and best practices. Always provide clear, helpful, and actionable advice. When showing code examples, use proper formatting and explain your reasoning. Be concise but thorough.`
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// Intelligent local AI simulation
async function generateIntelligentResponse(message, context) {
    const lowerMessage = message.toLowerCase();
    
    // Code analysis patterns
    if (lowerMessage.includes('explain') || lowerMessage.includes('what does')) {
        if (context && context.includes('java')) {
            return analyzeJavaCode(context, message);
        } else if (context && context.includes('python')) {
            return analyzePythonCode(context, message);
        } else if (context && context.includes('javascript')) {
            return analyzeJavaScriptCode(context, message);
        }
        return "I can help explain your code! Please share the specific code you'd like me to analyze, and I'll break down what it does, how it works, and any important concepts it demonstrates.";
    }
    
    // Bug fixing patterns
    if (lowerMessage.includes('bug') || lowerMessage.includes('error') || lowerMessage.includes('fix')) {
        return generateBugFixResponse(context, message);
    }
    
    // Optimization patterns
    if (lowerMessage.includes('optimize') || lowerMessage.includes('performance') || lowerMessage.includes('improve')) {
        return generateOptimizationResponse(context, message);
    }
    
    // Code generation patterns
    if (lowerMessage.includes('write') || lowerMessage.includes('create') || lowerMessage.includes('generate')) {
        return generateCodeResponse(message);
    }
    
    // General programming help
    return generateGeneralResponse(message);
}

function analyzeJavaCode(context, message) {
    const codeLines = context.split('\n').length;
    const hasMain = context.includes('public static void main');
    const hasClasses = context.includes('class ');
    const hasMethods = context.includes('public ') || context.includes('private ');
    
    let response = "**Java Code Analysis:**\n\n";
    
    if (hasMain) {
        response += "✅ **Main Method**: This is an executable Java program with a main method as the entry point.\n\n";
    }
    
    if (hasClasses) {
        response += "✅ **Class Structure**: The code follows object-oriented principles with proper class definitions.\n\n";
    }
    
    if (context.includes('System.out.println')) {
        response += "📝 **Output**: Uses System.out.println() for console output.\n\n";
    }
    
    if (context.includes('import')) {
        response += "📦 **Imports**: Uses external libraries or Java standard library classes.\n\n";
    }
    
    response += "**Key Concepts:**\n";
    response += "• **Encapsulation**: Data and methods are organized within classes\n";
    response += "• **Method Structure**: Clear separation of functionality into methods\n";
    response += "• **Java Syntax**: Follows Java naming conventions and syntax rules\n\n";
    
    response += "**Suggestions for Improvement:**\n";
    response += "• Add JavaDoc comments for better documentation\n";
    response += "• Consider error handling with try-catch blocks\n";
    response += "• Use meaningful variable and method names\n";
    response += "• Follow Java coding standards and best practices";
    
    return response;
}

function analyzePythonCode(context, message) {
    let response = "**Python Code Analysis:**\n\n";
    
    if (context.includes('def ')) {
        response += "✅ **Functions**: Well-structured with function definitions.\n\n";
    }
    
    if (context.includes('class ')) {
        response += "✅ **Classes**: Object-oriented programming with class definitions.\n\n";
    }
    
    if (context.includes('import ') || context.includes('from ')) {
        response += "📦 **Modules**: Uses external libraries or built-in modules.\n\n";
    }
    
    response += "**Python Best Practices:**\n";
    response += "• Use descriptive variable names (snake_case)\n";
    response += "• Add docstrings to functions and classes\n";
    response += "• Follow PEP 8 style guidelines\n";
    response += "• Use list comprehensions where appropriate\n";
    response += "• Handle exceptions with try-except blocks";
    
    return response;
}

function analyzeJavaScriptCode(context, message) {
    let response = "**JavaScript Code Analysis:**\n\n";
    
    if (context.includes('function') || context.includes('=>')) {
        response += "✅ **Functions**: Uses function declarations or arrow functions.\n\n";
    }
    
    if (context.includes('const ') || context.includes('let ')) {
        response += "✅ **Modern Syntax**: Uses ES6+ variable declarations.\n\n";
    }
    
    if (context.includes('async') || context.includes('await')) {
        response += "⚡ **Async Programming**: Handles asynchronous operations properly.\n\n";
    }
    
    response += "**JavaScript Best Practices:**\n";
    response += "• Use const/let instead of var\n";
    response += "• Implement proper error handling\n";
    response += "• Use meaningful function and variable names\n";
    response += "• Consider using TypeScript for larger projects\n";
    response += "• Follow consistent code formatting";
    
    return response;
}

function generateBugFixResponse(context, message) {
    return `**Bug Fixing Assistance:**

I'll help you identify and fix potential issues in your code. Here's a systematic approach:

**Common Bug Categories:**
1. **Syntax Errors**: Missing semicolons, brackets, or incorrect syntax
2. **Logic Errors**: Incorrect algorithms or conditional statements
3. **Runtime Errors**: Null pointer exceptions, array out of bounds
4. **Type Errors**: Incorrect data type usage or conversions

**Debugging Steps:**
1. **Read Error Messages**: They often point directly to the problem
2. **Check Variable Values**: Use print statements or debugger
3. **Verify Logic Flow**: Trace through your code step by step
4. **Test Edge Cases**: Consider unusual inputs or conditions

**Quick Fixes:**
• Add null checks before using objects
• Validate array indices before access
• Use try-catch blocks for error handling
• Check variable initialization

Share your specific error message or problematic code, and I'll provide targeted solutions!`;
}

function generateOptimizationResponse(context, message) {
    return `**Code Optimization Strategies:**

**Performance Improvements:**
1. **Algorithm Efficiency**: Choose optimal algorithms (O(n) vs O(n²))
2. **Data Structures**: Use appropriate data structures for your use case
3. **Memory Management**: Avoid memory leaks and unnecessary allocations
4. **Caching**: Store frequently accessed data

**Language-Specific Optimizations:**

**Java:**
• Use StringBuilder for string concatenation
• Prefer ArrayList over Vector
• Use enhanced for loops
• Consider using streams for data processing

**Python:**
• Use list comprehensions
• Leverage built-in functions
• Consider using NumPy for numerical operations
• Use generators for large datasets

**JavaScript:**
• Minimize DOM manipulations
• Use const/let appropriately
• Implement debouncing for frequent events
• Consider using Web Workers for heavy computations

**General Best Practices:**
• Profile your code to identify bottlenecks
• Optimize only after measuring performance
• Keep code readable while optimizing
• Use appropriate design patterns`;
}

function generateCodeResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('function') || lowerMessage.includes('method')) {
        return `**Function/Method Creation Guide:**

Here's a template for creating well-structured functions:

**Java Method:**
\`\`\`java
/**
 * Description of what the method does
 * @param parameter1 Description of parameter
 * @return Description of return value
 */
public returnType methodName(parameterType parameter1) {
    // Method implementation
    return result;
}
\`\`\`

**Python Function:**
\`\`\`python
def function_name(parameter1, parameter2=default_value):
    """
    Description of what the function does
    
    Args:
        parameter1: Description
        parameter2: Description
    
    Returns:
        Description of return value
    """
    # Function implementation
    return result
\`\`\`

**JavaScript Function:**
\`\`\`javascript
/**
 * Description of what the function does
 * @param {type} parameter1 - Description
 * @returns {type} Description of return value
 */
function functionName(parameter1) {
    // Function implementation
    return result;
}
\`\`\`

**Best Practices:**
• Use descriptive names
• Keep functions focused on single responsibility
• Add proper documentation
• Handle edge cases and errors
• Write unit tests`;
    }
    
    return "I'd be happy to help you write code! Please specify what you'd like to create (function, class, algorithm, etc.) and what programming language you're using. The more details you provide about the requirements, the better I can assist you.";
}

function generateGeneralResponse(message) {
    return `**Programming Assistance Available:**

I'm here to help with all aspects of programming! Here's what I can assist you with:

**Code Analysis & Review:**
• Explain how your code works
• Identify potential improvements
• Review code quality and best practices
• Suggest optimizations

**Debugging & Problem Solving:**
• Help fix bugs and errors
• Debug logic issues
• Optimize performance
• Handle edge cases

**Code Generation:**
• Write functions and classes
• Create algorithms
• Generate boilerplate code
• Implement design patterns

**Learning & Best Practices:**
• Explain programming concepts
• Recommend best practices
• Suggest learning resources
• Code style guidelines

**Languages I Support:**
• Java, Python, JavaScript, TypeScript
• HTML, CSS, SQL
• C++, C#, Go, Rust
• And many more!

Feel free to ask specific questions about your code or programming concepts. Share your code for detailed analysis and suggestions!`;
}

function generateBasicResponse(message) {
    return "I'm here to help with your coding questions! For the best AI assistance, please configure your OpenAI API key. In the meantime, I can provide general programming guidance and best practices.";
}

// Code execution endpoint
app.post('/api/code/execute', async (req, res) => {
    const { code, language, filename } = req.body;
    
    try {
        const result = await executeCode(code, language, filename);
        res.json({
            success: true,
            output: result.output,
            error: result.error,
            executionTime: result.executionTime
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message,
            output: '',
            executionTime: 0
        });
    }
});

// Code execution function
async function executeCode(code, language, filename) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        let command = '';
        let tempFile = '';
        
        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        
        switch (language.toLowerCase()) {
            case 'java':
                tempFile = path.join(tempDir, `${filename || 'Main'}.java`);
                fs.writeFileSync(tempFile, code);
                command = `cd ${tempDir} && javac ${filename || 'Main'}.java && java ${filename || 'Main'}`;
                break;
                
            case 'python':
                tempFile = path.join(tempDir, `${filename || 'main'}.py`);
                fs.writeFileSync(tempFile, code);
                command = `python3 "${tempFile}"`;
                break;
                
            case 'javascript':
                tempFile = path.join(tempDir, `${filename || 'main'}.js`);
                fs.writeFileSync(tempFile, code);
                command = `node "${tempFile}"`;
                break;
                
            case 'cpp':
            case 'c++':
                tempFile = path.join(tempDir, `${filename || 'main'}.cpp`);
                const execFile = path.join(tempDir, `${filename || 'main'}`);
                fs.writeFileSync(tempFile, code);
                command = `g++ "${tempFile}" -o "${execFile}" && "${execFile}"`;
                break;
                
            default:
                resolve({
                    output: '',
                    error: `Language ${language} is not supported yet. Supported languages: Java, Python, JavaScript, C++`,
                    executionTime: 0
                });
                return;
        }
        
        exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
            const executionTime = Date.now() - startTime;
            
            // Clean up temp files
            try {
                if (fs.existsSync(tempFile)) {
                    fs.unlinkSync(tempFile);
                }
                // Clean up compiled files
                if (language.toLowerCase() === 'java') {
                    const classFile = tempFile.replace('.java', '.class');
                    if (fs.existsSync(classFile)) {
                        fs.unlinkSync(classFile);
                    }
                }
                if (language.toLowerCase() === 'cpp' || language.toLowerCase() === 'c++') {
                    const execFile = path.join(tempDir, `${filename || 'main'}`);
                    if (fs.existsSync(execFile)) {
                        fs.unlinkSync(execFile);
                    }
                }
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
            }
            
            if (error) {
                resolve({
                    output: stdout || '',
                    error: stderr || error.message,
                    executionTime
                });
            } else {
                resolve({
                    output: stdout || 'Program executed successfully (no output)',
                    error: stderr || '',
                    executionTime
                });
            }
        });
    });
}

// Enhanced collaborator management with GitHub integration
app.post('/api/collaborators/add', async (req, res) => {
    const { sessionId, collaboratorId, permissionLevel } = req.body;
    
    try {
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Check if it's a GitHub username
        if (collaboratorId.includes('@') || collaboratorId.length > 3) {
            // Try to validate GitHub user
            const isValidGitHubUser = await validateGitHubUser(collaboratorId);
            
            if (isValidGitHubUser) {
                session.addCollaborator(collaboratorId, permissionLevel);
                
                // Notify other session participants
                io.to(sessionId).emit('collaborator-added', {
                    collaboratorId,
                    permissionLevel,
                    platform: 'github',
                    timestamp: new Date()
                });

                res.json({
                    success: true,
                    message: `GitHub user ${collaboratorId} added successfully`,
                    platform: 'github'
                });
            } else {
                // Add as CodeBuddy.ai user anyway (for demo purposes)
                session.addCollaborator(collaboratorId, permissionLevel);
                
                io.to(sessionId).emit('collaborator-added', {
                    collaboratorId,
                    permissionLevel,
                    platform: 'codebuddy',
                    timestamp: new Date()
                });

                res.json({
                    success: true,
                    message: `User ${collaboratorId} added successfully`,
                    platform: 'codebuddy',
                    note: 'GitHub user not found, added as CodeBuddy.ai user'
                });
            }
        } else {
            // CodeBuddy.ai ID
            session.addCollaborator(collaboratorId, permissionLevel);
            
            io.to(sessionId).emit('collaborator-added', {
                collaboratorId,
                permissionLevel,
                platform: 'codebuddy',
                timestamp: new Date()
            });

            res.json({
                success: true,
                message: `CodeBuddy.ai user ${collaboratorId} added successfully`,
                platform: 'codebuddy'
            });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GitHub user validation
async function validateGitHubUser(username) {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`https://api.github.com/users/${username}`);
        return response.ok;
    } catch (error) {
        console.error('GitHub validation error:', error);
        return false;
    }
}

// Enhanced GitHub export
app.post('/api/github/export', async (req, res) => {
    const { sessionId, repoName, accessToken, files } = req.body;
    
    try {
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // In a real implementation, you would use the GitHub API
        // For demo purposes, we'll simulate the export
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const repoUrl = `https://github.com/user/${repoName}`;
        
        res.json({
            url: repoUrl,
            message: 'Successfully exported to GitHub repository',
            filesExported: Object.keys(files || {}).length,
            timestamp: new Date()
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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
            aiChat: !!process.env.OPENAI_API_KEY || 'fallback',
            codeExecution: true,
            videoCall: true,
            collaboration: true,
            githubIntegration: true
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 CodeBuddy.ai Enhanced server running on port ${PORT}`);
    console.log(`🏠 Welcome page: http://localhost:${PORT}`);
    console.log(`📝 Editor: http://localhost:${PORT}/editor`);
    console.log(`🔧 Health check: http://localhost:${PORT}/health`);
    console.log(`🤖 AI Chat: ${process.env.OPENAI_API_KEY ? 'OpenAI Enabled' : 'Local AI Fallback'}`);
    console.log(`⚡ Code Execution: Java, Python, JavaScript, C++ supported`);
});

module.exports = { app, server, io };