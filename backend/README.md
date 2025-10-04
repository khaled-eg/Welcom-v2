# 🐬 Dolphin Learning Platform - Backend

Professional Node.js & Express backend for the Dolphin Learning Platform.

## 🚀 Features

- ✅ **Modern Node.js Architecture** - Clean, organized, and scalable
- ✅ **Queue-Based Processing** - Bull + Redis for video/certificate generation
- ✅ **Azure TTS Integration** - High-quality Arabic text-to-speech
- ✅ **FFmpeg Video Processing** - Professional video editing and concatenation
- ✅ **Canvas Certificate Generation** - Beautiful Arabic/English certificates
- ✅ **MySQL Database** - Sequelize ORM with migrations
- ✅ **Security** - Helmet, rate limiting, input validation
- ✅ **Logging** - Winston with daily rotate files
- ✅ **Error Handling** - Comprehensive error management

## 📋 Requirements

- Node.js >= 18.0.0
- MySQL >= 8.0
- Redis >= 6.0
- FFmpeg (installed and in PATH)

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3000
PUBLIC_URL=http://localhost:3000

DB_HOST=localhost
DB_NAME=grad2025
DB_USER=root
DB_PASS=your_password

REDIS_HOST=localhost
REDIS_PORT=6379

AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=eastus
AZURE_VOICE_NAME=ar-LB-LaylaNeural
```

### 3. Setup Database

Create MySQL database:

```sql
CREATE DATABASE grad2025 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

The tables will be created automatically when you start the server.

### 4. Start Redis

Make sure Redis is running:

```bash
redis-server
```

### 5. Copy Assets

Copy video templates and fonts from the old project:

```bash
# Copy videos
cp ../Student-Welcoming_project/intro.mp4 ./assets/
cp ../Student-Welcoming_project/script.mp4 ./assets/

# Copy templates
mkdir -p ./assets/templates
cp ../Student-Welcoming_project/templates/* ./assets/templates/

# Copy fonts
mkdir -p ./assets/fonts
cp ../Student-Welcoming_project/font/* ./assets/fonts/
```

## ▶️ Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Run Worker (Separate Process)

```bash
npm run worker
```

## 📡 API Endpoints

### Students

- `POST /api/students/register` - Register new student
- `GET /api/students/:studentId` - Get student info
- `POST /api/students/generate` - Generate video & certificate

### Videos

- `GET /api/videos/status/:jobId` - Get video job status
- `GET /api/videos/download/:filename` - Download video
- `GET /api/videos/stream/:filename` - Stream video

### Certificates

- `GET /api/certificates/status/:jobId` - Get certificate job status
- `GET /api/certificates/download/:filename` - Download certificate
- `GET /api/certificates/view/:filename` - View certificate

### Health

- `GET /api/health` - Server health check

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middlewares/     # Express middlewares
│   ├── utils/           # Utility functions
│   ├── workers/         # Background workers
│   └── app.js           # Main application
├── uploads/             # Temporary uploads
├── output/              # Generated files
├── assets/              # Static assets
├── logs/                # Application logs
└── tests/               # Unit tests
```

## 🧪 Testing

```bash
npm test
```

## 📝 Logging

Logs are stored in the `logs/` directory:

- `app-YYYY-MM-DD.log` - Application logs
- `error-YYYY-MM-DD.log` - Error logs

## 🔒 Security

- Helmet for HTTP security headers
- Express rate limiting
- Joi validation
- Input sanitization
- CORS configuration

## 🐳 Docker Support

```bash
docker-compose up
```

## 📄 License

MIT

## 👥 Support

For support, email support@learnadolphin.com
