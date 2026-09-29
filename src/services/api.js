/**
 * NiwasSetu API Client
 * Connects frontend with the Express.js & MongoDB Atlas backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Check backend and MongoDB connection health
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      isServerRunning: true,
      isDbConnected: data.isDbConnected || false,
      database: data.database || 'MongoDB Atlas',
      error: data.error || null
    };
  } catch (err) {
    return {
      isServerRunning: false,
      isDbConnected: false,
      database: 'MongoDB Atlas',
      error: err.message
    };
  }
}

/**
 * Fetch all complaints from MongoDB backend
 */
export async function fetchComplaintsFromBackend() {
  try {
    const res = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch from backend`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('Backend fetch failed, falling back to local cache:', err.message);
    throw err;
  }
}

/**
 * Create a new complaint in MongoDB
 */
export async function createComplaintInBackend(complaintData) {
  try {
    const res = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(complaintData),
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to save to MongoDB`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn('Backend create failed:', err.message);
    throw err;
  }
}

/**
 * Update an existing complaint in MongoDB
 */
export async function updateComplaintInBackend(id, updates) {
  try {
    const res = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(updates),
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update in MongoDB`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn('Backend update failed:', err.message);
    throw err;
  }
}

/**
 * Bulk resolve all complaints in a cluster in MongoDB
 */
export async function resolveClusterInBackend(clusterId) {
  try {
    const res = await fetch(`${API_BASE_URL}/complaints/resolve-cluster`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ clusterId }),
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to resolve cluster in MongoDB`);
    return await res.json();
  } catch (err) {
    console.warn('Backend resolve cluster failed:', err.message);
    throw err;
  }
}

/**
 * Delete all complaints from backend (wipe database)
 */
export async function clearAllComplaintsInBackend() {
  try {
    const res = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to clear complaints`);
    return await res.json();
  } catch (err) {
    console.warn('Backend clear complaints failed:', err.message);
    throw err;
  }
}
/**
 * Delete a single complaint by ID from MongoDB
 */
export async function deleteComplaintInBackend(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to delete complaint`);
    return await res.json();
  } catch (err) {
    console.warn('Backend delete complaint failed:', err.message);
    throw err;
  }
}

/**
 * Seed complaints into backend
 */
export async function seedComplaintsToBackend(complaints, force = false) {
  try {
    const res = await fetch(`${API_BASE_URL}/complaints/seed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ complaints, force }),
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to seed database`);
    return await res.json();
  } catch (err) {
    console.warn('Backend seed failed:', err.message);
    throw err;
  }
}


/**
 * Fetch Google Gemini AI model status from backend
 */
export async function fetchAIStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/status`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    return {
      provider: 'Google Gemini',
      model: 'gemini-2.0-flash',
      isConfigured: false,
      isReady: false,
      error: err.message
    };
  }
}

/**
 * Test Gemini AI connection live
 */
export async function testAIConnectionApi() {
  const res = await fetch(`${API_BASE_URL}/ai/test`, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(10000)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.details || 'AI test failed');
  return data;
}

/**
 * Master Smart Complaint Processor
 * Combines Same-Day Duplicate Filtering + Language Training + Urgency Scoring
 */
export async function processSmartComplaintApi(incoming, existing = []) {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/smart-process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ incoming, existing }),
      signal: AbortSignal.timeout(15000)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Smart AI processing failed');
    return data.data;
  } catch (err) {
    console.warn('Backend Smart AI call failed, falling back to local heuristics:', err.message);
    throw err;
  }
}


