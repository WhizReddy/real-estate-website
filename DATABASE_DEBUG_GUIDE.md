# Database Issues & Solutions

## **Problem Summary**

Your 400 error "Invalid reference to related data" is caused by:
1. **Missing `ownerId`** when creating properties via the API form
2. **Session not being passed correctly** to the backend
3. **Seed file storing images/features as JSON strings** (but form submission might not)

---

## **Root Cause Analysis**

### **1. Session is Not Being Extracted**
- The backend tries to get `session?.user?.id` but gets `null` or `undefined`
- This means your authentication session is not being properly created or passed to the API route
- **Why?** User might not be logged in, or the session cookie is not being sent with the API request

### **2. NextAuth Session Flow**
- User logs in → `authOptions` creates JWT token
- Frontend stores token in cookie (httpOnly)
- On each API call, the cookie should be sent automatically
- Backend extracts `session.user.id` from JWT

**But if step 3 fails:** Token is not in the request, so `getServerSession()` returns null

---

## **How to Debug**

### **Step 1: Check Browser Console**
When you submit the property creation form, you should see:
```
Submitting propertyData: { ...form data... }
```

Look for backend response error:
```
Error creating property: Error: Invalid reference to related data
```

### **Step 2: Check Server Logs (Terminal)**
Look for the new debug logs we added:
```
🔐 Session during property creation: {
  hasSession: false,        ← If FALSE, session is missing!
  userId: undefined,
  userEmail: undefined,
  userRole: undefined,
}

📝 Creating property with data: {
  hasOwnerId: false,        ← If FALSE, ownerId was not set!
  ownerId: undefined,
  title: "Example Property"
}
```

---

## **Solutions**

### **If `hasSession: false` (Session Missing)**

**Problem:** You're not logged in or session is not persisting

**Fix:**
1. Make sure you're logged in (check `/admin/login` page)
2. Try logging out and logging back in
3. Check that cookies are enabled in your browser
4. Try with the seeded test accounts:
   - Email: `admin@pasuritetiranes.com`
   - Password: `admin123`

---

### **If `hasOwnerId: false` (ownerId Not Set)**

**Problem:** Session exists but `session.user.id` is undefined or null

**Fix:**
1. Check that NextAuth session callback returns `session.user.id`:
   ```typescript
   // src/lib/auth.ts - verify this callback exists
   callbacks: {
     async session({ session, token }) {
       if (token) {
         session.user.id = token.sub!;  // ← This must work
         session.user.role = token.role as string;
       }
       return session;
     },
   }
   ```

2. Verify JWT token has `sub` (user ID)

---

### **If Property Creation Still Fails**

**Additional checks:**
1. **Verify seed was successful:**
   ```bash
   npm run seed
   ```
   Should output:
   ```
   ✅ Database seeded successfully!
   📊 Summary:
      - 3 users
      - 10 properties
      - 10 inquiries
   ```

2. **Test property creation with authentication:**
   - Log in as `admin@pasuritetiranes.com`
   - Go to `/admin/properties/new`
   - Fill in the form and submit
   - Check server logs for:
     - ✅ `hasSession: true`
     - ✅ `hasOwnerId: true`
     - ✅ Property created successfully

3. **Check database directly** (if using PostgreSQL):
   ```sql
   SELECT id, title, "ownerId" FROM properties LIMIT 5;
   ```

---

## **Data Structure Issues**

### **Images & Features Storage**
Your schema stores these as JSON strings:
```prisma
images   String // JSON array of image URLs
features String // JSON array of features
```

**Seed file correctly converts:**
```typescript
images: JSON.stringify(property.images),  // ✅ Correct
features: JSON.stringify(property.features),  // ✅ Correct
```

**Backend API correctly converts:**
```typescript
images: JSON.stringify(validationResult.sanitizedData.images),  // ✅ Correct
images: JSON.parse(property.images || "[]"),  // ✅ Correct on read
```

**This should be fine** - the issue is the missing `ownerId`, not the JSON storage.

---

## **Next Steps**

1. **Try creating a property** and check the server logs for:
   - `🔐 Session during property creation`
   - `📝 Creating property with data`

2. **Copy the exact error message** from either:
   - Browser console
   - Server logs
   - Alert/notification in the UI

3. **Share that error** and I can pinpoint the exact problem

---

## **Quick Diagnostics Command**

To test if authentication works:
```bash
# In browser console, while on the page:
fetch('/api/properties', {
  method: 'GET',
}).then(r => r.json()).then(console.log)

# Should return all properties
# If it fails, authentication might be the issue
```

---

## **References**

- **NextAuth.js Session**: https://next-auth.js.org/getting-started/example
- **Prisma Relations**: https://www.prisma.io/docs/concepts/relations
- **JWT Tokens**: https://next-auth.js.org/configuration/options#callbacks
