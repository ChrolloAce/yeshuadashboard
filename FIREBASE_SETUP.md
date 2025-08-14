# Firebase Setup Guide

## 🔥 Firebase Integration Complete

Your Yeshua Cleaning Dashboard is now fully integrated with Firebase, providing:

- **Authentication** - Secure user login/logout with role-based access
- **Firestore Database** - Real-time job management and data storage
- **Cloud Storage** - File uploads and document management
- **Analytics** - User behavior tracking and insights

## 🚀 Quick Start

### 1. Initial Setup (Already Done)
Your Firebase project is configured with:
- Project ID: `yeshuad-be66c`
- Authentication enabled
- Firestore database created
- Storage bucket ready

### 2. Default Admin Account
```
Email: admin@yeshuacleaning.com
Password: admin123
Role: Admin (full dashboard access)
```

### 3. Sample Cleaner Accounts
```
Team Alpha:
- maria@yeshuacleaning.com / cleaner123
- james@yeshuacleaning.com / cleaner123

Team Beta:
- carlos@yeshuacleaning.com / cleaner123
- lisa@yeshuacleaning.com / cleaner123
```

## 🛠️ Development Setup

### Environment Variables
Copy the example environment file:
```bash
cp env.local.example .env.local
```

### Firebase Emulators (Optional for Local Development)
```bash
npm install -g firebase-tools
firebase login
firebase init emulators
firebase emulators:start
```

## 📊 Database Structure

### Collections Created:

#### `users`
```typescript
{
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'cleaner' | 'customer';
  phone?: string;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `jobs`
```typescript
{
  jobNumber: string;
  status: JobStatus;
  priority: JobPriority;
  client: ClientInfo;
  address: ServiceAddress;
  service: ServiceDetails;
  pricing: PricingInfo;
  scheduledDate: Date;
  assignedTeam?: TeamInfo;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

#### `teams`
```typescript
{
  id: string;
  name: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔐 Security Rules

### Firestore Rules (Already Applied)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        resource.data.role == 'admin' || 
        request.auth.uid == userId;
    }
    
    // Jobs collection
    match /jobs/{jobId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'cleaner'];
    }
    
    // Teams collection
    match /teams/{teamId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 🎯 Features Implemented

### ✅ Authentication System
- Email/password login with validation
- Role-based access control (Admin, Cleaner, Customer)
- Protected routes and components
- User profile management
- Password reset functionality

### ✅ Real-time Job Management
- Live job updates across all users
- Status tracking (Pending → Assigned → In Progress → Completed)
- Team assignment and management
- Priority levels and filtering
- Search and filter capabilities

### ✅ Dashboard Integration
- Firebase jobs replace local mock data
- Real-time statistics and counters
- Automatic data synchronization
- Offline support with Firestore caching

## 🔄 Data Migration

### From Local to Firebase
The system automatically handles:
- Converting local job data to Firestore format
- Real-time listeners for live updates
- Optimistic updates for better UX
- Error handling and retry logic

## 📱 Mobile & Offline Support

Firebase provides:
- **Offline Persistence** - App works without internet
- **Real-time Sync** - Data syncs when connection returns
- **Mobile Optimized** - Perfect for cleaner mobile apps
- **Progressive Web App** - Can be installed on phones

## 🚀 Deployment

### Production Deployment
1. **Vercel** (Recommended)
   ```bash
   npm run build
   vercel deploy
   ```

2. **Firebase Hosting**
   ```bash
   npm run build
   firebase deploy
   ```

## 🔧 Advanced Configuration

### Custom Claims (Role Management)
```javascript
// Admin can set custom claims
admin.auth().setCustomUserClaims(uid, { role: 'admin' });
```

### Batch Operations
```javascript
// Bulk job updates
const batch = db.batch();
jobs.forEach(job => {
  batch.update(jobRef, updates);
});
await batch.commit();
```

## 📈 Analytics & Monitoring

Firebase provides built-in:
- **Performance Monitoring** - App speed tracking
- **Crash Reporting** - Error tracking
- **User Analytics** - Usage patterns
- **Real-time Database Metrics**

## 🎉 Ready to Use!

Your dashboard now has:
- ✅ **Secure Authentication**
- ✅ **Real-time Database**
- ✅ **Cloud Storage**
- ✅ **Role-based Access**
- ✅ **Mobile Support**
- ✅ **Offline Capabilities**

**Login with the admin account to start managing your cleaning business!**

---

## 🆘 Support

For Firebase-related issues:
1. Check the [Firebase Console](https://console.firebase.google.com)
2. Review Firestore logs and authentication logs
3. Test with Firebase emulators for local debugging
4. Check network connectivity and CORS settings
