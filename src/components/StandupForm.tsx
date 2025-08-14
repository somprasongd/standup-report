'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import MarkdownEditor from '@uiw/react-markdown-editor';
import { Button } from "@/components/ui/button";
import { Clock, Calendar, AlertCircle } from 'lucide-react';

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
      if (!session?.user || !('id' in session.user)) return;
      
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
  }, [session?.user]);

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
    return (
      <div className="bg-background p-6 rounded-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-secondary rounded w-3/4"></div>
          <div className="h-10 bg-secondary rounded"></div>
          <div className="h-4 bg-secondary rounded w-1/2"></div>
          <div className="h-10 bg-secondary rounded"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-background rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Daily Standup Report</h2>
        <p className="text-foreground/80">Please sign in to submit your standup report.</p>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {success && (
        <div className="mb-4 p-4 bg-success/10 text-success rounded-md border border-success/20 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Standup entry {existingEntry ? 'updated' : 'submitted'} successfully!
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-error/10 text-error rounded-md border border-error/20 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Error: {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {existingEntry && (
          <div className="mb-4 p-4 bg-primary/10 text-primary rounded-md border border-primary/20 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            You already have a standup entry for today. You can edit it below.
          </div>
        )}
        
        <div>
          <label htmlFor="yesterday" className="block text-sm font-medium text-foreground/80 mb-2 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            What did you do yesterday?
          </label>
          <MarkdownEditor
            value={yesterday}
            onChange={(value) => setYesterday(value)}
            height="150px"
            className="border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary bg-background"
          />
        </div>
        
        <div>
          <label htmlFor="today" className="block text-sm font-medium text-foreground/80 mb-2 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            What will you do today?
          </label>
          <MarkdownEditor
            value={today}
            onChange={(value) => setToday(value)}
            height="150px"
            className="border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary bg-background"
          />
        </div>
        
        <div>
          <label htmlFor="blockers" className="block text-sm font-medium text-foreground/80 mb-2 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Any blockers or challenges?
          </label>
          <MarkdownEditor
            value={blockers}
            onChange={(value) => setBlockers(value)}
            height="100px"
            className="border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary bg-background"
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (existingEntry ? 'Updating...' : 'Submitting...') : 
             (existingEntry ? 'Update Standup Entry' : 'Submit Standup Entry')}
          </Button>
        </div>
      </form>
    </div>
  );
}