'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useDialog } from '@/components/ui/dialog-context';

export default function StandupForm() {
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [blockers, setBlockers] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const { data: session, status } = useSession();
  const { setOpen } = useDialog();
  
  const loading = status === "loading";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch('/api/standup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: session?.user?.name || 'Anonymous',
          yesterday,
          today,
          blockers,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit standup entry');
      }
      
      // Reset form
      setYesterday('');
      setToday('');
      setBlockers('');
      setSuccess(true);
      
      // Close the dialog after a short delay
      setTimeout(() => {
        setOpen(false);
        // Refresh the page to show the new entry
        router.refresh();
      }, 1000);
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
    // Close the dialog
    setOpen(false);
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
          Standup entry submitted successfully!
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={session?.user?.name || 'Anonymous'}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-900"
          />
        </div>
        
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
            {isSubmitting ? 'Submitting...' : 'Submit Standup Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}