# 🔥 Firestore Security Rules for Yeshua Cleaning Dashboard

## 📁 Rule Files Overview

### `firestore.rules` - **Balanced Production Rules** ⚖️
- **Recommended for production use**
- Allows authenticated users to read/write most data
- Special permissions for different user roles
- Allows unauthenticated quote creation (for booking form)
- Good balance of security and functionality

### `firestore.dev.rules` - **Development Rules** 🧪
- **⚠️ WARNING: Development only!**
- Very permissive - authenticated users can do anything
- Allows unauthenticated quote/client creation
- Perfect for testing and development
- **DO NOT USE IN PRODUCTION**

### `firestore.prod.rules` - **Strict Production Rules** 🔒
- **Maximum security for sensitive production environments**
- Role-based access control with validation
- Data validation on writes
- Audit trails and payment protection
- Minimal permissions principle

## 🚀 How to Deploy Rules

### Option 1: Firebase Console (Easy)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy and paste the contents of your chosen rules file
5. Click **Publish**

### Option 2: Firebase CLI (Recommended)
```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules

# Deploy specific rules file
firebase deploy --only firestore:rules --project your-project-id
```

### Option 3: Different Rules for Different Environments
```bash
# Development
cp firestore.dev.rules firestore.rules
firebase deploy --only firestore:rules --project your-dev-project

# Production
cp firestore.prod.rules firestore.rules
firebase deploy --only firestore:rules --project your-prod-project
```

## 🔑 Rule Permissions Breakdown

### **Users Collection** (`/users/{userId}`)
- **Read**: Own profile + admins
- **Write**: Own profile + admins
- **Create**: Self-registration with email validation

### **Clients Collection** (`/clients/{clientId}`)
- **Read**: All authenticated users
- **Write**: Admins + limited cleaner updates
- **Create**: Anyone (for booking form submissions)

### **Quotes Collection** (`/quotes/{quoteId}`)
- **Read**: All authenticated users
- **Write**: Admins + status updates
- **Create**: Anyone (for booking form)

### **Jobs Collection** (`/jobs/{jobId}`)
- **Read**: All authenticated users
- **Write**: Admins + assigned cleaners (limited fields)
- **Create**: Admins only

### **Teams Collection** (`/teams/{teamId}`)
- **Read**: All authenticated users
- **Write**: Admins only

## 🛡️ Security Features

### **Role-Based Access Control**
```javascript
function hasRole(role) {
  return isAuthenticated() && 
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
}
```

### **Data Validation**
- Email format validation
- Phone number validation
- Required fields checking
- Price validation (must be > 0)
- Rating validation (1-5 stars)

### **Audit Protection**
- Payment records cannot be deleted
- Audit logs are read-only for admins
- User creation timestamps are immutable

## 🎯 Recommended Setup by Environment

### **Development/Testing**
```bash
# Use permissive rules for easy testing
cp firestore.dev.rules firestore.rules
firebase deploy --only firestore:rules
```

### **Staging**
```bash
# Use balanced rules for realistic testing
cp firestore.rules firestore.rules  # (default balanced rules)
firebase deploy --only firestore:rules
```

### **Production**
```bash
# Use strict rules for maximum security
cp firestore.prod.rules firestore.rules
firebase deploy --only firestore:rules
```

## 🧪 Testing Your Rules

### Using Firebase Emulator
```bash
# Start emulator with rules
firebase emulators:start --only firestore

# Test rules in emulator UI
open http://localhost:4000
```

### Using Firebase Console Rules Playground
1. Go to Firebase Console → Firestore → Rules
2. Click **Rules Playground**
3. Test different scenarios with mock data

## 🚨 Security Best Practices

### ✅ DO:
- Always authenticate users before allowing data access
- Validate data on writes (email format, required fields, etc.)
- Use role-based permissions
- Limit field updates to necessary fields only
- Never delete payment or audit records

### ❌ DON'T:
- Allow unauthenticated access to sensitive data
- Give all users admin permissions
- Skip data validation
- Allow unrestricted file uploads
- Use development rules in production

## 🔧 Customization

### Adding New Collections
```javascript
// Add to any rules file
match /newCollection/{docId} {
  allow read: if isAuthenticated();
  allow write: if hasRole('admin');
}
```

### Adding New User Roles
```javascript
// Add helper function
function isManager() {
  return hasRole('manager');
}

// Use in rules
allow write: if isAdmin() || isManager();
```

### Custom Validation
```javascript
// Add validation functions
function isValidPrice(price) {
  return price is number && price > 0 && price < 10000;
}

// Use in create rules
allow create: if isValidPrice(request.resource.data.price);
```

## 📊 Performance Indexes

The `firestore.indexes.json` file includes optimized indexes for:
- Quote filtering by status and date
- Job filtering by status, cleaner, and date
- Client search by email
- User filtering by role

## 🆘 Troubleshooting

### **Permission Denied Errors**
1. Check if user is authenticated
2. Verify user has correct role in `/users/{uid}`
3. Ensure required fields are present in write operations
4. Check data validation rules

### **Missing Index Errors**
1. Deploy indexes: `firebase deploy --only firestore:indexes`
2. Or create indexes automatically via Firebase Console

### **Rules Not Updating**
1. Clear browser cache
2. Wait 1-2 minutes for propagation
3. Check Firebase Console for deployment status

---

## 🎉 Quick Start

**For immediate development:**
```bash
cp firestore.dev.rules firestore.rules
firebase deploy --only firestore:rules
```

**For production deployment:**
```bash
cp firestore.prod.rules firestore.rules
firebase deploy --only firestore:rules
```

Your Yeshua Cleaning dashboard is now secured with professional Firestore rules! 🔐✨
