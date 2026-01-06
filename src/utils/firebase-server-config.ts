/**
 * Fetch Firebase config from server (NOT RECOMMENDED)
 * This adds complexity without improving security
 */

export async function getFirebaseConfigFromServer() {
  try {
    // Call your backend API
    const response = await fetch('https://your-backend.com/api/firebase-config', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Firebase config');
    }

    const config = await response.json();
    return config;
  } catch (error) {
    console.error('[FIREBASE] Failed to fetch config from server:', error);
    // Fallback to env vars
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
  }
}
