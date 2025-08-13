'use client';

import { useEffect, useState } from 'react';
import { format, isSameDay, parseISO, isToday } from 'date-fns';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type StandupEntry = {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  yesterday: string;
  today: string;
  blockers: string | null;
  userId?: string | null;
  user?: {
    name: string | null;
    id: string;
    image: string | null;
  } | null;
};

export default function StandupListContent({ selectedDate }: { selectedDate: Date }) {
  const [entries, setEntries] = useState<StandupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<StandupEntry | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Format the date for the API request
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        
        const response = await fetch(`/api/standup?date=${formattedDate}`);
        
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
  }, [selectedDate]);

  const canEditEntry = (entry: StandupEntry) => {
    // Check if it's today's entry
    if (!isToday(new Date(entry.createdAt))) {
      return false;
    }
    
    // Check if the user is the owner of the entry
    // NextAuth stores the user ID in session.user.id
    if (!session?.user?.id || entry.userId !== session.user.id) {
      return false;
    }
    
    return true;
  };

  const handleEdit = (entry: StandupEntry) => {
    setEditingEntry(entry);
  };

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
        <p className="text-gray-500">No standup entries for this date.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {entries.map((entry) => (
        <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              {entry.user?.image ? (
                <img 
                  src={entry.user.image} 
                  alt={entry.user.name || 'User'} 
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                  <span className="text-gray-500 text-xs font-bold">
                    {entry.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <h3 className="font-bold text-lg text-gray-900">
                {entry.user?.name || entry.name}
              </h3>
            </div>
            <span className="text-sm text-gray-500">
              {format(parseISO(entry.createdAt), 'h:mm a')}
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-700 text-sm">Yesterday</h4>
              <p className="text-gray-600 text-sm">{entry.yesterday}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 text-sm">Today</h4>
              <p className="text-gray-600 text-sm">{entry.today}</p>
            </div>
            
            {entry.blockers && (
              <div>
                <h4 className="font-medium text-gray-700 text-sm">Blockers</h4>
                <p className="text-gray-600 text-sm">{entry.blockers}</p>
              </div>
            )}
          </div>
          
          {canEditEntry(entry) && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(entry)}
                    className="text-xs"
                  >
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900">Edit Standup Report</DialogTitle>
                  </DialogHeader>
                  <EditStandupForm entry={editingEntry} />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EditStandupForm({ entry }: { entry: StandupEntry | null }) {
  const [yesterday, setYesterday] = useState(entry?.yesterday || '');
  const [today, setToday] = useState(entry?.today || '');
  const [blockers, setBlockers] = useState(entry?.blockers || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { data: session } = useSession();

  useEffect(() => {
    if (entry) {
      setYesterday(entry.yesterday);
      setToday(entry.today);
      setBlockers(entry.blockers || '');
    }
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch(`/api/standup/${entry?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          yesterday,
          today,
          blockers,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update standup entry');
      }
      
      setSuccess(true);
      
      // Reload the page to show updated entries
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!entry) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white">
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          Standup entry updated successfully!
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {isSubmitting ? 'Updating...' : 'Update Standup Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}