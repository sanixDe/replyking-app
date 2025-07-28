# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Get Your API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### Step 3: Create Environment File
Create a file named `.env` in the project root:
```env
REACT_APP_GEMINI_API_KEY=your_api_key_here
REACT_APP_GEMINI_MODEL=gemini-2.5-flash
```

### Step 4: Start the App
```bash
npm start
```

Visit `http://localhost:3000` to use the app!

## 🔧 Troubleshooting

### If you see "API key not configured":
- Make sure you created the `.env` file
- Verify your API key is correct
- Restart the server: `npm start`

### If you see "Unable to connect to Gemini API":
- Check your internet connection
- Verify your API key is valid
- Make sure you enabled the Gemini API in Google Cloud Console

### If file upload doesn't work:
- Use PNG, JPG, or JPEG files
- Keep files under 10MB
- Try a different image

## 📱 Test the App

1. **Upload a screenshot** of a chat conversation
2. **Select a tone** (Friendly, Casual, Formal, etc.)
3. **Click "Generate Replies"**
4. **Copy the replies** to your clipboard

## 🆘 Need Help?

- Check the browser console for error messages
- Review the full README.md for detailed instructions
- Ensure your API key is properly configured 