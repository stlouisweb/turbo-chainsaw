import { useEffect, useState } from 'react';

type HealthStatus = {
  status: string;
  database: string;
  timestamp: string;
};

export default function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data: HealthStatus) => setHealth(data))
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">WWT Interview Project</h1>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">API Health</h2>
          {error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : health ? (
            <div className="space-y-2">
              <StatusRow label="API" value={health.status} />
              <StatusRow label="Database" value={health.database} />
              <p className="text-xs text-gray-400 mt-2">{health.timestamp}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Checking...</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  const ok = value === 'ok' || value === 'connected';
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
