# LearningPie Frontend

A React-based web application for LearningPie, an interactive educational platform designed for children.

## Overview

LearningPie provides an engaging learning experience with various subjects and activities. This frontend application connects seamlessly with the backend API to deliver educational content, track progress, and manage user profiles.

## Key Features

- User authentication with secure session management
- Interactive dashboard with subjects and activities
- Course enrollment and progress tracking
- Profile management for students
- Parent section for monitoring and resources
- Responsive design for all devices

## Tech Stack

- React 18.2.0
- Axios for API communication
- React Scripts 5.0.1
- Custom CSS styling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (default: `http://localhost:8112`)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd LearningPie_frontend

# Install dependencies
npm install

# Create .env file with your API configuration
echo "REACT_APP_API_BASE_URL=http://localhost:8112" > .env

# Start development server
npm start
```

The application will open at `http://localhost:3000`

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Configuration

The API configuration is managed in `src/config/api.js`. Set your backend URL using the `REACT_APP_API_BASE_URL` environment variable in the `.env` file.

## Project Structure

```
src/
├── components/         # React components (Dashboard, MyCourses, EditProfile, etc.)
├── config/            # API configuration
├── services/          # API service layer
├── assets/            # Images and static files
└── App.js             # Main application component
```

## Main Components

**Dashboard** - Landing page displaying available subjects and activities  
**MyCourses** - Course enrollment and progress tracking  
**EditProfile** - User profile management  
**ParentSection** - Parent resources and child monitoring..

## API Integration

The application communicates with the backend through a centralized service layer (`src/services/apiService.js`) that handles authentication, data fetching, and profile updates.

## Troubleshooting

**CORS Issues**: Check that your backend has proper CORS configuration for the frontend origin.

**Connection Issues**: Verify the backend server is running and the `REACT_APP_API_BASE_URL` in `.env` matches your backend URL.

**Port Conflict**: If port 3000 is in use, the CLI will prompt you to use a different port.

## Available Scripts

- `npm start` - Run development server
- `npm build` - Create production build
- `npm test` - Run tests
