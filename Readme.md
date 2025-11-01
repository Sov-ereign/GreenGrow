# GreenGrow

<div align="center">

  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&pause=1000&color=228B22&center=true&vCenter=true&width=600&lines=Welcome+to+GreenGrow!;An+AI-Powered+Farming+Assistant;Built+with+Modern+Technologies;Let's+Grow+Together!" alt="Typing SVG" />

</div>

<div align="center">

  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=GreenGrow&fontSize=40&fontAlignY=35&animation=twinkling&fontColor=228B22" />

</div>

## 📋 Problem Statement

## *GreenGrow – An AI-Powered Farming Assistant Platform*

GreenGrow is a comprehensive agricultural advisory platform that leverages artificial intelligence to help farmers make informed decisions about crop cultivation, disease management, weather patterns, and market prices. It's designed to bridge the gap between traditional farming knowledge and modern AI technology, making advanced agricultural insights accessible to farmers everywhere.


## 🎬 Demo

<div align="center">

  <a href="#" target="_blank">

<a href="https://www.linkedin.com/posts/sov-ereign_greengrow-hackspire-futureinstitute-activity-7390292150980321281-fJZ3?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFJgqL4Blt08GWuJ9AdUx5iQUQUE3O2mDc4" target="_blank">
  <img src="https://img.shields.io/badge/🎥_Watch_Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white&labelColor=FF0000" alt="Demo Video" />
</a>

  </a>

</div>

> 🎯 Click to explore the live experience of GreenGrow's user-friendly interface and advanced AI-powered features.

## 👥 Team Members

| 👤 Name             | 📧 Email                        |
|--------------------|---------------------------------|
| 1. Somenath Gorai      |    somu8608@gmail.com    |
| 2. Rimanshu Patel      | rimanshupatel1@gmail.com         |
| 3. Monish Mandal| monishmondal48@gmail.com  |
| 4. Sudipta Roy | sudiptaroytheofficial@gmail.com       |

## 📋 Features Overview

### 🤖 AI-Powered Chat Assistant

- *Text-based queries*: Ask questions about crop cultivation, pest management, soil health, and farming best practices
- *Context-aware responses*: AI understands your location and provides location-specific advice
- *Multi-turn conversations*: Maintain conversation context for better assistance

### 🖼️ Image-Based Disease Detection

- Upload crop images for instant disease diagnosis
- Powered by TensorFlow deep learning model
- Detects 15+ plant diseases across Pepper, Potato, and Tomato crops
- Integration with Google Gemini Vision API for enhanced analysis
- Provides treatment recommendations and prevention tips

### 🎤 Voice Assistant

- Live voice interaction with AI farming advisor
- Voice command processing for hands-free operation
- Real-time context injection from multiple data sources
- Natural language understanding for farming queries

### 🌤️ Weather Information

- Real-time weather forecasts for your location
- 7-day weather predictions
- Weather alerts and notifications
- Location-based weather data integration
- Interactive weather widgets

### 📊 Market Prices (Mandi Rates)

- Real-time agricultural commodity prices
- Multiple mandi (market) information
- Price trends and historical data
- Crop-specific market insights
- Help farmers make informed selling decisions

### 🌾 Crop Management

- Crop recommendations based on location and season
- Detailed crop information and growing guides
- Pest and disease management for specific crops
- Seasonal planting calendars
- Farm data tracking and management

### 🏛️ Government Schemes

- Information about available agricultural schemes
- Eligibility criteria and application processes
- Scheme benefits and requirements
- Location-based scheme recommendations

### 📝 Farm Profile Management

- Create and manage farm profiles
- Track farm statistics and metrics
- Store farm location and details
- View farm-specific recommendations

### 🔔 Community & Support

- Community forum for farmer discussions
- Help center with FAQs and guides
- Support system for technical assistance
- Knowledge sharing platform

### ⚙️ Settings & Personalization

- User profile management
- Notification preferences
- Location settings
- Theme and display preferences

### 🔐 Authentication & Security

- Secure user registration and login
- JWT-based authentication
- Protected routes and API endpoints
- User session management

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive UI
- **React Router** for navigation
- **Lucide React** for icons
- **Axios** for API calls
- **VAPI AI** for voice assistant integration

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose for database
- **JWT** for authentication
- **Multer** for file uploads
- **CORS** enabled for cross-origin requests
- **Morgan** for HTTP request logging

