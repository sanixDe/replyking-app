# ReplyKing - Chat Reply Generator

A React TypeScript application that uses Google's Gemini AI to analyze chat screenshots and generate contextually appropriate replies in different tones.

## 🚀 Features

- 📤 **Image Upload** - Drag & drop or click to upload chat screenshots
- 🎭 **Tone Selection** - Choose from 6 different reply tones (Friendly, Casual, Formal, Professional, Flirty, Witty)
- 🤖 **AI Analysis** - Powered by Google's Gemini 2.5 Flash
- 📋 **Copy to Clipboard** - One-click copy for individual or all replies
- 📱 **Mobile-First** - Responsive design optimized for mobile devices
- ⚡ **Real-time Feedback** - Loading states and error handling
- 🎯 **Context-Aware** - Understands chat positioning (right side = you, left side = other person)

## 🛠️ Tech Stack

- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Google Gemini API** for AI analysis
- **Error Boundaries** for production error handling
- **Toast Notifications** for user feedback

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Google Gemini API key

### 1. Clone and Install

```bash
git clone <repository-url>
cd reply-king
npm install
```

### 2. Get Your Gemini API Key

1. **Visit Google AI Studio**: Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. **Sign in** with your Google account
3. **Create a new API key**:
   - Click "Create API Key"
   - Give it a name (e.g., "ReplyKing Chat Generator")
   - Copy the generated API key
4. **Enable the Gemini API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select or create a project
   - Enable the "Gemini API" for your project

### 3. Configure Environment Variables

1. **Create a `.env` file** in the project root:
   ```bash
   touch .env
   ```

2. **Add your API key** to the `.env` file:
   ```env
   # Google Gemini API Configuration
   # Get your API key from: https://makersuite.google.com/app/apikey
   REACT_APP_GEMINI_API_KEY=your_actual_api_key_here
   
   # Gemini Model Configuration
   # Options: gemini-2.5-flash (preferred), gemini-1.5-flash (backup)
   REACT_APP_GEMINI_MODEL=gemini-2.5-flash
   ```

   **Important**: Replace `your_actual_api_key_here` with your real API key from step 2.

### 4. Start Development Server

```bash
npm start
```

The app will be available at `http://localhost:3000`

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Deploy Options

#### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables in Netlify dashboard

#### Vercel
1. Import your GitHub repository
2. Framework preset: Create React App
3. Add environment variables in Vercel dashboard

#### GitHub Pages
```bash
npm install --save-dev gh-pages
```

Add to package.json:
```json
{
  "homepage": "https://yourusername.github.io/reply-king",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_GEMINI_API_KEY` | Your Gemini API key | `AIzaSyC...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_GEMINI_MODEL` | Gemini model to use | `gemini-2.5-flash` |

## 📱 Usage

### Step-by-Step Guide

1. **Upload Screenshot**
   - Drag & drop or click to upload a chat screenshot
   - Supported formats: PNG, JPG, JPEG
   - Max file size: 10MB

2. **Select Tone**
   - Choose from 6 different tones:
     - **Friendly**: Warm and approachable
     - **Casual**: Relaxed and informal
     - **Formal**: Professional and respectful
     - **Professional**: Business-appropriate
     - **Flirty**: Playful and charming
     - **Witty**: Clever and humorous

3. **Generate Replies**
   - Click "Generate Replies" button
   - AI analyzes the conversation context
   - Generates 3 different reply options

4. **Copy Replies**
   - Click individual copy buttons for specific replies
   - Use "Copy All" to copy all replies at once
   - Replies are automatically copied to your clipboard

### Understanding Chat Context

The app understands chat positioning:
- **Right side messages** = You (the person I'm speaking for)
- **Left side messages** = Other person
- AI maintains your voice and communication style from the conversation

## 🛠️ Development

### Available Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

### Project Structure

```
reply-king/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   ├── hooks/             # Custom React hooks
│   └── App.tsx            # Main app component
├── .env                   # Environment variables (not in git)
├── .env.example          # Environment template
└── README.md             # This file
```

## 🔒 Security

- API keys are stored in environment variables
- `.env` file is excluded from git
- No sensitive data is logged or stored
- HTTPS required for production

## 🐛 Troubleshooting

### Common Issues

**"API key not configured"**
- Check that `.env` file exists in project root
- Verify `REACT_APP_GEMINI_API_KEY` is set correctly
- Restart development server

**"Unable to connect to Gemini API"**
- Check internet connection
- Verify API key is valid
- Ensure Gemini API is enabled in Google Cloud Console

**"File upload doesn't work"**
- Use PNG, JPG, or JPEG files
- Keep files under 10MB
- Try a different image

**"Build fails"**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`
- Verify all dependencies are installed

## 📊 Performance

- Optimized bundle size with code splitting
- Lazy loading for better performance
- Error boundaries for graceful error handling
- Mobile-optimized touch targets and interactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Check the browser console for error messages
- Review the troubleshooting section above
- Ensure your API key is properly configured
- For bugs, please create an issue with detailed steps to reproduce

---

**Made with ❤️ using React, TypeScript, and Google Gemini AI**
