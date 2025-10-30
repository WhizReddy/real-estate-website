# Production Issues & Solutions (Oct 28, 2025)

## Summary
Multiple issues were identified in production after redeployment:

1. **Upload failures (500 errors)** - Invalid Vercel Blob token
2. **Service Worker cache failures** - Overly strict cache.addAll() behavior
3. **Build-time sitemap errors** - Route tried to pre-render dynamically

## Issues & Fixes

### 1. Upload API Returning 500 Errors ❌ → ✅

**Symptom:**
```
POST https://real-estate-website-*.vercel.app/api/upload 500 (Internal Server Error)
Error uploading file: Screenshot 2025-10-28 at 7.36.52 PM.png Error: Failed to upload file
```

**Root Cause:**
- `BLOB_READ_WRITE_TOKEN` is set to placeholder `"dev-blob-token"` 
- Vercel Blob storage cannot authenticate without a real token
- Upload handler fails silently with 500 error

**Solution:**
✅ Enhanced upload handler (`src/app/api/upload/route.ts`):
- Added detailed logging for debugging
- Checks if token is valid (should start with `vercel_blob_`)
- Provides better error messages to frontend
- Distinguishes between auth errors and network errors

**Action Required:**
1. Get real Vercel Blob token from Vercel dashboard (Settings → Storage → Blob)
2. Set `BLOB_READ_WRITE_TOKEN` in Vercel project environment
3. Redeploy: `vercel deploy --prod`

**Reference:** See `BLOB_STORAGE_SETUP.md` for complete setup instructions

---

### 2. Service Worker Install Phase Failing ⚠️ → ✅

**Symptom:**
```
sw.js:37 Service Worker: Error caching static assets: TypeError: Failed to execute 'addAll' on 'Cache': Request failed
```

**Root Cause:**
- `cache.addAll()` fails if ANY single asset fails to cache
- Some assets may return 401/403 during install
- This blocks the entire service worker from activating

**Solution:**
✅ Improved install event in `public/sw.js`:
- Changed from `Promise.all()` to `Promise.allSettled()`
- Each asset cached individually with try/catch
- Continues even if some assets fail to cache
- Better error logging for debugging which assets fail

**Impact:**
- Service worker now installs successfully even with partial failures
- Offline fallback page still loads from cache
- Failed external assets (map tiles, etc.) won't block registration

---

### 3. Build-Time Sitemap Generation Failure ⚠️ → ✅

**Symptom:**
```
Failed to fetch properties from database: Error: Dynamic server usage: Route /api/sitemap couldn't be rendered statically
```

**Root Cause:**
- Sitemap route tried to fetch properties synchronously during build
- Next.js attempted static pre-rendering on dynamic data fetch
- Build would fail with "DYNAMIC_SERVER_USAGE" digest

**Solution:**
✅ Marked sitemap routes as dynamic:
- `src/app/api/sitemap/route.ts`: Added `export const dynamic = 'force-dynamic'`
- `src/app/sitemap.ts`: Already had `export const dynamic = 'force-dynamic'`
- Removed unused `generateSitemapIndex()` helper function

**Impact:**
- Sitemap routes now render on-demand instead of at build time
- Build succeeds without errors
- Sitemap is generated fresh for each request (suitable for dynamic content)

---

### 4. Middleware API Access ⚠️ → ✅

**Issue:**
- All `/api/*` routes were bypassing middleware security headers
- Upload and properties APIs couldn't apply consistent security policy

**Solution:**
✅ Updated `src/middleware.ts`:
- API routes now apply security headers (CSP, X-Frame-Options, etc.)
- Individual route handlers can still add auth as needed
- Admin-only routes still protected by NextAuth middleware
- Public APIs (properties, search) work correctly

---

## File Changes Summary

### Modified Files:
1. **src/app/api/upload/route.ts**
   - Added comprehensive logging
   - Improved error messages
   - Better token validation
   - Added `dynamic = 'force-dynamic'`

2. **src/app/api/sitemap/route.ts**
   - Added `dynamic = 'force-dynamic'`
   - Removed unused `generateSitemapIndex()` function

3. **src/middleware.ts**
   - API routes now apply security headers
   - Better error handling

4. **public/sw.js**
   - Changed install from `Promise.all()` to `Promise.allSettled()`
   - Individual asset caching with error handling
   - Better logging

### New Files:
- **BLOB_STORAGE_SETUP.md** - Setup guide for Vercel Blob storage

---

## Testing Checklist

- [ ] Verify `BLOB_READ_WRITE_TOKEN` is set to real token in Vercel
- [ ] Test image upload from admin dashboard
- [ ] Check browser DevTools → Application → Cache Storage for SW caches
- [ ] Verify service worker installs successfully
- [ ] Test sitemap generation: `/sitemap.xml`
- [ ] Check production logs for upload errors
- [ ] Test offline functionality
- [ ] Verify properties page loads

---

## Environment Variables Needed

For production deployment, ensure these are set in Vercel project:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx  (REQUIRED - get from Vercel dashboard)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-here
STORAGE_PRISMA_DATABASE_URL=your-db-url
```

---

## Next Steps

1. **Immediate:** Get real Vercel Blob token and update environment
2. **Deploy:** `vercel deploy --prod`
3. **Test:** Try uploading image, check logs
4. **Monitor:** Watch browser console and Vercel logs for errors
5. **Optimize:** Once working, can move to stricter CSP/CORS policies

---

## Related Documentation

- **Vercel Blob Docs:** https://vercel.com/docs/storage/vercel-blob
- **Next.js Environment Variables:** https://nextjs.org/docs/basic-features/environment-variables
- **Service Worker Caching:** https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/install_event
- **Middleware in Next.js:** https://nextjs.org/docs/advanced-features/middleware

---

**Last Updated:** October 28, 2025
