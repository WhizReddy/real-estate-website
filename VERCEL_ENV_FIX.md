# 🔧 Fix Vercel Environment Variables

## Problem
The database is using `STORAGE_` prefix instead of `POSTGRES_` prefix, and the environment variables in Vercel are pointing to wrong values.

## ✅ Solution: Update Environment Variables in Vercel

Go to: https://vercel.com/whizreddys-projects/real-estate-website/settings/environment-variables

---

## 1. Update DATABASE_URL

**Find the existing `DATABASE_URL` variable and EDIT it:**

- **Value**: Change from `${POSTGRES_PRISMA_URL}` to:
  ```
  ${STORAGE_PRISMA_DATABASE_URL}
  ```
  *(This references the actual database that was created)*

- **Environments**: ✅ Production, ✅ Preview, ✅ Development

Click **Save**

---

## 2. Update NEXTAUTH_SECRET

**Find the existing `NEXTAUTH_SECRET` variable and EDIT it:**

- **Value**: Change to:
  ```
  fTSeRbAlMMgE3hG12IPyVM2OXUGW0FFpq4hKqCCKDf9bjolTbMaZNnZocI22z2eW
  ```

- **Environments**: ✅ Production, ✅ Preview, ✅ Development

Click **Save**

---

## 3. Update NEXTAUTH_URL

**Find the existing `NEXTAUTH_URL` variable and EDIT it:**

- **Value**: Change to:
  ```
  https://real-estate-website-gold-xi.vercel.app
  ```

- **Environments**: ✅ Production ONLY

Click **Save**

---

## 4. Redeploy

After updating all 3 variables:

1. Go to **Deployments** tab
2. Find latest deployment
3. Click **"..."** → **Redeploy**
4. Wait 2-3 minutes

---

## ✅ After Redeployment:

Your app will work with:
- ✅ Properties loading
- ✅ Admin login working
- ✅ New design showing
- ✅ All features functional

---

## 🎯 Quick Checklist:

- [ ] Update DATABASE_URL to use `${STORAGE_PRISMA_DATABASE_URL}`
- [ ] Update NEXTAUTH_SECRET to secure value
- [ ] Update NEXTAUTH_URL to production URL
- [ ] Redeploy the app
- [ ] Test: https://real-estate-website-gold-xi.vercel.app
