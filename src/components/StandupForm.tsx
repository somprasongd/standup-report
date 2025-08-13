'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface StandupFormProps {
  onSuccess?: () => void;
}

export default function StandupForm({ onSuccess }: StandupFormProps) {
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [blockers, setBlockers] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingEntry, setExistingEntry] = useState<any>(null);
  
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const loading = status === "loading";

  // Check if user already has an entry for today
  useEffect(() => {
    const checkExistingEntry = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch('/api/standup/check');
        if (response.ok) {
          const data = await response.json();
          if (data.entry) {
            setExistingEntry(data.entry);
            setYesterday(data.entry.yesterday);
            setToday(data.entry.today);
            setBlockers(data.entry.blockers || '');
          }
        }
      } catch (err) {
        console.error('Error checking existing entry:', err);
      }
    };
    
    checkExistingEntry();
  }, [session?.user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const url = existingEntry ? `/api/standup/${existingEntry.id}` : '/api/standup';
      const method = existingEntry ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          yesterday,
          today,
          blockers,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 409) {
          // User already has an entry, update the form with existing data
          setExistingEntry(data.entry);
          setYesterday(data.entry.yesterday);
          setToday(data.entry.today);
          setBlockers(data.entry.blockers || '');
          throw new Error(data.error);
        }
        throw new Error(data.error || 'Failed to submit standup entry');
      }
      
      // Success - close modal and refresh data
      setSuccess(true);
      
      // Close the dialog after a short delay and trigger refresh
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        // Dispatch a custom event to notify the StandupList to refresh
        window.dispatchEvent(new CustomEvent('standupEntryUpdated'));
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form values
    setYesterday('');
    setToday('');
    setBlockers('');
    setExistingEntry(null);
    // Close the dialog
    if (onSuccess) {
      onSuccess();
    }
  };

  if (loading) {
    return <div className="bg-white p-6 rounded-lg">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Daily Standup Report</h2>
        <p>Please sign in to submit your standup report.</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          Standup entry {existingEntry ? 'updated' : 'submitted'} successfully!
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {existingEntry && (
          <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded">
            You already have a standup entry for today. You can edit it below.
          </div>
        )}
        
        <div>
          <label htmlFor="yesterday" className="block text-sm font-medium text-gray-700 mb-1">
            What did you do yesterday?
          </label>
          <textarea
            id="yesterday"
            value={yesterday}
            onChange={(e) => setYesterday(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Describe your work from yesterday"
          />
        </div>
        
        <div>
          <label htmlFor="today" className="block text-sm font-medium text-gray-700 mb-1">
            What will you do today?
          </label>
          <textarea
            id="today"
            value={today}
            onChange={(e) => setToday(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Describe your planned work for today"
          />
        </div>
        
        <div>
          <label htmlFor="blockers" className="block text-sm font-medium text-gray-700 mb-1">
            Any blockers or challenges?
          </label>
          <textarea
            id="blockers"
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Describe any blockers or challenges (optional)"
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {isSubmitting ? (existingEntry ? 'Updating...' : 'Submitting...') : 
             (existingEntry ? 'Update Standup Entry' : 'Submit Standup Entry')}
          </button>
        </div>
      </form>
    </div>
  );
}