# Kitty's Diary 💖

A private, beautiful, and fully-functional digital diary designed for Kitty. This application offers a soft, romantic, minimal aesthetic alongside powerful features like a rich text editor, calendar view, mood tracking, auto-save, PDF export, and full customization of themes, fonts, and backgrounds.

## Features ✨
- **Authentication**: JWT-based login & signup with encrypted passwords and an optional 4-digit PIN lock.
- **Rich Text Editor**: Formatting (bold, italic, underline, highlighting), alignment, font selection, and text colors. Auto-saves every 30 seconds.
- **Calendar System**: Click on any date to view or write an entry. Entries are marked with a mood emoji.
- **Customization**:
  - 5 Theme presets (Pastel, Dark, Floral, Cute, Minimal).
  - Backgrounds: Solid color, gradient, or upload a custom image.
  - Fonts: Choose from beautiful Google Fonts (Nunito, Playfair Display, Dancing Script, etc.).
- **PDF Export**: Download all your entries as a styled PDF document.
- **Search**: Easily search across all past entries by title or content.

## Folder Structure 📁
```
kittys-diary/
├── backend/                  # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/           # Database config
│   │   ├── controllers/      # Route controllers (Auth, Entries)
│   │   ├── middleware/       # JWT Auth middleware
│   │   ├── models/           # Mongoose schemas (User, DiaryEntry)
│   │   └── routes/           # Express routes
│   ├── .env.example          # Backend env template
│   └── server.js             # Entry point
│
└── frontend/                 # React + Vite + Tailwind CSS
    ├── src/
    │   ├── api/              # Axios API setup
    │   ├── components/       # Reusable components (Layout, Sidebar, Editor)
    │   ├── context/          # React Context (AuthContext, DiaryContext)
    │   ├── pages/            # Application pages (Auth, Diary, Entries, Settings)
    │   ├── App.jsx           # App routing
    │   ├── main.jsx          # React entry
    │   └── index.css         # Global styles & Tailwind
    ├── tailwind.config.js    # Tailwind configuration
    └── .env.example          # Frontend env template
```

## Installation Steps 🛠️

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (e.g., from MongoDB Atlas)

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Edit the `.env` file and replace the `MONGO_URI` with your actual MongoDB connection string.
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## Deployment Guide 🚀

### Step 1: Push Code to GitHub
1. Initialize a Git repository in the root directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Kitty's Diary"
   ```
2. Create a new repository on GitHub.
3. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/kittys-diary.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy Database (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster.
2. In Database Access, create a user and save the username and password.
3. In Network Access, allow access from anywhere (`0.0.0.0/0`).
4. Click "Connect", choose "Connect your application", and copy the connection string. Replace `<password>` with the password you created.

### Step 3: Deploy Backend (Render)
1. Go to [Render](https://render.com/) and sign in.
2. Click "New" -> "Web Service".
3. Connect your GitHub repository.
4. Set the Root Directory to `backend`.
5. Set the Build Command to `npm install`.
6. Set the Start Command to `node server.js`.
7. Add Environment Variables:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A strong random string for JWT signing.
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: Keep this empty for now (update it after Vercel deployment).
8. Click "Create Web Service". Once deployed, copy the Render URL (e.g., `https://kittys-diary-backend.onrender.com`).

### Step 4: Deploy Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/) and sign in.
2. Click "Add New" -> "Project" and import your GitHub repository.
3. Set the Framework Preset to "Vite".
4. Set the Root Directory to `frontend`.
5. In Environment Variables, add:
   - `VITE_API_URL`: Your Render backend URL + `/api` (e.g., `https://kittys-diary-backend.onrender.com/api`).
6. Click "Deploy".

### Step 5: Final Configuration
1. Go back to Render (Backend settings).
2. Update the `CLIENT_URL` environment variable with your new Vercel frontend URL (e.g., `https://kittys-diary.vercel.app`). This is crucial for CORS!
3. Restart the Render Web Service.

You're done! Kitty's Diary is now live! 💖
