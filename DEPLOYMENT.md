# Deployment Guide

## Pre-deployment Checklist

### 1. Environment Setup
- [ ] Copy `.env.example` to `.env.production`
- [ ] Set all required environment variables
- [ ] Configure database connection string
- [ ] Set NextAuth secret and URL
- [ ] Configure any third-party API keys

### 2. Build Validation
```bash
npm run prebuild  # Validates configuration
npm run build:production  # Test production build
npm run start:production  # Test production server
```

### 3. Performance Testing
```bash
npm run test:ci  # Run all tests
npx lighthouse http://localhost:3000 --output=html  # Performance audit
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Environment Variables**
   Set in Vercel dashboard or via CLI:
   ```bash
   vercel env add DATABASE_URL production
   vercel env add NEXTAUTH_SECRET production
   ```

### Option 2: Docker

1. **Build Image**
   ```bash
   docker build -t real-estate-app .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 --env-file .env.production real-estate-app
   ```

### Option 3: Traditional Hosting

1. **Build Application**
   ```bash
   npm run build:production
   ```

2. **Start Server**
   ```bash
   npm run start:production
   ```

## Environment Variables

### Required Variables
```env
NODE_ENV=production
DATABASE_URL=your-database-url
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
```

### Optional Variables
```env
NEXT_TELEMETRY_DISABLED=1
ANALYZE=false
NEXT_SHARP=1
```

## Performance Optimizations

### 1. Image Optimization
- Images are automatically optimized by Next.js
- AVIF and WebP formats are used when supported
- Responsive images with proper sizing

### 2. Caching Strategy
- Static assets: 1 year cache
- API responses: Configurable cache
- Service Worker: Offline support

### 3. Bundle Optimization
- Code splitting enabled
- Tree shaking for unused code
- Compression enabled

## Monitoring

### 1. Performance Monitoring
- Lighthouse CI in GitHub Actions
- Core Web Vitals tracking
- Real User Monitoring (RUM)

### 2. Error Tracking
- Built-in error boundaries
- Console error logging
- Performance metrics

### 3. Analytics
- Page view tracking
- User interaction events
- Conversion tracking

## Security

### 1. Headers
- Content Security Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection

### 2. Authentication
- NextAuth.js for secure authentication
- Session management
- CSRF protection

### 3. Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors: `npm run type-check`
   - Check linting errors: `npm run lint`
   - Validate configuration: `npm run prebuild`

2. **Performance Issues**
   - Run Lighthouse audit
   - Check bundle analyzer: `npm run build:analyze`
   - Monitor Core Web Vitals

3. **Database Issues**
   - Verify connection string
   - Check database migrations
   - Test database connectivity

### Debug Commands
```bash
# Check build output
npm run build:analyze

# Test production build locally
npm run build:production && npm run start:production

# Validate all configurations
npm run prebuild

# Run comprehensive tests
npm run test:comprehensive
```

## Rollback Strategy

### 1. Vercel
- Use Vercel dashboard to rollback to previous deployment
- Or redeploy previous commit

### 2. Docker
- Keep previous image versions
- Use container orchestration rollback features

### 3. Traditional Hosting
- Keep backup of previous build
- Use deployment scripts with rollback capability

## Post-deployment

### 1. Verification
- [ ] Test all major user flows
- [ ] Verify database connectivity
- [ ] Check API endpoints
- [ ] Test authentication
- [ ] Verify map functionality

### 2. Monitoring Setup
- [ ] Configure error tracking
- [ ] Set up performance monitoring
- [ ] Enable analytics
- [ ] Set up alerts

### 3. SEO
- [ ] Submit sitemap to search engines
- [ ] Verify meta tags
- [ ] Check structured data
- [ ] Test social media sharing