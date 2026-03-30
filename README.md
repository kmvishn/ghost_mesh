<p align="center">
  <img src="logo.png" alt="Ghost Mesh Logo" width="200"/>
</p>

# Ghost Mesh

A multi-agent chat system where conversations vanish, but digital souls persist. Built with FastAPI and Google's Gemini API.

## 🌟 Features

- **Multi-Agent Chat**: Create and chat with multiple AI characters simultaneously
- **Ephemeral Conversations**: Chat sessions automatically expire after a configurable TTL
- **Persistent AI Characters**: Your AI characters persist across sessions
- **Real-time WebSocket**: Live chat experience with instant responses
- **AI Avatar Generation**: Generate unique avatars for your AI characters using Gemini's image generation
- **Personality-driven AI**: Each AI character has customizable personality traits
- **Authentication**: Secure JWT-based user authentication
- **Scalable Architecture**: Built with FastAPI, PostgreSQL, Redis, and Celery

## 🏗️ Architecture

### Core Components

- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Primary database for user and AI character data
- **Redis**: Session management and message caching
- **Celery**: Background task processing for avatar generation
- **Gemini API**: Google's AI model for chat and image generation
- **WebSocket**: Real-time communication between clients and server

### Project Structure

```
ghost_mesh/
├── ai_agent/           # AI character management and Gemini integration
├── auth/               # Authentication and authorization
├── chat/               # Chat session management and WebSocket handling
├── db/                 # Database configuration and utilities
├── entities/           # SQLAlchemy models (User, AICharacter)
├── migrations/         # Alembic database migrations
├── tasks/              # Celery background tasks
├── users/              # User management
├── utils/              # Utility functions
├── app.py              # FastAPI application entry point
├── config.py           # Configuration settings
└── requirements.txt    # Python dependencies
```

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- PostgreSQL database
- Redis server
- Google Gemini API key
- AWS S3 bucket (for image storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ghost_mesh
   ```

2. **Set up virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.save .env
   # Edit .env with your actual configuration
   ```

5. **Set up database**
   ```bash
   # Run database migrations
   alembic upgrade head
   ```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Application
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=220

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Gemini API
GEMINI_API_KEY=your-gemini-api-key
GEMINI_CHAT_MODEL=gemini-2.5-flash-lite
GEMINI_IMG_GEN_MODEL=imagen-4.0-generate-001

# Redis
REDIS_URL=redis://localhost:6379
REDIS_CELERY_BROKER=redis://localhost:6379
CHAT_SESSION_TTL=3600

# AWS S3
AWS_ENDPOINT_URL=your-s3-endpoint
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION_NAME=your-region
AWS_BUCKET_FOR_IMAGES=your-bucket-name
IMAGE_PUBLIC_ACCESS_URL=your-public-url
```

### Running the Application

#### Development

1. **Start the API server**
   ```bash
   python app.py
   ```

2. **Start Celery worker** (in another terminal)
   ```bash
   celery -A celery_app.celery_client worker --pool=threads -l info
   ```

#### Production with Docker

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login and token generation

### AI Characters
- `POST /ai-character/create-character` - Create a new AI character
- `GET /ai-character/get-character/{id}` - Get AI character details
- `GET /ai-character/list-character` - List user's AI characters
- `DELETE /ai-character/delete-character` - Delete an AI character
- `PUT /ai-character/update-character` - Update AI character

### Chat Sessions
- `POST /chat/create-session` - Create a new chat session
- `WebSocket /ws/chat/{session_id}` - Real-time chat connection

### Users
- `GET /users/profile` - Get user profile
- `PUT /users/update-profile` - Update user profile

## 💬 How It Works

### Creating AI Characters

Users can create AI characters with:
- **Name**: Unique identifier for the character
- **Description**: Brief overview of the character
- **Personality Traits**: Detailed personality that influences AI responses
- **Avatar**: Auto-generated image based on character description

### Chat Sessions

1. **Session Creation**: Users select AI characters to chat with
2. **WebSocket Connection**: Real-time bidirectional communication
3. **Message Processing**: Messages are stored in Redis with TTL
4. **AI Responses**: Each AI character responds based on their personality
5. **Session Expiration**: Sessions automatically expire after TTL

### AI Response Generation

The system uses Gemini API with:
- **System Instructions**: Personality-based prompts
- **Context Awareness**: Full chat history for contextual responses
- **Google Search**: Enhanced responses with web search capabilities
- **Concurrent Processing**: Multiple AI characters respond simultaneously

## 🔧 Configuration

### Chat Session TTL

Chat sessions automatically expire based on `CHAT_SESSION_TTL` (default: 3600 seconds). This ensures conversations remain ephemeral while AI characters persist.

### AI Personality System

AI characters follow this instruction pattern:
```
You are [character_name]. Mimic the following personality traits and answer the last message to the user only message no need of behavior, you can also chat with others characters. Personality trait: [personality_traits]. If you want to skip the conversation reply simply with a '.'
```

## 🧪 Testing

Run the test suite:
```bash
pytest tests/
```

## 📦 Deployment

### Docker Deployment

The application includes Docker configuration for easy deployment:

- **Dockerfile**: Multi-stage build for production
- **docker-compose.yml**: Complete stack with API and Celery worker
- **.dockerignore**: Optimized container builds


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔮 Future Features

- [ ] Voice chat integration
- [ ] AI character learning from conversations
- [ ] Multi-language support
- [ ] Advanced personality modeling
- [ ] Character relationship mapping
- [ ] Export/import character configurations
- [ ] Mobile app support

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
2. **Redis Connection**: Verify Redis server is accessible
3. **Gemini API**: Check API key quota and model availability
4. **WebSocket Issues**: Verify CORS configuration and firewall settings

### Logs

Check application logs for debugging:
```bash
# Development
python app.py

# Docker
docker-compose logs api
docker-compose logs celery
```

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**Ghost Mesh** - Where digital souls linger and conversations fade away.
