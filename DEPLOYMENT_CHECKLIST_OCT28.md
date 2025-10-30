# Deployment Checklist - October 28, 2025

## Pre-Deployment (Right Now)

### Code Quality
- [x] Build succeeds: `npm run build`
- [x] No critical errors
- [x] All routes compile
- [x] Middleware properly configured
- [x] Service Worker updated

### Changes Committed
- [x] All fixes committed to `ui-fix` branch
- [x] Commit message: "fix: resolve production issues - uploads, service worker, and sitemap generation"
- [x] Documentation files created

### Documentation Complete
- [x] BLOB_STORAGE_SETUP.md - Blob configuration guide
- [x] PRODUCTION_ISSUES_OCT28.md - Issue analysis
- [x] FIXES_SUMMARY_OCT28.md - Complete fix summary

---

## Deployment Steps

### Step 1: Configure Vercel Blob Storage (5 minutes)
```
1. Go to https://vercel.com/dashboard/projects
2. Click on real-estate-website project
3. Go to Settings → Storage
4. Click on Blob (or create if not exists)
5. Copy the "Read/Write Token"
6. Go to Settings → Environment Variables
7. Find or create: BLOB_READ_WRITE_TOKEN
8. Paste the token value (should start with vercel_blob_rw_)
9. Click Save
10. Choose deployment: "Redeploy existing Function"
```

### Step 2: Deploy to Production
```bash
cd /Users/rediballa/real-estate-website
vercel deploy --prod --force
```

### Step 3: Monitor Deployment
```bash
# Watch deployment progress
vercel deploy --prod --force --logs

# Or check status later:
vercel status

# View detailed logs:
vercel logs https://real-estate-website-xxx.vercel.app
```

---

## Post-Deployment Testing

### Test 1: Upload Functionality (5 minutes)
```
1. Navigate to: https://your-domain/admin/login
2. Login with admin credentials
3. Go to: /admin/properties/new
4. Try uploading a test image
5. Check browser console for errors
6. Verify image appears in preview
7. Check Vercel logs for upload success
```

**Success Indicators:**
- ✅ Image uploads without error
- ✅ Browser console shows: "Upload successful"
- ✅ Image preview displays
- ✅ Logs show: "Uploading to Vercel Blob storage... Upload successful"

**If Failed:**
- ❌ Check BLOB token is set in Vercel
- ❌ Verify token starts with `vercel_blob_rw_`
- ❌ Check browser DevTools → Network → upload request
- ❌ Look for 401/403 errors in Vercel logs

### Test 2: Service Worker (3 minutes)
```
1. Open browser DevTools (F12)
2. Go to Application → Service Workers
3. Should show: "Service Worker [URL] activated and running"
4. Click on "Cache Storage"
5. Should see: real-estate-static-v1 cache
6. Expand cache and verify assets are listed
```

**Success Indicators:**
- ✅ Service Worker status: "activated and running"
- ✅ Cache storage has items
- ✅ Offline page works (Go offline in DevTools and refresh)

**If Failed:**
- ❌ Check browser console for SW errors
- ❌ Look for "Service Worker: Error caching"
- ❌ Verify /sw.js loads without 404
- ❌ Check Vercel logs for static asset errors

### Test 3: Security Headers (2 minutes)
```
1. Open DevTools → Network tab
2. Make a request to any /api/* endpoint
3. Check Response Headers for:
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Content-Security-Policy: ...
```

**Success Indicators:**
- ✅ X-Frame-Options header present
- ✅ CSP header includes proper directives
- ✅ No "unsafe-inline" in script-src (only for dev)

### Test 4: Sitemap Generation (1 minute)
```
1. Visit: https://your-domain/sitemap.xml
2. Should return XML with property URLs
3. Check logs to verify no 500 errors
4. Verify properties are listed with dates
```

**Success Indicators:**
- ✅ Returns valid XML
- ✅ Contains property URLs
- ✅ No 500 errors in logs
- ✅ Generates fresh data each request

### Test 5: Properties Viewing (3 minutes)
```
1. Go to /properties page
2. Click on a property
3. Verify property details load
4. Check for images from uploaded blob URLs
5. Try map view (if available)
```

**Success Indicators:**
- ✅ Properties page loads
- ✅ Property details visible
- ✅ Images from blob storage load
- ✅ No console errors

---

## Common Issues & Quick Fixes

### Issue: Upload returns 500 "Upload service not configured"
**Fix:**
1. Check BLOB_READ_WRITE_TOKEN in Vercel Environment Variables
2. Verify token starts with `vercel_blob_rw_`
3. Re-verify token hasn't expired
4. Redeploy after updating token

### Issue: Service Worker won't activate
**Fix:**
1. Open DevTools → Application → Service Workers
2. Click "Unregister" on old worker
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Wait 10 seconds for new SW to install
5. Check console for errors

### Issue: Sitemap returns 500 error
**Fix:**
1. Check that `dynamic = 'force-dynamic'` is in route.ts
2. Verify database connection works (/api/properties endpoint)
3. Check Vercel logs for database errors
4. Ensure STORAGE_PRISMA_DATABASE_URL is set

### Issue: API requests missing security headers
**Fix:**
1. Verify middleware.ts applies headers to `/api`
2. Check no middleware caching is interfering
3. Verify browser is not caching old response headers
4. Hard refresh and retry

---

## Rollback Plan

If deployment causes critical issues:

```bash
# Option 1: Rollback to previous deployment
vercel rollback

# Option 2: Redeploy from specific commit
git log --oneline | head -5
vercel deploy --prod --force

# Option 3: Revert changes
git revert HEAD
vercel deploy --prod --force
```

---

## Performance Monitoring

After deployment, monitor:

1. **Error Tracking**
   - Vercel dashboard for function errors
   - Browser console for client-side errors
   - Check error rate in analytics

2. **Upload Performance**
   - Vercel Blob storage metrics
   - Upload time per image
   - Success rate

3. **Service Worker**
   - Cache hit rate
   - Offline usage stats
   - Error rates

4. **Database**
   - Query performance
   - Connection pool usage
   - Error rates

---

## Success Criteria

Deployment is successful when:

- [x] Code builds without errors
- [ ] Blob token is configured in Vercel
- [ ] Image uploads work end-to-end
- [ ] Service Worker activates successfully
- [ ] Security headers present on API responses
- [ ] Sitemap generates without errors
- [ ] Properties page loads correctly
- [ ] No new errors in Vercel logs
- [ ] Upload functionality tested
- [ ] All tests pass

---

## Timeline Estimate

- Pre-deployment checks: 5 min ✓ (DONE)
- Vercel Blob configuration: 5 min
- Deployment: 2-3 min
- Testing: 10 min
- **Total: ~20-25 minutes**

---

## Sign-Off

- [ ] All code changes reviewed
- [ ] Build verified passing
- [ ] BLOB token obtained from Vercel
- [ ] Ready to deploy to production
- [ ] Team notified of deployment

---

**Updated:** October 28, 2025
**Status:** Ready for deployment
**Next Action:** Set BLOB token and deploy

See: FIXES_SUMMARY_OCT28.md for detailed explanation of all fixes
