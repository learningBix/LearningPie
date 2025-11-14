# LearningPie Frontend

A modern React-based frontend application for LearningPie - an educational platform providing interactive learning experiences for children.

## ✨ Features

- **User Authentication** - Secure login system with session management
- **Interactive Dashboard** - Browse subjects and activities
- **My Courses** - Track enrolled courses and learning progress
- **Profile Management** - Edit user profile and preferences
- **Parent Section** - Dedicated area for parent resources and monitoring
- **Responsive Design** - Mobile-friendly interface
- **Real-time API Integration** - Seamless backend communication

## 🛠 Tech Stack

- **React** 18.2.0 - Modern UI library
- **React Scripts** 5.0.1 - Build tooling and configuration
- **Axios** 1.6.0 - HTTP client for API requests
- **CSS3** - Custom styling for components

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher) or **yarn**
- **Backend API** running (default: https://localhost:8112)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LearningPie_frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Base URL
REACT_APP_API_BASE_URL=http://localhost:8112

# Optional: Other environment-specific settings
REACT_APP_ENV=development
```

### API Configuration

The API configuration is centralized in `src/config/api.js`:

- **Base URL**: Configured via `REACT_APP_API_BASE_URL` environment variable
- **Timeout**: 10 seconds (configurable)
- **Endpoints**: Login, Subjects, Activities, Courses, Profile updates

## 🏃 Running the Application

### Development Mode

Start the development server with hot reloading:

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Production Build

Create an optimized production build:

```bash
npm run build
```

Build files will be generated in the `build/` directory.

### Testing

Run the test suite:

```bash
npm test
```

## 📁 Project Structure

```
LearningPie_frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── assets/             # Images and static resources
│   │   ├── logo-pie.png
│   │   ├── art-craft-activity.jpg
│   │   ├── DevelopmentActivites.jpg
│   │   ├── Exploration.jpg
│   │   ├── Games.jpg
│   │   ├── MusicandMovement.png
│   │   ├── Puzzles.jpg
│   │   ├── Stories.png
│   │   └── subjects-header.svg
│   ├── components/         # React components
│   │   ├── Dashboard.jsx
│   │   ├── Dashboard.css
│   │   ├── EditProfile.jsx
│   │   ├── EditProfile.css
│   │   ├── MyCourses.jsx
│   │   ├── MyCourses.css
│   │   ├── ParentSection.jsx
│   │   └── ParentSection.css
│   ├── config/             # Configuration files
│   │   └── api.js          # API configuration
│   ├── services/           # API service layer
│   │   └── apiService.js   # API request handlers
│   ├── App.js              # Main application component
│   ├── App.css             # Global app styles
│   ├── index.js            # Application entry point
│   └── index.css           # Global styles
├── .env                    # Environment variables (not in repo)
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## 🧩 Components Overview

### Dashboard (`Dashboard.jsx`)
- Main landing page after login
- Displays available subjects and activities
- Category-based navigation
- Responsive grid layout

### MyCourses (`MyCourses.jsx`)
- Shows enrolled courses
- Tracks learning progress
- Course management interface

### EditProfile (`EditProfile.jsx`)
- User profile editing
- Form validation
- Profile updates via API

### ParentSection (`ParentSection.jsx`)
- Parent-specific resources
- Child progress monitoring
- Educational content for parents

## 🔌 API Integration

### Service Layer (`src/services/apiService.js`)

The application uses a centralized API service layer for all backend communication:

**Available Methods:**
- `login(credentials)` - User authentication
- `getSubjectsList()` - Fetch available subjects
- `getActivitiesList(subject)` - Get activities for a subject
- `getCoursesList()` - Retrieve user's courses
- `updateProfile(profileData)` - Update user profile

**Error Handling:**
- Automatic error interception
- User-friendly error messages
- Session management

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/login` | POST | User authentication |
| `/subjects_list` | GET | Get all subjects |
| `/activities_list` | GET | Get activities by subject |
| `/self_page_courses_list` | GET | Get user's courses |
| `/update_profile` | POST | Update user profile |

## 📜 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Start** | `npm start` | Runs app in development mode |
| **Build** | `npm run build` | Creates production build |
| **Test** | `npm test` | Runs test suite |
| **Eject** | `npm run eject` | Ejects from Create React App (irreversible) |

## 📚 Documentation

- **[API_SETUP.md](./API_SETUP.md)** - Detailed API setup and configuration guide
- **[CORS_FIX.md](./CORS_FIX.md)** - CORS troubleshooting and fixes
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Implementation details
- **[ENV_SETUP.txt](./ENV_SETUP.txt)** - Environment setup instructions

## 🔧 Troubleshooting

### CORS Issues
If you encounter CORS errors, refer to [CORS_FIX.md](./CORS_FIX.md) for detailed solutions.

### API Connection Issues
1. Ensure backend server is running on the correct port (default: 8112)
2. Verify `REACT_APP_API_BASE_URL` in `.env` matches your backend URL
3. Check for SSL certificate issues if using HTTPS

### Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


---

==