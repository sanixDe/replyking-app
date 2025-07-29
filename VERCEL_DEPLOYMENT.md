# Vercel Deployment Guide for ReplyKing

This guide covers deploying your ReplyKing PWA to Vercel with proper production configuration.

## 🚀 Quick Deploy

### Option 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod
```

### Option 2: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables
5. Deploy

## ⚙️ Environment Variables

Set these in your Vercel project settings:

### Required Variables:
```env
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

### Optional Variables:
```env
REACT_APP_GEMINI_MODEL=gemini-2.5-flash
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_REPORTING=true
REACT_APP_GA_ID=your_google_analytics_id
REACT_APP_ERROR_REPORTING_ENDPOINT=https://your-error-service.com/api/errors
REACT_APP_PERFORMANCE_ENDPOINT=https://your-performance-service.com/api/metrics
```

## 📁 Project Structure

```
reply-king/
├── vercel.json              # Vercel configuration
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── sw.js               # Service worker
│   ├── offline.html        # Offline fallback
│   └── index.html          # Main HTML file
├── src/
│   ├── config/
│   │   └── environment.ts  # Environment configuration
│   ├── services/
│   │   └── errorReportingService.ts
│   └── components/
│       └── InstallPrompt.tsx
└── package.json            # Optimized for production
```

## 🔧 Configuration Files

### vercel.json
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **SPA Routing**: All routes redirect to index.html
- **Service Worker**: Proper caching headers
- **Security Headers**: XSS protection, content type options
- **Static Assets**: Long-term caching for images and CSS/JS

### package.json Optimizations
- **Source Maps**: Disabled in production (`GENERATE_SOURCEMAP=false`)
- **Engines**: Node.js 16+ requirement
- **Build Scripts**: Optimized for Vercel
- **Dependencies**: Properly organized

## 🛠️ Build Process

### Pre-build Checks:
1. **Environment Variables**: All required vars are set
2. **Dependencies**: All packages installed
3. **TypeScript**: No compilation errors
4. **PWA Assets**: Icons and manifest exist

### Build Commands:
```bash
# Development build
npm run build

# Production build (Vercel uses this)
npm run vercel-build

# PWA build with analysis
npm run pwa:build
```

## 📱 PWA Features

### ✅ Implemented:
- [x] Web App Manifest
- [x] Service Worker with offline support
- [x] Install prompts for iOS/Android
- [x] Apple Touch Icons
- [x] Offline fallback page
- [x] Proper caching strategies

### 🔧 PWA Configuration:
- **Cache Strategy**: Network-first for API calls
- **Static Assets**: Cache-first with long TTL
- **Service Worker**: No-cache for updates
- **Offline Support**: Graceful degradation

## 🔒 Security Headers

Vercel automatically applies these security headers:
- **X-Content-Type-Options**: `nosniff`
- **X-Frame-Options**: `DENY`
- **X-XSS-Protection**: `1; mode=block`
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: Restricted camera/microphone access

## 📊 Performance Optimization

### Bundle Optimization:
- **Source Maps**: Disabled in production
- **Tree Shaking**: Unused code removed
- **Code Splitting**: Automatic by React
- **Minification**: Enabled by default

### Caching Strategy:
- **Static Assets**: 1 year cache
- **Service Worker**: No cache
- **Manifest**: 1 hour cache
- **API Responses**: Network-first

## 🐛 Troubleshooting

### Build Failures:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run build

# Test locally
npm run build:analyze
```

### Environment Variables:
- Verify all required vars are set in Vercel dashboard
- Check variable names start with `REACT_APP_`
- Ensure no trailing spaces in values

### PWA Issues:
- Check manifest.json syntax
- Verify service worker registration
- Test offline functionality
- Check icon file paths

## 📈 Monitoring

### Vercel Analytics:
- **Performance**: Core Web Vitals
- **Errors**: JavaScript exceptions
- **Usage**: Page views and sessions

### Custom Monitoring:
- **Error Reporting**: Configured via environment
- **Analytics**: Google Analytics integration
- **Performance**: Custom metrics collection

## 🚀 Deployment Checklist

### Pre-deployment:
- [ ] All environment variables set
- [ ] API key is valid and has quota
- [ ] PWA icons are PNG format
- [ ] No console.log statements in production
- [ ] Error boundaries are in place
- [ ] Service worker is registered

### Post-deployment:
- [ ] App loads correctly
- [ ] PWA install prompt appears
- [ ] Offline functionality works
- [ ] API calls succeed
- [ ] Performance is acceptable
- [ ] Security headers are applied

## 🔄 Continuous Deployment

### GitHub Integration:
1. Connect your GitHub repository
2. Vercel auto-deploys on push to main
3. Preview deployments for pull requests
4. Automatic rollback on failures

### Environment Management:
- **Production**: Main branch
- **Staging**: Develop branch (optional)
- **Preview**: Pull request deployments

## 📞 Support

### Vercel Support:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Vercel Status](https://vercel-status.com)

### PWA Resources:
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Checklist](https://web.dev/pwa-checklist/)

---

**Your ReplyKing PWA is now ready for Vercel deployment! 🚀** 