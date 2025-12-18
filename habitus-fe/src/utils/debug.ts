/**
 * DEBUG HELPER - Use in browser console to debug the app
 * 
 * Copy & paste these commands in browser console (F12 → Console tab)
 */

declare global {
  interface Window {
    DEBUG_checkStorage: () => void
    DEBUG_clearStorage: () => void
    DEBUG_setMockToken: (token?: string) => void
    DEBUG_testAPI: () => Promise<void>
    DEBUG_testLogin: (email?: string, password?: string) => Promise<void>
    DEBUG_getRequests: (page?: number, limit?: number) => Promise<void>
    DEBUG_getQuotes: () => Promise<void>
    DEBUG_quickTest: () => Promise<void>
  }
}

// ============================================
// LOCAL STORAGE DEBUG
// ============================================

// Check all stored data
(window as any).DEBUG_checkStorage = () => {
  console.log('=== LOCAL STORAGE DEBUG ===');
  console.log('User:', localStorage.getItem('user'));
  console.log('Token:', localStorage.getItem('authToken'));
  console.log('Email:', localStorage.getItem('userEmail'));
}

// Clear all stored data
(window as any).DEBUG_clearStorage = () => {
  localStorage.clear();
  console.log('✓ LocalStorage cleared');
}

// Set mock token (for testing)
(window as any).DEBUG_setMockToken = (token?: string) => {
  const mockToken = token || 'test-token-' + Date.now();
  localStorage.setItem('authToken', mockToken);
  console.log('✓ Mock token set:', localStorage.getItem('authToken'));
}

// ============================================
// API DEBUG
// ============================================

// Test API connection
(window as any).DEBUG_testAPI = async () => {
  console.log('Testing API connection...');
  try {
    const response = await fetch('http://localhost:3000/api/v1', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✓ API is reachable. Status:', response.status);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('✗ API connection failed:', errorMsg);
  }
}

// Test login
(window as any).DEBUG_testLogin = async (email = 'test@example.com', password = 'password') => {
  console.log('Testing login with:', email);
  try {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      console.log('✓ Login successful');
      console.log('User:', data.user);
      console.log('Token:', data.token);
      // Auto-save
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('✓ Token & user saved to localStorage');
    } else {
      console.error('✗ Login failed:', data.message || response.statusText);
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('✗ Login error:', errorMsg);
  }
}

// Test get requests
(window as any).DEBUG_getRequests = async (page = 1, limit = 5) => {
  console.log(`Fetching requests (page ${page}, limit ${limit})...`);
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('✗ No token found. Please login first.');
    return;
  }
  try {
    const response = await fetch(`http://localhost:3000/api/v1/onsite-requests?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (response.ok) {
      console.log('✓ Requests fetched successfully');
      console.log('Data:', data);
    } else {
      console.error('✗ Failed to fetch requests:', data.message || response.statusText);
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('✗ Error:', errorMsg);
  }
}

// Test get quotes
(window as any).DEBUG_getQuotes = async () => {
  console.log('Fetching quotes...');
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('✗ No token found. Please login first.');
    return;
  }
  try {
    const response = await fetch('http://localhost:3000/api/v1/quotes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (response.ok) {
      console.log('✓ Quotes fetched successfully');
      console.log('Data:', data);
    } else {
      console.error('✗ Failed to fetch quotes:', data.message || response.statusText);
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('✗ Error:', errorMsg);
  }
}

// ============================================
// QUICK TEST WORKFLOW
// ============================================

(window as any).DEBUG_quickTest = async () => {
  console.log('=== QUICK TEST WORKFLOW ===\n');
  
  // 1. Check storage
  console.log('Step 1: Checking localStorage...');
  (window as any).DEBUG_checkStorage();
  
  // 2. Test API
  console.log('\nStep 2: Testing API connection...');
  await (window as any).DEBUG_testAPI();
  
  // 3. Test login (adjust credentials as needed)
  console.log('\nStep 3: Testing login...');
  console.log('(Using default credentials - modify DEBUG_testLogin call if needed)');
  await (window as any).DEBUG_testLogin('tommy@habitus.com', 'password');
  
  // 4. Test get requests
  console.log('\nStep 4: Testing get requests...');
  await (window as any).DEBUG_getRequests();
  
  console.log('\n=== TEST COMPLETE ===');
}

// ============================================
// HELPFUL INFO
// ============================================

console.log(`
╔════════════════════════════════════════════════════════╗
║         HABITUS DEBUG HELPER READY                     ║
╚════════════════════════════════════════════════════════╝

Available commands:
  
  🔍 Storage:
    • DEBUG_checkStorage()      - View all localStorage
    • DEBUG_clearStorage()      - Clear localStorage
    • DEBUG_setMockToken()      - Set test token

  📡 API:
    • DEBUG_testAPI()           - Test API connection
    • DEBUG_testLogin()         - Test login endpoint
    • DEBUG_getRequests()       - Test get requests
    • DEBUG_getQuotes()         - Test get quotes

  🚀 Quick Test:
    • DEBUG_quickTest()         - Run full test workflow

  ℹ️  Example:
    1. DEBUG_checkStorage()
    2. DEBUG_testLogin('email@example.com', 'password')
    3. DEBUG_getRequests()

Note: Replace credentials with actual backend users
`);
