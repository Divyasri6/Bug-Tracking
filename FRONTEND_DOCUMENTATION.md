# Bug Tracker Frontend Documentation

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Project Structure](#project-structure)
5. [Features](#features)
6. [Step-by-Step Guide](#step-by-step-guide)
7. [API Integration](#api-integration)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Bug Tracker Frontend is a modern React application built with Vite, React Router, and Tailwind CSS. It provides a user-friendly interface for managing bugs, viewing dashboards, and getting AI-powered suggestions.

**Tech Stack:**
- React 18+
- Vite (Build Tool)
- React Router DOM (Navigation)
- Tailwind CSS (Styling)
- Axios (HTTP Client)
- React Hot Toast (Notifications)
- Lucide React (Icons)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **Backend API** running on `http://localhost:8080`
- **AI Service** running on `http://localhost:5001` (optional, for AI features)

### Verify Installation

```bash
node --version
npm --version
```

> 📸 **Screenshot Placeholder:** Terminal showing Node.js and npm versions

---

## Installation

### Step 1: Navigate to Frontend Directory

```bash
cd bug-tracker-frontend
```

> 📸 **Screenshot Placeholder:** Terminal showing directory navigation

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `react` and `react-dom`
- `react-router-dom`
- `axios`
- `react-hot-toast`
- `lucide-react`
- `tailwindcss` and related packages

> 📸 **Screenshot Placeholder:** Terminal showing npm install progress

### Step 3: Verify Installation

Check that `node_modules` folder exists and `package.json` has all dependencies:

```bash
ls node_modules | head -10
```

> 📸 **Screenshot Placeholder:** Terminal showing node_modules directory

---

## Project Structure

```
bug-tracker-frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx          # Top navigation bar
│   │   └── StatusBadge.jsx     # Status and Priority badge components
│   ├── pages/
│   │   ├── Home.jsx            # Dashboard with summary stats
│   │   ├── BugList.jsx          # List of all bugs (table/card view)
│   │   ├── CreateBug.jsx       # Create new bug form
│   │   ├── EditBug.jsx         # Edit existing bug form
│   │   └── ViewBug.jsx          # View bug details
│   ├── services/
│   │   ├── api.js              # Axios instance configuration
│   │   ├── bugService.js       # Bug-related API calls
│   │   └── aiService.js        # AI service API calls
│   ├── App.jsx                 # Main app component with routing
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global styles and Tailwind imports
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

> 📸 **Screenshot Placeholder:** File explorer showing project structure

---

## Features

### 1. Home Dashboard
- Summary statistics cards (Total Bugs, Open Bugs, High Priority, Assigned Bugs)
- Quick action buttons
- Clickable stat cards that filter bugs

### 2. Bug List Page
- **Table View:** Traditional table layout with all bug details
- **Card/Grid View:** Modern card-based layout
- Search functionality (by title or status)
- Filter by status and priority
- View, Edit, and Delete actions

### 3. Create Bug Page
- Form to create new bugs
- AI-powered bug analysis and suggestions
- Employee assignment dropdown (shows only available employees)
- Form validation

### 4. Edit Bug Page
- Update bug details
- Change employee assignment
- Update status and priority

### 5. View Bug Page
- Detailed view of a single bug
- All bug information displayed
- Quick navigation to edit

> 📸 **Screenshot Placeholder:** Home dashboard page

---

## Step-by-Step Guide

### Step 1: Start the Development Server

```bash
npm run dev
```

You should see output like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

> 📸 **Screenshot Placeholder:** Terminal showing Vite dev server starting

### Step 2: Open the Application

Open your browser and navigate to:
```
http://localhost:5173
```

> 📸 **Screenshot Placeholder:** Browser showing the application home page

### Step 3: Navigate the Application

#### 3.1 Home Page (`/`)

The home page displays:
- **Summary Cards:** Four cards showing key metrics
  - Total Bugs
  - Open Bugs (with yellow accent)
  - High Priority Bugs (with red accent)
  - Assigned Bugs (with purple accent)
- **Quick Actions:** Two action cards
  - "View All Bugs" - Navigate to bug list
  - "Create New Bug" - Navigate to create form

**How to use:**
1. Click on any summary card to filter bugs
2. Click "View All Bugs" to see all bugs
3. Click "Create New Bug" to add a new bug

> 📸 **Screenshot Placeholder:** Home page with summary cards

#### 3.2 Bug List Page (`/bugs`)

**Table View (Default):**
- Shows all bugs in a table format
- Columns: ID, Title, Description, Status, Priority, Assigned To, Created Date, Actions
- Search bar at the top
- Filter dropdowns for Status and Priority
- View toggle buttons (Table/Card) in the top right

**Card View:**
- Shows bugs in a responsive grid (1 column mobile, 2 tablet, 3 desktop)
- Each card shows: Title, Description, Status, Priority, Assigned To, Created Date
- Action buttons: View, Edit, Delete

**How to use:**
1. **Search:** Type in the search bar to filter by title or status
2. **Filter:** Use dropdowns to filter by status or priority
3. **Switch Views:** Click Table/Card icons to toggle views
4. **Actions:** Click View, Edit, or Delete buttons on each bug

> 📸 **Screenshot Placeholder:** Bug List page in table view
> 📸 **Screenshot Placeholder:** Bug List page in card view

#### 3.3 Create Bug Page (`/create`)

**Form Fields:**
- **Title** (Required): Bug title
- **Description** (Required): Detailed bug description
- **Status:** OPEN, IN_PROGRESS, RESOLVED, CLOSED
- **Priority:** LOW, MEDIUM, HIGH, CRITICAL
- **Assigned To:** Dropdown showing available employees

**AI Features:**
- **AI Suggestion Section:** Get AI-powered analysis
  - Select analysis type: Business or Developer
  - Click "Get AI Suggestion" button
  - Review suggestions (Business Impact, Possible Causes, Resolutions)
  - AI automatically updates priority based on analysis

**How to use:**
1. Fill in Title and Description
2. (Optional) Click "Get AI Suggestion" to get AI analysis
3. Select Status and Priority
4. Select an employee from the "Assigned To" dropdown
5. Click "Create Bug" to save

> 📸 **Screenshot Placeholder:** Create Bug form
> 📸 **Screenshot Placeholder:** AI Suggestion section with results

#### 3.4 Edit Bug Page (`/edit/:id`)

Similar to Create Bug page, but pre-filled with existing bug data.

**How to use:**
1. Modify any field
2. Change employee assignment if needed
3. Click "Save Changes" to update

> 📸 **Screenshot Placeholder:** Edit Bug form

#### 3.5 View Bug Page (`/bugs/:id`)

Displays complete bug information in a detailed view.

**Information Shown:**
- Bug ID
- Title
- Description
- Status (with colored badge)
- Priority (with colored badge)
- Assigned To
- Created Date
- Updated Date

**Actions:**
- Edit button (top right)
- Back button (top right)

> 📸 **Screenshot Placeholder:** View Bug details page

---

## API Integration

### Backend Connection

The frontend connects to the Spring Boot backend at `http://localhost:8080`.

**Configuration:** `src/services/api.js`
```javascript
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});
```

### API Endpoints Used

1. **Bugs:**
   - `GET /bugs` - Get all bugs
   - `GET /bugs/:id` - Get bug by ID
   - `POST /bugs` - Create bug
   - `PUT /bugs/:id` - Update bug
   - `DELETE /bugs/:id` - Delete bug

2. **Employees:**
   - `GET /employees` - Get all employees

### AI Service Connection

The frontend connects to the Python AI service at `http://localhost:5001`.

**Configuration:** `src/services/aiService.js`
```javascript
const AI_BASE_URL = 'http://localhost:5001';
```

**Endpoints:**
- `POST /ai/suggest` - Get AI bug analysis and priority suggestion

---

## Troubleshooting

### Issue: "Failed to load bugs"

**Possible Causes:**
1. Backend not running
2. CORS issues
3. Network connectivity

**Solutions:**
1. Ensure backend is running on `http://localhost:8080`
2. Check browser console for CORS errors
3. Verify `application.properties` has `@CrossOrigin` configured

> 📸 **Screenshot Placeholder:** Browser console showing CORS error

### Issue: "Failed to load employees"

**Possible Causes:**
1. Backend not running
2. Employees not initialized in database
3. EmployeeController not registered

**Solutions:**
1. Restart the backend application
2. Check backend logs for "Initializing employee data..."
3. Verify EmployeeController is compiled and registered

> 📸 **Screenshot Placeholder:** Browser console showing employee loading error

### Issue: "AI service is unavailable"

**Possible Causes:**
1. AI service not running
2. Wrong port (should be 5001)
3. Network connectivity

**Solutions:**
1. Start the AI service: `python ai-service/main.py`
2. Verify it's running on port 5001
3. Check browser console for connection errors

> 📸 **Screenshot Placeholder:** Browser console showing AI service error

### Issue: Styles not applying

**Solutions:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Restart dev server: `npm run dev`

### Issue: Page not found (404)

**Solutions:**
1. Check React Router routes in `App.jsx`
2. Ensure you're using correct URLs:
   - `/` - Home
   - `/bugs` - Bug List
   - `/create` - Create Bug
   - `/edit/:id` - Edit Bug
   - `/bugs/:id` - View Bug

---

## Development Commands

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Additional Notes

- The application uses client-side routing (React Router)
- All API calls are made via Axios
- Toast notifications appear in the top-right corner
- The app is fully responsive (mobile, tablet, desktop)
- Employee dropdown only shows employees with `availabilityStatus = 'AVAILABLE'`

---

## Next Steps

1. Add screenshots to each section marked with 📸
2. Customize styling if needed
3. Add additional features as required
4. Deploy to production when ready

---

**Last Updated:** November 2025

