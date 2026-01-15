# Smart Student Management System - Frontend

Frontend built with React + TypeScript + Vite.

## Features

- ✅ Beautiful login page with 3D buttons and live counters
- ✅ Grade selection page with groups and teachers
- ✅ Interactive group page with search, filter, sort
- ✅ Student profile page with charts and audit trail
- ✅ Real-time updates via WebSocket
- ✅ Hebrew RTL support
- ✅ Responsive design
- ✅ Smooth animations with Framer Motion
- ✅ Charts with ECharts

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open browser:
```
http://localhost:3000
```

## Build

```bash
npm run build
```

## Pages

- `/login` - Login page
- `/grades` - Grade selection
- `/grade/:gradeId` - Groups in grade
- `/group/:groupId` - Students in group
- `/student/:studentId` - Student profile

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- Zustand (state management)
- Framer Motion (animations)
- ECharts (charts)
- Axios (HTTP client)
- Socket.io-client (WebSocket)

