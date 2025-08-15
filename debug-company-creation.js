// Debug script to test company creation
// Run this in browser console to test company creation manually

async function testCompanyCreation() {
  console.log('🧪 Testing company creation...');
  
  try {
    // Import Firebase modules
    const { getFirestore, doc, setDoc, Timestamp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
    
    // Get current user
    const auth = firebase.auth();
    const user = auth.currentUser;
    
    if (!user) {
      console.error('❌ No user logged in');
      return;
    }
    
    console.log('👤 Current user:', user.uid, user.email);
    
    // Try to create a test company
    const db = getFirestore();
    const companyId = 'test-company-' + Date.now();
    
    const companyData = {
      id: companyId,
      name: 'Test Company',
      email: user.email,
      ownerId: user.uid,
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        defaultServiceArea: [],
        branding: {
          primaryColor: '#7c2429',
          secondaryColor: '#991b1b'
        }
      },
      subscription: {
        plan: 'free',
        status: 'active'
      },
      inviteCode: 'TEST123',
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    console.log('📝 Creating company with data:', companyData);
    
    await setDoc(doc(db, 'companies', companyId), companyData);
    
    console.log('✅ Company created successfully!', companyId);
    
  } catch (error) {
    console.error('❌ Company creation failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

// Run the test
testCompanyCreation();
