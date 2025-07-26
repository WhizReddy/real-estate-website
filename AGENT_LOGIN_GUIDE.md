# Agent Login System Guide

## Overview
The real estate website now has a complete authentication system that supports both administrators and agents with different access levels.

## Available User Accounts

### Administrator Account
- **Email:** `admin@pasuritetiranes.com`
- **Password:** `admin123`
- **Role:** ADMIN
- **Access:** Full access to all features including user management

### Agent Accounts
- **Agent 1:**
  - Email: `agent1@pasuritetiranes.com`
  - Password: `agent123`
  - Name: Marko Petrovic
  - Role: AGENT

- **Agent 2:**
  - Email: `agent2@pasuritetiranes.com`
  - Password: `agent123`
  - Name: Ana Hoxha
  - Role: AGENT

## How to Login

1. **Access the Login Page:**
   - Go to: `http://localhost:3001/admin/login`
   - Or click "Hyrje për Agjentë" from the main website

2. **Enter Credentials:**
   - Use any of the email/password combinations above
   - Click "Kyçu" (Login)

3. **Access Dashboard:**
   - After successful login, you'll be redirected to `/admin/dashboard`
   - The dashboard shows different features based on your role

## Role-Based Access

### ADMIN Role Features:
- ✅ View all properties
- ✅ Create, edit, delete properties
- ✅ Manage agents (view, create, delete)
- ✅ View all inquiries
- ✅ Full system access

### AGENT Role Features:
- ✅ View all properties
- ✅ Create, edit properties
- ✅ View inquiries
- ❌ Cannot manage other agents
- ❌ Limited administrative functions

## Creating New Users

### Method 1: Using the Script
```bash
# Navigate to the project directory
cd real-estate-website

# Create a new agent
npx tsx scripts/create-user.ts "newagent@example.com" "New Agent Name" AGENT "password123"

# Create a new admin
npx tsx scripts/create-user.ts "newadmin@example.com" "New Admin Name" ADMIN "password123"
```

### Method 2: Through Admin Panel
1. Login as an administrator
2. Go to `/admin/agents`
3. Click "Shto Agjent të Ri" (Add New Agent)
4. Fill in the form and submit

## Security Features

- ✅ **Password Hashing:** All passwords are hashed using bcrypt with 12 salt rounds
- ✅ **Session Management:** Secure session tokens with HTTP-only cookies
- ✅ **Role-Based Access:** Different permissions for admins and agents
- ✅ **Input Validation:** Email and password validation
- ✅ **CSRF Protection:** Secure form handling

## Troubleshooting

### "Email ose fjalëkalimi është i gabuar" (Invalid email or password)
- Check that you're using the correct email and password
- Ensure caps lock is off
- Try copying and pasting the credentials

### Cannot Access Admin Features
- Check your user role in the database
- Only ADMIN users can access certain features
- AGENT users have limited permissions

### Session Expired
- Sessions last 24 hours
- If expired, simply login again
- Clear browser cookies if having issues

## Database Management

### Reset All Users
```bash
# This will recreate all default users
npx prisma db seed
```

### View Current Users
```bash
# Access the database directly
npx prisma studio
# Then navigate to the "User" table
```

## Multi-Select Filters Improvement ✅

The search filters have been improved to support multiple selections:

### New Features:
- ✅ **Property Type:** Select multiple types (House, Apartment, Condo, Townhouse)
- ✅ **Bedrooms:** Select multiple bedroom counts (1, 2, 3, 4+)
- ✅ **Bathrooms:** Select multiple bathroom counts (1, 2, 3+)
- ✅ **Listing Type:** Select both Sale and Rent simultaneously
- ✅ **Checkbox Interface:** Easy-to-use checkboxes instead of dropdowns
- ✅ **Combined Filtering:** Properties matching ANY selected option in each category

### How It Works:
1. Expand "Filtrat e Avancuara" (Advanced Filters)
2. Check multiple options in any category
3. Results update automatically with 300ms debounce
4. Use "Pastro Filtrat" (Clear Filters) to reset all selections

## Next Steps

1. **Test the Login System:**
   - Try logging in with different user accounts
   - Test role-based access restrictions

2. **Test Multi-Select Filters:**
   - Go to the main page or properties page
   - Try selecting multiple property types
   - Test combining different filter types

3. **Create Additional Users:**
   - Use the script to create more agents
   - Test the admin panel user management

4. **Customize as Needed:**
   - Modify user roles or permissions
   - Add additional user fields if required
   - Customize the dashboard based on roles

## Support

If you need help or encounter issues:
1. Check the browser console for error messages
2. Verify database connection
3. Ensure all environment variables are set correctly
4. Check that the development server is running on the correct port