### AI & ML
- **Google Gemini 2.0 Flash** for chat and vision analysis
- **TensorFlow/Keras** for disease detection model
- **Flask** for Python ML backend
- **Axicov** for AI workflow management

### APIs & Services
- OpenWeatherMap API for weather data
- Government Mandi APIs for market prices
- News APIs for agricultural news

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python 3.8+ (for Flask backend)
- MongoDB (local or cloud instance)
- Git

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/GreenGrow.git

# Navigate to the project directory
cd GreenGrow
```

#### 2. Backend Setup (Node.js Server)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file (copy from .env.example if available)
# Add your environment variables:
# MONGODB_URI=your-mongodb-connection-string
# JWT_SECRET=your-jwt-secret-key
# GEMINI_API_KEY=your-google-gemini-api-key
# OPENWEATHER_API_KEY=your-openweather-api-key
# FLASK_API_URL=http://localhost:5001

# Start the backend server
npm run dev
# Or for production
npm start
```

The server will start on `http://localhost:5000`

#### 3. Flask Backend Setup (Disease Detection)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Or on Linux/Mac
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Or use the setup script
# Windows: setup_venv.bat
# Linux/Mac: chmod +x setup_venv.sh && ./setup_venv.sh

# Start Flask server
python app.py
```

The Flask server will start on `http://localhost:5001`

#### 4. Frontend Setup (React Client)

```bash
# Open a new terminal and navigate to Client directory
cd Client

# Install dependencies
npm install

# Create .env file if needed
# VITE_API_URL=http://localhost:5000/api

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

#### 5. Environment Variables

Create `.env` files in both `server` and `Client` directories:

**server/.env:**
```env
MONGODB_URI=mongodb://localhost:27017/greengrow
JWT_SECRET=your-super-secret-jwt-key-here
GEMINI_API_KEY=your-google-gemini-api-key
OPENWEATHER_API_KEY=your-openweather-api-key
FLASK_API_URL=http://localhost:5001
AXICOV_API_KEY=your-axicov-api-key (optional)
AXICOV_API_BASE=https://api.axicov.com/v1 (optional)
```

**Client/.env:**
```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Complete Application

1. Start MongoDB (if running locally)
2. Start Flask backend: `cd backend && python app.py`
3. Start Node.js server: `cd server && npm run dev`
4. Start React frontend: `cd Client && npm run dev`
5. Open `http://localhost:5173` in your browser

## 📁 Project Structure

```
GreenGrow/
├── backend/              # Flask backend for disease detection
│   ├── app.py           # Flask application
│   ├── requirements.txt # Python dependencies
│   └── venv/            # Python virtual environment
├── Client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context providers
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility libraries
│   ├── package.json
│   └── vite.config.ts
├── server/              # Node.js backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Route controllers
│   │   ├── models/      # Database models
│   │   ├── middleware/  # Express middleware
│   │   ├── services/    # Business logic services
│   │   └── config/      # Configuration files
│   ├── package.json
│   └── uploads/         # Uploaded files directory
├── model/               # ML model files
│   └── disease_model/   # TensorFlow model
└── Readme.md           # Project documentation
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Chat & AI
- `POST /api/chat/message` - Send text message to AI assistant
- `POST /api/chat/image-analysis` - Upload image for disease detection
- `POST /api/chat/voice-command` - Process voice commands
- `POST /api/chat/live-voice` - Live voice assistant session

### Market & News
- `GET /api/mandi` - Get market prices
- `GET /api/news` - Get agricultural news

### Health Checks
- `GET /api/health` - Node.js server health
- `GET /health` - Flask server health (port 5001)

## 🧪 Testing

```bash
# Test backend API
cd server
npm test

# Test frontend
cd Client
npm test
```

## 📦 Deployment

### Backend Deployment

```bash
cd server
npm run build
npm start
```

### Frontend Deployment

```bash
cd Client
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Flask Backend Deployment

The Flask backend can be deployed using:
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Run
- Railway
- Render

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- TensorFlow team for ML framework
- OpenWeatherMap for weather data
- All open-source contributors

## 📞 Support

For support, email somu8608@gmail.com or open an issue in the repository.

---

<div align="center">

  **Made with ❤️ by the GreenGrow Team**

  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer" />

</div>
