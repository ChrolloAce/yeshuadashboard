# 🔥 EXACT FIRESTORE INDEXES TO CREATE

## 📋 COLLECTION: `clients`

### Index 1: Basic Company Query
```
Collection ID: clients
Fields: 
  - companyId (Ascending)
  - createdAt (Descending)
Query scopes: Collection
```

### Index 2: Client Search by Email
```
Collection ID: clients
Fields:
  - companyId (Ascending) 
  - email (Ascending)
Query scopes: Collection
```

---

## 📋 COLLECTION: `jobs`

### Index 1: Basic Company Query
```
Collection ID: jobs
Fields:
  - companyId (Ascending)
  - createdAt (Descending)
Query scopes: Collection
```

### Index 2: Jobs by Status
```
Collection ID: jobs
Fields:
  - companyId (Ascending)
  - status (Ascending)
Query scopes: Collection
```

### Index 3: Jobs by Payment Status
```
Collection ID: jobs
Fields:
  - companyId (Ascending)
  - payment.status (Ascending)
Query scopes: Collection
```

### Index 4: Analytics - Paid Jobs by Date
```
Collection ID: jobs
Fields:
  - companyId (Ascending)
  - payment.status (Ascending)
  - createdAt (Ascending)
Query scopes: Collection
```

### Index 5: Analytics - Jobs by Date Range
```
Collection ID: jobs
Fields:
  - companyId (Ascending)
  - createdAt (Ascending)
Query scopes: Collection
```

### Index 6: Jobs by Client
```
Collection ID: jobs
Fields:
  - companyId (Ascending)
  - clientId (Ascending)
  - createdAt (Descending)
Query scopes: Collection
```

---

## 📋 COLLECTION: `quotes`

### Index 1: Basic Company Query
```
Collection ID: quotes
Fields:
  - companyId (Ascending)
  - createdAt (Descending)
Query scopes: Collection
```

### Index 2: Quotes by Status
```
Collection ID: quotes
Fields:
  - companyId (Ascending)
  - status (Ascending)
Query scopes: Collection
```

### Index 3: Analytics - Quotes by Date Range
```
Collection ID: quotes
Fields:
  - companyId (Ascending)
  - createdAt (Ascending)
Query scopes: Collection
```

---

## 📋 COLLECTION: `users`

### Index 1: Users by Company and Role
```
Collection ID: users
Fields:
  - companyId (Ascending)
  - role (Ascending)
Query scopes: Collection
```

### Index 2: Active Users by Company
```
Collection ID: users
Fields:
  - companyId (Ascending)
  - isActive (Ascending)
Query scopes: Collection
```

---

## 📋 COLLECTION: `companies`

### Index 1: Companies by Owner
```
Collection ID: companies
Fields:
  - ownerId (Ascending)
  - createdAt (Descending)
Query scopes: Collection
```

### Index 2: Companies by Invite Code
```
Collection ID: companies
Fields:
  - inviteCode (Ascending)
Query scopes: Collection
```

---

## 📋 COLLECTION: `cleaner_profiles`

### Index 1: Cleaner Profiles by Company
```
Collection ID: cleaner_profiles
Fields:
  - companyId (Ascending)
  - createdAt (Descending)
Query scopes: Collection
```

### Index 2: Available Cleaners
```
Collection ID: cleaner_profiles
Fields:
  - companyId (Ascending)
  - availability.monday.available (Ascending)
Query scopes: Collection
```

---

## 📋 COLLECTION: `teams`

### Index 1: Teams by Company
```
Collection ID: teams
Fields:
  - companyId (Ascending)
  - createdAt (Descending)
Query scopes: Collection
```

### Index 2: Active Teams
```
Collection ID: teams
Fields:
  - companyId (Ascending)
  - isActive (Ascending)
Query scopes: Collection
```

---

# 🚀 PRIORITY ORDER - CREATE IN THIS SEQUENCE

## 🔥 CRITICAL (Create First - App Won't Work Without These)
1. **clients** → `companyId + createdAt`
2. **jobs** → `companyId + createdAt`  
3. **quotes** → `companyId + createdAt`
4. **users** → `companyId + role`

## ⚡ HIGH PRIORITY (Create Next - For Dashboard Features)
5. **jobs** → `companyId + status`
6. **jobs** → `companyId + payment.status`
7. **quotes** → `companyId + status`

## 📊 ANALYTICS (Create for Analytics Tab)
8. **jobs** → `companyId + payment.status + createdAt`
9. **jobs** → `companyId + createdAt` (ascending)
10. **quotes** → `companyId + createdAt` (ascending)

## 🔍 SEARCH & ADVANCED (Create When Needed)
11. **clients** → `companyId + email`
12. **jobs** → `companyId + clientId + createdAt`
13. **companies** → `ownerId + createdAt`
14. **companies** → `inviteCode`
15. **cleaner_profiles** → `companyId + createdAt`
16. **teams** → `companyId + createdAt`

---

# 📝 FIREBASE CONSOLE STEPS

## For Each Index Above:

1. **Go to Firebase Console** → Your Project
2. **Firestore Database** → **Indexes** tab  
3. **Click "Create Index"**
4. **Enter exactly:**
   - Collection ID: `[collection name]`
   - Field 1: `[first field]` → `[Ascending/Descending]`
   - Field 2: `[second field]` → `[Ascending/Descending]`  
   - Field 3: `[third field]` → `[Ascending/Descending]` (if applicable)
   - Query scopes: `Collection`
5. **Click "Create"**

## ⚠️ IMPORTANT NOTES:
- **Ascending vs Descending**: Follow exactly as specified
- **Field names**: Must match exactly (case-sensitive)
- **Dot notation**: Use `payment.status` not `payment` → `status`
- **Query scopes**: Always use "Collection" 
- **Creation time**: Each index takes 2-5 minutes to build

---

# 🧪 TEST AFTER CREATING INDEXES

1. **Sign into your app**
2. **Navigate to each tab**: Clients, Jobs, Analytics
3. **Check browser console**: Should see no "missing index" errors
4. **Verify data loads**: All lists should populate properly
5. **Test filtering**: Status filters should work instantly

**Total indexes needed: 16** (4 critical + 12 additional)
**Estimated creation time: 30-60 minutes** (they build in parallel)

Create the **CRITICAL** ones first to get your app working! 🚀
