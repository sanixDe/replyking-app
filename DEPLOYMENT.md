# Deployment Guide

This guide covers deploying ReplyKing to various platforms.

## 🚀 Quick Deploy Options

### Netlify (Recommended)

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `build`

3. **Set Environment Variables**
   - Go to Site settings > Environment variables
   - Add `REACT_APP_GEMINI_API_KEY` with your API key
   - Add `REACT_APP_GEMINI_MODEL` with `gemini-2.5-flash`

4. **Deploy**
   - Click "Deploy site"
   - Your app will be live at `https://your-app-name.netlify.app`

### Vercel

1. **Import Project**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure**
   - Framework preset: Create React App
   - Build command: `npm run build`
   - Output directory: `build`

3. **Environment Variables**
   - Add `REACT_APP_GEMINI_API_KEY`
   - Add `REACT_APP_GEMINI_MODEL`

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-app-name.vercel.app`

### GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/reply-king",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configure**
   - Public directory: `build`
   - Single-page app: Yes
   - GitHub Actions: No

4. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## 🔧 Environment Variables

### Required for All Platforms

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_GEMINI_API_KEY` | Your Gemini API key | `AIzaSyC...` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_GEMINI_MODEL` | Gemini model | `gemini-2.5-flash` |

## 📋 Pre-Deployment Checklist

- [ ] API key is configured
- [ ] Build passes locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] Environment variables are set in deployment platform
- [ ] Custom domain is configured (if needed)
- [ ] SSL certificate is enabled
- [ ] Analytics are configured (if using)

## 🐛 Troubleshooting

### Build Fails
- Check for TypeScript errors: `npm run build`
- Clear cache: `rm -rf node_modules && npm install`
- Verify all dependencies are installed

### Environment Variables Not Working
- Ensure variable names start with `REACT_APP_`
- Check platform-specific environment variable settings
- Restart deployment after adding variables

### API Errors in Production
- Verify API key is correct
- Check CORS settings if needed
- Ensure Gemini API is enabled in Google Cloud Console

## 🔒 Security Considerations

- Never commit `.env` files to git
- Use environment variables for all secrets
- Enable HTTPS in production
- Monitor API usage and costs
- Set up proper error logging

## 📊 Performance Optimization

- Enable gzip compression
- Use CDN for static assets
- Optimize images before upload
- Enable caching headers
- Monitor Core Web Vitals

## 🆘 Support

For deployment issues:
1. Check platform-specific documentation
2. Verify environment variables are set correctly
3. Test locally with production build
4. Check browser console for errors
5. Monitor API usage and limits 