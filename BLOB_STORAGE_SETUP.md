# Vercel Blob Storage Configuration

## Current Issue
The upload feature is failing with 500 errors because the `BLOB_READ_WRITE_TOKEN` environment variable is set to a placeholder value: `"dev-blob-token"`.

## How to Fix

### Step 1: Get Your Real Vercel Blob Token
1. Go to your Vercel project: https://vercel.com/dashboard/projects
2. Select the **real-estate-website** project
3. Go to **Settings** → **Storage**
4. Click on **Blob** (or create one if you haven't already)
5. Click **Create** to create a new blob store if needed
6. Copy the **Read/Write Token** (this is your `BLOB_READ_WRITE_TOKEN`)

### Step 2: Update Environment Variables

#### For Production (Vercel):
1. Go to your Vercel project Settings
2. Go to **Environment Variables**
3. Find or create `BLOB_READ_WRITE_TOKEN`
4. Set the value to your real token from Step 1
5. Redeploy: `vercel deploy --prod`

#### For Local Development:
1. Update `.env.local`:
```
BLOB_READ_WRITE_TOKEN=your_real_token_here
```

2. Update `.env.production`:
```
BLOB_READ_WRITE_TOKEN=your_real_token_here
```

### Step 3: Test the Upload
1. Deploy to production: `vercel deploy --prod`
2. Go to the admin dashboard: `/admin/properties/new`
3. Try uploading an image
4. Check browser console for errors
5. Check Vercel logs: `vercel logs https://your-domain.vercel.app`

## Error Messages

### If you see "Upload service is not properly configured"
- The blob token is invalid or missing
- Check that `BLOB_READ_WRITE_TOKEN` starts with `vercel_blob_`
- Regenerate the token in Vercel dashboard if needed

### If uploads succeed but images don't appear
- The blob URL needs to be accessible from the frontend
- Make sure blob storage is public access (it is by default)
- Check browser DevTools Network tab to see if blob URLs load

## Troubleshooting

### Check if Token is Set
```bash
echo $BLOB_READ_WRITE_TOKEN
```

Should output: `vercel_blob_rw_xxxxxxxx...` (not `dev-blob-token`)

### Check Upload Logs
In production, view logs:
```bash
vercel logs https://your-domain.vercel.app
```

Look for messages starting with "Upload request received" or "Error uploading file"

### Local Testing
1. Clear cache: `rm -rf .next`
2. Start dev server: `npm run dev`
3. Try uploading to http://localhost:3000/admin/properties/new
4. Check terminal output for detailed error messages

## Related Files
- Upload handler: `src/app/api/upload/route.ts`
- Upload component: `src/components/ImageUploader.tsx`
- Middleware: `src/middleware.ts`

## Documentation
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Blob API Reference](https://vercel.com/docs/storage/vercel-blob/client-sdk)
