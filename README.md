# CodeBuddy.ai - Collaborative AI-Powered Code Editor

CodeBuddy.ai is a collaborative, AI-powered code editor built with Java that allows multiple users to write code together in real-time, chat within sessions, request AI assistance, and export code to GitHub.

## 🚀 Features

### Core Functionality
- **Real-time Collaborative Editing**: Multiple users can edit code simultaneously with live synchronization
- **AI-Powered Assistance**: Get help with code explanations, bug fixes, comments, and optimizations
- **Team Chat**: Built-in chat system for team communication
- **GitHub Integration**: Export sessions directly to GitHub repositories or Gists
- **Multi-Platform**: Available as both desktop (JavaFX) and web application

### AI Capabilities
- **Code Explanation**: Get detailed explanations of code functionality
- **Bug Detection & Fixes**: Identify and fix bugs automatically
- **Comment Generation**: Add meaningful comments to your code
- **Code Optimization**: Improve code performance and readability
- **Code Review**: Get comprehensive code reviews with suggestions

### Collaboration Features
- **Real-time Sync**: See changes from other users instantly
- **User Presence**: See who's online and working on the project
- **Session Management**: Create, join, and manage coding sessions
- **File Management**: Create, edit, and organize multiple files

## 🏗️ Architecture

```
┌─────────────────────┐    ┌─────────────────────┐
│   JavaFX Client     │    │    Web Client       │
│   (Desktop App)     │    │  (Browser-based)    │
└─────────┬───────────┘    └─────────┬───────────┘
          │                          │
          └──────────┬─────────────────┘
                     │ WebSocket
          ┌──────────▼───────────┐
          │  Spring Boot Backend │
          │                      │
          │  ┌─────────────────┐ │
          │  │   WebSocket     │ │
          │  │   Handlers      │ │
          │  └─────────────────┘ │
          │                      │
          │  ┌─────────────────┐ │
          │  │  AI Service     │ │
          │  │  (OpenAI API)   │ │
          │  └─────────────────┘ │
          │                      │
          │  ┌─────────────────┐ │
          │  │ GitHub Service  │ │
          │  │   (Export)      │ │
          │  └─────────────────┘ │
          └──────────┬───────────┘
                     │
          ┌──────────▼───────────┐
          │     MongoDB          │
          │   (Session Data)     │
          └──────────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **Java 17+** - Core language
- **Spring Boot 3.2** - Application framework
- **Spring WebSocket** - Real-time communication
- **Spring Security OAuth2** - GitHub authentication
- **MongoDB** - Database for session storage
- **OpenAI API** - AI assistance
- **GitHub API** - Repository integration

### Frontend
- **JavaFX 21** - Desktop application UI
- **Monaco Editor** - Web-based code editor
- **Thymeleaf** - Web templating
- **WebSocket Client** - Real-time communication
- **RichTextFX** - Desktop code editor with syntax highlighting

## 📦 Installation & Setup

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- MongoDB (local or cloud)
- OpenAI API key (optional, for AI features)
- GitHub OAuth app (optional, for GitHub integration)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/codebuddy-ai.git
cd codebuddy-ai
```

### 2. Configure Environment Variables
Create a `.env` file or set environment variables:
```bash
OPENAI_API_KEY=your_openai_api_key_here
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 3. Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
# Follow instructions at https://docs.mongodb.com/manual/installation/
```

### 4. Build and Run

#### Backend (Spring Boot)
```bash
mvn clean install
mvn spring-boot:run
```

#### Desktop Application (JavaFX)
```bash
mvn javafx:run
```

The web interface will be available at `http://localhost:8080`

## 🎯 Usage

### Web Application
1. Open `http://localhost:8080` in your browser
2. Enter a session ID or create a new session
3. Click "Connect" to join the collaborative session
4. Start coding with real-time collaboration
5. Use AI features via the toolbar buttons
6. Chat with team members in the side panel

### Desktop Application
1. Launch the JavaFX application
2. Enter a session ID in the toolbar
3. Click "Connect" to join the session
4. Use the menu bar for AI assistance and GitHub export
5. Collaborate in real-time with other users

### AI Features
- **Explain Code**: Select code and click "Explain" to get detailed explanations
- **Fix Bugs**: Highlight problematic code and click "Fix" for automatic bug detection
- **Add Comments**: Select code blocks and click "Comment" to add meaningful comments
- **Optimize**: Get performance and readability improvements for your code

### GitHub Integration
1. Set up GitHub OAuth in your application properties
2. Use the "Export to GitHub" feature to save sessions
3. Choose between creating a new repository or Gist
4. Authenticate with GitHub when prompted

## 🔧 Configuration

### Application Properties
Key configuration options in `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080

# MongoDB
spring.data.mongodb.database=codebuddy

# OpenAI API
openai.api.key=${OPENAI_API_KEY:}

# GitHub OAuth
spring.security.oauth2.client.registration.github.client-id=${GITHUB_CLIENT_ID:}
spring.security.oauth2.client.registration.github.client-secret=${GITHUB_CLIENT_SECRET:}
```

## 🚀 API Endpoints

### Session Management
- `POST /api/sessions` - Create new session
- `GET /api/sessions/{id}` - Get session details
- `PUT /api/sessions/{id}/code` - Update session code
- `POST /api/sessions/{id}/collaborators` - Add collaborator

### AI Assistance
- `POST /api/ai/explain` - Explain code
- `POST /api/ai/fix` - Fix bugs
- `POST /api/ai/comment` - Add comments
- `POST /api/ai/optimize` - Optimize code
- `POST /api/ai/review` - Review code

### GitHub Integration
- `POST /api/github/export/repository` - Export to repository
- `POST /api/github/export/gist` - Export to Gist

### WebSocket Endpoints
- `/ws/code/{sessionId}` - Real-time code synchronization
- `/ws/chat/{sessionId}` - Team chat communication

## 🧪 Testing

Run the test suite:
```bash
mvn test
```

For JavaFX UI testing:
```bash
mvn test -Dtest=*UITest
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the AI assistance API
- Monaco Editor for the web-based code editor
- R