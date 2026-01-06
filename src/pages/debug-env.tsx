/**
 * Debug Environment Variables Page
 * Use this to verify Firebase env vars are loaded correctly
 * Access at: /debug-env
 */

export default function DebugEnvPage() {
  const envVars = {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || 'NOT SET',
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'NOT SET',
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'NOT SET',
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'NOT SET',
    VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'NOT SET',
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || 'NOT SET',
  };

  // Mask sensitive values for security
  const maskValue = (value: string) => {
    if (value === 'NOT SET') return value;
    if (value.length <= 8) return '***';
    return value.substring(0, 8) + '...' + value.substring(value.length - 4);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>

      <div className="bg-gray-100 rounded-lg p-4 mb-4">
        <h2 className="font-bold mb-2">Firebase Configuration Status:</h2>
        <ul className="space-y-2 font-mono text-sm">
          {Object.entries(envVars).map(([key, value]) => (
            <li key={key} className="flex items-center gap-2">
              <span className={value === 'NOT SET' ? 'text-red-600' : 'text-green-600'}>
                {value === 'NOT SET' ? '❌' : '✅'}
              </span>
              <span className="font-semibold">{key}:</span>
              <span className={value === 'NOT SET' ? 'text-red-600' : 'text-gray-700'}>
                {maskValue(value)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold mb-2">⚠️ Security Note:</h3>
        <p className="text-sm text-gray-700">
          This page shows masked environment variables for debugging purposes.
          <strong> Remove this page before production deployment</strong> or protect it with authentication.
        </p>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Build time: {new Date().toISOString()}</p>
        <p>Mode: {import.meta.env.MODE}</p>
        <p>Base URL: {import.meta.env.BASE_URL}</p>
      </div>
    </div>
  );
}
