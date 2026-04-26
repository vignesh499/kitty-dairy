# 💖 Kitty's Diary 💖

A private, aesthetic, and fully functional digital diary for writing daily entries, built with the MERN stack (MongoDB, Express, React, Node.js) and Vite.

## ✨ Features

*   **Aesthetic UI**: Soft, romantic, minimal design with Framer Motion animations.
*   **Authentication**: JWT-based login, signup, and a 4-digit PIN lock to keep the diary safe.
*   **Rich Text Editor**: Write beautifully formatted entries with font selection, sizes, colors, highlights, and text alignment.
*   **Customization**: Choose from preset themes (Pastel, Dark, Floral, Cute, Minimal), change background colors, gradients, or even upload a custom background image.
*   **Calendar View**: Easily see which days have entries and navigate through months.
*   **Mood Tracker**: Add mood emojis to your entries.
*   **Data Persistence**: Auto-save feature ensures you never lose a memory.
*   **Export**: Export your entire diary as a PDF.

## 📁 Project Structure

```
kittys-diary/
├── backend/            # Express + MongoDB API
│   ├── src/
│   │   ├── config/     # Database configuration
│   │   ├── controllers/# API logic (auth, entries)
│   │   ├── middleware/ # JWT Auth middleware
│   │   ├── models/     # Mongoose schemas (User, DiaryEntry)
│   │   └── routes/     # Express routers
│   ├── .env.example    # Backend environment variables
│   ├── package.json
│   └── server.js       # Backend entry point
│
└── frontend/           # React + Vite application
    ├── src/
    │   ├── api/        # Axios API client
    │   ├── components/ # Reusable UI components (Sidebar, Layout, Editor)
    │   ├── context/    # React Context (Auth, Diary state)
    │   ├── pages/      # Route pages (Login, Diary, Entries, Settings)
    │   ├── App.jsx     # Main Router
    │   ├── index.css   # Tailwind & Custom CSS
    │   └── main.jsx    # React DOM entry
    ├── .env.local      # Frontend environment variables
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## 🚀 Installation & Local Development

### 1. Prerequisites
*   Node.js (v18 or higher recommended)
*   MongoDB Atlas Account (or a local MongoDB instance)

### 2. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file by copying the example:
    ```bash
    cp .env.example .env
    ```
4.  Update the `.env` file with your specific variables (especially `MONGO_URI`).
5.  Start the development server:
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:5000`.

### 3. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  The `vite.config.js` is already set up to proxy API requests to `http://localhost:5000`. If you need to specify a different backend URL for local development, create a `.env.local` file:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```
4.  Start the Vite development server:
    ```bash
    npm run dev
    ```
    The app will open at `http://localhost:5173`.

## 🌍 Deployment Guide

This guide covers deploying the backend to Render, the frontend to Vercel, and the database to MongoDB Atlas.

### 1. MongoDB Atlas (Database)
1.  Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a new Cluster (the free tier is perfect).
3.  Under "Database Access", create a new user with a password.
4.  Under "Network Access", allow access from anywhere (`0.0.0.0/0`) or specific IP addresses.
5.  Click "Connect" on your cluster, choose "Connect your application", and copy the connection string. Replace `<username>` and `<password>` with the credentials you created.

### 2. GitHub (Code Hosting)
1.  Initialize a Git repository in the root `kittys-diary` folder:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
    *Make sure you have `.gitignore` files in both backend and frontend to ignore `node_modules` and `.env` files.*
2.  Push your code to a new repository on GitHub.

### 3. Render (Backend Deployment)
1.  Create an account at [Render](https://render.com/).
2.  Click "New +" and select "Web Service".
3.  Connect your GitHub account and select your `kittys-diary` repository.
4.  **Configuration:**
    *   **Name:** `kittys-diary-backend` (or similar)
    *   **Root Directory:** `backend`
    *   **Environment:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
5.  **Environment Variables:** Add the following under "Environment Variables":
    *   `NODE_ENV`: `production`
    *   `MONGO_URI`: *(Your MongoDB connection string from Step 1)*
    *   `JWT_SECRET`: *(A long, random, secure string)*
    *   `CLIENT_URL`: *(Leave this blank for now, you will update it after deploying the frontend)*
6.  Click "Create Web Service". Render will build and deploy your backend. Copy the deployed URL (e.g., `https://kittys-diary-backend.onrender.com`).

### 4. Vercel (Frontend Deployment)
1.  Create an account at [Vercel](https://vercel.com/).
2.  Click "Add New..." -> "Project".
3.  Import your `kittys-diary` GitHub repository.
4.  **Configuration:**
    *   **Framework Preset:** `Vite`
    *   **Root Directory:** `frontend`
5.  **Environment Variables:** Add the following:
    *   `VITE_API_URL`: *(Your Render backend URL followed by `/api`, e.g., `https://kittys-diary-backend.onrender.com/api`)*
6.  Click "Deploy". Vercel will build and deploy your frontend. Copy the deployed URL (e.g., `https://kittys-diary.vercel.app`).

### 5. Finalize Configuration
1.  Go back to your **Render Web Service** dashboard.
2.  Update the `CLIENT_URL` environment variable to match your Vercel frontend URL (e.g., `https://kittys-diary.vercel.app`). This is crucial for CORS to work correctly.
3.  Trigger a manual deploy on Render if it doesn't automatically restart.

---
*Built with 💖 for Kitty.*
