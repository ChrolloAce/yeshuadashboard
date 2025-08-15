# Required Firestore Indexes

## 🔥 CRITICAL INDEXES - CREATE THESE FIRST

### 1. Clients Collection
**Query:** `companyId == [value] && createdAt desc`
```
Collection: clients
Fields: companyId (Ascending), createdAt (Descending)
```

### 2. Jobs Collection  
**Query:** `companyId == [value] && createdAt desc`
```
Collection: jobs
Fields: companyId (Ascending), createdAt (Descending)
```

**Query:** `companyId == [value] && status == [value]`
```
Collection: jobs
Fields: companyId (Ascending), status (Ascending)
```

**Query:** `companyId == [value] && payment.status == [value]`
```
Collection: jobs
Fields: companyId (Ascending), payment.status (Ascending)
```

### 3. Quotes Collection
**Query:** `companyId == [value] && createdAt desc`
```
Collection: quotes
Fields: companyId (Ascending), createdAt (Descending)
```

**Query:** `companyId == [value] && status == [value]`
```
Collection: quotes
Fields: companyId (Ascending), status (Ascending)
```

### 4. Teams Collection
**Query:** `companyId == [value] && createdAt desc`
```
Collection: teams
Fields: companyId (Ascending), createdAt (Descending)
```

## 📊 ANALYTICS INDEXES

### 5. Jobs Analytics Queries
**Query:** `companyId == [value] && createdAt >= [date] && createdAt <= [date]`
```
Collection: jobs
Fields: companyId (Ascending), createdAt (Ascending)
```

**Query:** `companyId == [value] && payment.status == 'paid' && createdAt >= [date]`
```
Collection: jobs
Fields: companyId (Ascending), payment.status (Ascending), createdAt (Ascending)
```

### 6. Quotes Analytics Queries
**Query:** `companyId == [value] && createdAt >= [date] && createdAt <= [date]`
```
Collection: quotes
Fields: companyId (Ascending), createdAt (Ascending)
```

## 👥 USER MANAGEMENT INDEXES

### 7. Users by Company
**Query:** `companyId == [value] && role == [value]`
```
Collection: users
Fields: companyId (Ascending), role (Ascending)
```

**Query:** `companyId == [value] && isActive == true`
```
Collection: users
Fields: companyId (Ascending), isActive (Ascending)
```

### 8. Cleaner Profiles
**Query:** `companyId == [value] && createdAt desc`
```
Collection: cleaner_profiles
Fields: companyId (Ascending), createdAt (Descending)
```

## 🔍 SEARCH INDEXES (Optional but Recommended)

### 9. Client Search
**Query:** `companyId == [value] && firstName >= [text]`
```
Collection: clients
Fields: companyId (Ascending), firstName (Ascending)
```

**Query:** `companyId == [value] && email >= [text]`
```
Collection: clients
Fields: companyId (Ascending), email (Ascending)
```

### 10. Job Search by Client
**Query:** `companyId == [value] && clientId == [value] && createdAt desc`
```
Collection: jobs
Fields: companyId (Ascending), clientId (Ascending), createdAt (Descending)
```

## 🚀 HOW TO CREATE INDEXES

### Method 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Enter the collection name and fields as specified above

### Method 2: Firebase CLI
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firestore in your project
firebase init firestore

# Deploy indexes (if you have firestore.indexes.json)
firebase deploy --only firestore:indexes
```

### Method 3: Auto-creation via Error Messages
1. Run your app and perform queries
2. Check browser console for index creation links
3. Click the links to auto-create indexes
4. **Note:** This method is slower and less reliable

## ⚡ PRIORITY ORDER

Create indexes in this order for immediate functionality:

1. **clients**: `companyId + createdAt`
2. **jobs**: `companyId + createdAt` 
3. **quotes**: `companyId + createdAt`
4. **jobs**: `companyId + status`
5. **jobs**: `companyId + payment.status`
6. **users**: `companyId + role`

The rest can be created as needed when you encounter "missing index" errors.

## 🔥 URGENT: Create These First!

Without these indexes, your app will show "missing index" errors:
- All **companyId + createdAt** indexes
- All **companyId + status** indexes  
- **users companyId + role** index

Create these ASAP to ensure smooth operation! 🚀
