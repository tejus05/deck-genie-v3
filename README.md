<div align="center">

  <img src="https://deck-genie-v3-web.up.railway.app/logo-white.png" alt="DeckGenie Logo" width="400" height="400"/> <br>
  
  **Transform your ideas into investor-ready decks**
  
  
  [![🚀 Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Try%20Now-6366f1?style=for-the-badge&labelColor=1e293b)](https://deck-genie-v3-web.up.railway.app) 
  [![📄 License](https://img.shields.io/badge/📄%20License-Apache%202.0-22c55e?style=for-the-badge&labelColor=1e293b)](LICENSE.txt) 
  [![⭐ Star](https://img.shields.io/badge/⭐%20Star-on%20GitHub-f59e0b?style=for-the-badge&labelColor=1e293b)](https://github.com/tejus05/deck-genie-v3) 
  
</div>

## 🌟 Overview

DeckGenie is a full-stack AI presentation generator that creates professional, investor-ready presentations using Google Gemini AI. Built with Next.js and FastAPI, it offers a modern, intuitive interface for generating compelling slide decks with minimal effort.

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎨 **Design System**
- **8 Versatile Slide Layouts** for different content needs
- **Multiple Professional Themes** with real-time switching
- **Interactive Charts** (Bar, Line, Pie, Scatter, Bubble)
- **Responsive Design** for all screen sizes

</td>
<td width="50%">

### 🤖 **AI-Powered**
- **Google Gemini Integration** for intelligent content
- **5 Presentation Tones** (Professional, Executive, Technical, Startup, Conversational)
- **Smart Layout Selection** by AI
- **Real-time Content Streaming**

</td>
</tr>
<tr>
<td width="50%">

### 🎯 **Management**
- **Real-time Editing** with auto-save
- **Drag & Drop** slide reordering
- **Presentation Mode** with full-screen navigation
- **Export to PDF/PPTX** with full fidelity

</td>
<td width="50%">

### 🖼️ **Media**
- **Unsplash Image Integration** for high-quality visuals
- **Image Upload Support** 
- **Smart Image Selection** with context awareness
- **Multiple Aspect Ratios** optimized per layout

</td>
</tr>
</table>

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Infrastructure |
|----------|---------|----------------|
| Next.js 14 | FastAPI | Railway |
| TypeScript | Google Gemini AI | SQLite |
| Tailwind CSS | LangChain | Puppeteer |
| Redux Toolkit | Python-PPTX | ChromeDriver |

</div>

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.11+
- Google API Key (for Gemini AI)

### Step 1: Clone & Setup
```bash
git clone https://github.com/tejus05/deck-genie-v3.git
cd deck-genie-v3
```

### Step 2: Environment Configuration
Create a `.env` file in the root directory:
```bash
GOOGLE_API_KEY=your_google_api_key_here
UNSPLASH_API_KEY=your_unsplash_api_key_here
```

### Step 3: Install Dependencies
```bash
# Install all dependencies (frontend + backend)
pnpm setup
```

### Step 4: Start Development
```bash
# Start both frontend and backend
pnpm dev

# Or start individually:
# Frontend: pnpm dev:frontend (localhost:3000)
# Backend: pnpm dev:backend (localhost:8000)
```

> **🎉 You're ready!** Visit [localhost:3000](http://localhost:3000) to start creating presentations.

## 🎨 Themes & Layouts

<details>
<summary><strong>🎨 Professional Themes</strong></summary>

Multiple carefully crafted themes including light, dark, and vibrant color schemes to match your presentation style and brand identity.

</details>

<details>
<summary><strong>📊 8 Slide Layouts</strong></summary>

Versatile layouts covering hero slides, content lists, image showcases, data visualization, and mixed content formats to suit any presentation need.

</details>

## 🚀 Deployment

This application is deployed on **Railway** with automatic CI/CD pipelines. The platform handles environment variables, scaling, and monitoring automatically.

## 🤝 Contributing

We welcome contributions! Here's how you can help:

<div align="center">

[![Fork](https://img.shields.io/badge/Fork-Repository-blue?style=for-the-badge)](https://github.com/tejus05/deck-genie-v3/fork)
[![Issues](https://img.shields.io/badge/Report-Issues-red?style=for-the-badge)](https://github.com/tejus05/deck-genie-v3/issues)
[![PRs](https://img.shields.io/badge/Submit-PR-green?style=for-the-badge)](https://github.com/tejus05/deck-genie-v3/pulls)

</div>

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

Licensed under the Apache License 2.0 - see [LICENSE.txt](LICENSE.txt) for details.

## 🙏 Acknowledgments

<div align="center">

### 💝 Special Thanks

This project builds upon the outstanding work of [**Presenton**](https://github.com/presenton/presenton), an innovative open-source AI presentation generator. We're grateful to the Presenton community for providing such a solid foundation that enabled us to create DeckGenie.

---

### ⚡ Powered By

<table align="center">
<tr>
<td align="center"><strong>🤖 AI</strong><br>Google Gemini</td>
<td align="center"><strong>🎨 Frontend</strong><br>Next.js</td>
<td align="center"><strong>⚙️ Backend</strong><br>FastAPI</td>
<td align="center"><strong>🔗 Framework</strong><br>LangChain</td>
</tr>
</table>

</div>

---

<div align="center">

**Built with ❤️ for better presentations**

[![🚀 Try DeckGenie](https://img.shields.io/badge/🚀%20Try%20DeckGenie-Get%20Started-6366f1?style=for-the-badge&labelColor=1e293b)](https://deck-genie-v3-web.up.railway.app)

</div>
