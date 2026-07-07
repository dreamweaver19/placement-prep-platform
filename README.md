# 🚀 AI-Powered Placement Prep Platform

An intelligent, full-stack career preparation platform designed to help software engineering candidates ace their interviews. Built with the MERN stack and powered by the Google Gemini API, this platform offers real-time ATS resume scoring, voice-enabled mock interviews, and advanced DSA progress tracking.

## ✨ Key Features

- **🧠 AI Resume Analyzer:** Real-time ATS scoring, keyword gap analysis, and automated bullet-point optimization using the Google XYZ formula (powered by Gemini API).
- **🎙️ Voice-Enabled Mock Interviews:** Bidirectional voice communication (STT/TTS) using the Web Speech API. Dynamically generates company and role-specific technical questions and provides AI feedback on your spoken answers.
- **📊 Interactive Analytics Dashboard:** Custom SVG-based visualizations including glassmorphism donut charts for DSA progress and line graphs tracking historical mock interview performance.
- **🔐 Secure Authentication:** JWT-based auth with encrypted passwords and protected API routes.
- **💻 DSA Tracker:** Track your LeetCode/Data Structures progress, filter by difficulty, and visualize completion rates.

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS (Custom Glassmorphism UI), Context API, Web Speech API
- **Backend:** Node.js, Express.js, RESTful APIs
- **Database:** MongoDB (Mongoose ORM)
- **AI Integration:** Google Gemini API (`gemini-flash-latest`)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Database (Local or MongoDB Atlas)
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dreamweaver19/placement-prep-platform.git
   cd placement-prep-platform
   ```

2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Variables:**
   Create a `.env` file in the `server` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Run the Application:**
   Open two terminals.
   
   *Terminal 1 (Backend):*
   ```bash
   cd server
   npm run dev
   ```
   
   *Terminal 2 (Frontend):*
   ```bash
   cd client
   npm run dev
   ```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📝 License
This project is open-source and available under the MIT License.
