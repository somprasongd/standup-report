'use client';

import { useEffect, useState } from 'react';

type StandupEntry = {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  yesterday: string;
  today: string;
  blockers: string | null;
  user?: {
    name: string | null;
  } | null;
};

export default function StandupListContent() {
  const [entries, setEntries] = useState<StandupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch('/api/standup');
        
        if (!response.ok) {
          throw new Error('Failed to fetch standup entries');
        }
        
        const data = await response.json();
        setEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
    
    // Set up polling to refresh data every 30 seconds
    const interval = setInterval(fetchEntries, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading standup entries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No standup entries yet. Be the first to submit!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-900">
              {entry.user?.name || entry.name}
            </h3>
            <span className="text-sm text-gray-500">
              {new Date(entry.createdAt).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-700">Yesterday</h4>
              <p className="text-gray-600">{entry.yesterday}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Today</h4>
              <p className="text-gray-600">{entry.today}</p>
            </div>
            
            {entry.blockers && (
              <div>
                <h4 className="font-medium text-gray-700">Blockers</h4>
                <p className="text-gray-600">{entry.blockers}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}