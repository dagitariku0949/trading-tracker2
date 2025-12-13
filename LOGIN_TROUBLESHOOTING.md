# 🔧 Login Page Troubleshooting Guide

## 🚨 **ISSUE: Login page not appearing**

### **Quick Fix Steps:**

#### **1. Check if servers are running:**
```bash
# Terminal 1 - Backend
cd backend
npm start
# Should show: "Server listening on 4000"

# Terminal 2 - Frontend  
cd frontend
npm run dev
# Should show: "Local: http://localhost:5173/"
```

#### **2. Test with standalone login page:**
Open `test-simple-login.html` in your browser:
- This bypasses React routing issues
- Tests backend connectivity
- Allows direct login testing

#### **3. Direct URL access:**
Try these URLs directly:
- **Main app**: http://localhost:5173/
- **Login page**: http://localhost:5173/#/login
- **Dashboard**: http://localhost:5173/#/dashboard (should redirect to login)

#### **4. Clear browser data:**
```javascript
// Open browser console (F12) and run:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### **Debugging Tools:**

#### **Test Authentication System:**
Open `test-login-page.html` in browser:
- Tests frontend connectivity
- Tests backend connectivity  
- Tests login functionality
- Provides direct links

#### **Check Browser Console:**
Press F12 and look for:
- ✅ "App component loaded - HashRouter active with Authentication"
- ✅ "No auth token found, user not logged in"
- ❌ Any red error messages

#### **Test Backend Directly:**
```bash
curl http://localhost:4000/
# Should return: {"status":"online","message":"Trading Dashboard API"...}
```

### **Common Issues & Solutions:**

#### **Issue: Blank page or loading forever**
**Solutions:**
1. Check browser console for errors
2. Verify both servers are running
3. Clear browser cache and localStorage
4. Try incognito/private browsing mode

#### **Issue: "Cannot GET /" error**
**Solutions:**
1. Frontend not running - start with `npm run dev`
2. Wrong port - should be 5173 for frontend
3. Try direct hash URL: `http://localhost:5173/#/login`

#### **Issue: Login form appears but login fails**
**Solutions:**
1. Check backend is running on port 4000
2. Use demo credentials: `admin@tradingdashboard.com` / `password`
3. Check network tab in browser for API errors
4. Test backend with `test-simple-login.html`

#### **Issue: Redirects in a loop**
**Solutions:**
1. Clear localStorage: `localStorage.clear()`
2. Check for invalid tokens
3. Restart both servers
4. Use incognito mode

### **Step-by-Step Verification:**

#### **Step 1: Verify Backend**
```bash
cd backend
npm start
```
**Expected**: "Server listening on 4000"

#### **Step 2: Test Backend API**
Open: http://localhost:4000/
**Expected**: JSON response with "Trading Dashboard API"

#### **Step 3: Verify Frontend**
```bash
cd frontend  
npm run dev
```
**Expected**: "Local: http://localhost:5173/"

#### **Step 4: Test Frontend**
Open: http://localhost:5173/
**Expected**: Should redirect to login page or show loading

#### **Step 5: Test Login**
Use demo credentials:
- Email: `admin@tradingdashboard.com`
- Password: `password`
**Expected**: Login success and redirect to dashboard

### **Alternative Access Methods:**

#### **Method 1: Standalone Login**
1. Open `test-simple-login.html`
2. Use demo credentials
3. Click "Sign In"
4. Should redirect to main app

#### **Method 2: Direct Hash URLs**
- Login: `http://localhost:5173/#/login`
- Dashboard: `http://localhost:5173/#/dashboard`
- Admin: `http://localhost:5173/#/admin`

#### **Method 3: Manual Token**
If you have a valid token:
```javascript
// In browser console:
localStorage.setItem('authToken', 'your-jwt-token-here');
location.reload();
```

### **Expected Behavior:**

#### **When NOT logged in:**
- Root URL (`/`) → Redirects to `/login`
- Any protected route → Redirects to `/login`
- Login page shows with demo credentials

#### **When logged in:**
- Root URL (`/`) → Redirects to `/dashboard`
- Protected routes → Show content
- Admin routes → Show admin panel (if admin user)

### **Debug Information:**

#### **Check these in browser console:**
```javascript
// Check auth token
console.log('Auth token:', localStorage.getItem('authToken'));

// Check current route
console.log('Current URL:', window.location.href);
console.log('Hash:', window.location.hash);

// Test API connectivity
fetch('http://localhost:4000/').then(r => r.json()).then(console.log);
```

### **If All Else Fails:**

#### **Nuclear Option - Complete Reset:**
```bash
# Stop all servers
# Clear browser completely
# Restart everything

cd backend
rm -rf node_modules
npm install
npm start

# New terminal
cd frontend
rm -rf node_modules
npm install
npm run dev

# Clear browser data and try again
```

---

## 🎯 **Quick Test Checklist:**

- [ ] Backend running on port 4000
- [ ] Frontend running on port 5173  
- [ ] `test-simple-login.html` works
- [ ] Browser console shows no errors
- [ ] Demo credentials work
- [ ] Can access `http://localhost:5173/#/login` directly

**If all checked ✅, the login system should work!**