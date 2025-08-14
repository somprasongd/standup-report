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
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';
import { useDialog } from '@/components/ui/dialog-context';
import MarkdownEditor from '@uiw/react-markdown-editor';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { Edit3, Clock, User, Calendar, Kanban } from 'lucide-react';

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

export default function StandupListContent({ selectedDate, refreshFlag = false }: { selectedDate: Date, refreshFlag?: boolean }) {
  const [entries, setEntries] = useState<StandupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<StandupEntry | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const { data: session } = useSession();
  const router = useRouter();

  // Load view mode preference from localStorage on component mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem('standupViewMode');
    if (savedViewMode === 'grid' || savedViewMode === 'kanban') {
      setViewMode(savedViewMode as 'grid' | 'kanban');
    }
  }, []);

  // Save view mode preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('standupViewMode', viewMode);
  }, [viewMode]);

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
  }, [selectedDate, refreshFlag]);

  const canEditEntry = (entry: StandupEntry) => {
    // Check if it's today's entry
    if (!isToday(new Date(entry.createdAt))) {
      return false;
    }
    
    // Check if the user is the owner of the entry
    // NextAuth stores the user ID in session.user.id
    if (!session?.user || !('id' in session.user) || entry.userId !== (session.user as any).id) {
      return false;
    }
    
    return true;
  };

  const handleEdit = (entry: StandupEntry) => {
    setEditingEntry(entry);
  };

  // Function to truncate markdown content
  const truncateMarkdown = (content: string, maxLength: number = 100) => {
    // Remove markdown formatting for truncation
    const plainText = content.replace(/[#*_\-\[\]()~`>]/g, '').replace(/\n/g, ' ');
    if (plainText.length <= maxLength) return content;
    return plainText.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-foreground/70">Loading standup entries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-error font-medium">Error: {error}</p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No standup entries</h3>
        <p className="text-foreground/70 mb-4">No team members have submitted standup reports for this date.</p>
      </div>
    );
  }

  // Define the EditStandupForm component inside StandupListContent
  function EditStandupForm({ 
    entry, 
    onDelete, 
    onUpdate 
  }: { 
    entry: StandupEntry | null, 
    onDelete: () => void, 
    onUpdate: () => void 
  }) {
    const [yesterday, setYesterday] = useState(entry?.yesterday || '');
    const [today, setToday] = useState(entry?.today || '');
    const [blockers, setBlockers] = useState(entry?.blockers || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    
    const { data: session } = useSession();
    const { setOpen } = useDialog();

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
        
        // Close the dialog after a short delay
        setTimeout(() => {
          setOpen(false);
          // Notify parent to refresh data
          onUpdate();
          // Dispatch a custom event to notify other components
          window.dispatchEvent(new CustomEvent('standupEntryUpdated'));
        }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleDelete = async () => {
      if (!entry) return;
      
      const confirmDelete = window.confirm("Are you sure you want to delete this standup entry? This action cannot be undone.");
      if (!confirmDelete) return;
      
      setIsDeleting(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/standup/${entry.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete standup entry');
        }
        
        // Close the dialog
        setOpen(false);
        
        // Notify parent to refresh data
        onDelete();
        
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new CustomEvent('standupEntryUpdated'));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsDeleting(false);
      }
    };

    if (!entry) {
      return <div>Loading...</div>;
    }

    return (
      <div className="bg-background">
        {success && (
          <div className="mb-4 p-4 bg-success/10 text-success rounded-md border border-success/20">
            Standup entry updated successfully!
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-error/10 text-error rounded-md border border-error/20">
            Error: {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="yesterday" className="block text-sm font-medium text-foreground/80 mb-2 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              What did you do yesterday?
            </label>
            <MarkdownEditor
              value={yesterday}
              onChange={(value) => setYesterday(value)}
              height="150px"
              className="border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
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
              className="border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
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
              className="border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
            />
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0 sm:justify-between pt-4 border-t border-border">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Entry'}
            </Button>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Updating...' : 'Update Standup Entry'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </div>
    );
  }

  // Kanban view component
  const KanbanView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Yesterday Column */}
        <div className="bg-secondary rounded-lg p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 flex-shrink-0">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg text-foreground">Yesterday</h3>
            <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
              {entries.length}
            </span>
          </div>
          <div className="space-y-4 overflow-y-auto flex-grow" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            {entries.map((entry) => (
              <div key={`yesterday-${entry.id}`} className="card p-4">
                <div className="flex items-center mb-2">
                  {entry.user?.image ? (
                    <img 
                      src={entry.user.image} 
                      alt={entry.user.name || 'User'} 
                      className="w-6 h-6 rounded-full mr-2 object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-background mr-2 flex items-center justify-center">
                      <User className="h-3 w-3 text-foreground/70" />
                    </div>
                  )}
                  <span className="font-medium text-sm text-foreground truncate">
                    {entry.user?.name || entry.name}
                  </span>
                </div>
                <div className="text-foreground/90 text-sm max-w-none">
                  <MarkdownPreview 
                    source={truncateMarkdown(entry.yesterday, 150)} 
                    className="w-md-editor-preview"
                  />
                </div>
                <div className="mt-2 text-xs text-foreground/60">
                  {format(parseISO(entry.createdAt), 'h:mm a')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today Column */}
        <div className="bg-secondary rounded-lg p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 flex-shrink-0">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg text-foreground">Today</h3>
            <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
              {entries.length}
            </span>
          </div>
          <div className="space-y-4 overflow-y-auto flex-grow" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            {entries.map((entry) => (
              <div key={`today-${entry.id}`} className="card p-4">
                <div className="flex items-center mb-2">
                  {entry.user?.image ? (
                    <img 
                      src={entry.user.image} 
                      alt={entry.user.name || 'User'} 
                      className="w-6 h-6 rounded-full mr-2 object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-background mr-2 flex items-center justify-center">
                      <User className="h-3 w-3 text-foreground/70" />
                    </div>
                  )}
                  <span className="font-medium text-sm text-foreground truncate">
                    {entry.user?.name || entry.name}
                  </span>
                </div>
                <div className="text-foreground/90 text-sm max-w-none">
                  <MarkdownPreview 
                    source={truncateMarkdown(entry.today, 150)} 
                    className="w-md-editor-preview"
                  />
                </div>
                <div className="mt-2 text-xs text-foreground/60">
                  {format(parseISO(entry.createdAt), 'h:mm a')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blockers Column */}
        <div className="bg-secondary rounded-lg p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="font-bold text-lg text-foreground">Blockers</h3>
            <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
              {entries.filter(e => e.blockers).length}
            </span>
          </div>
          <div className="space-y-4 overflow-y-auto flex-grow" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            {entries.filter(e => e.blockers).map((entry) => (
              <div key={`blockers-${entry.id}`} className="card p-4">
                <div className="flex items-center mb-2">
                  {entry.user?.image ? (
                    <img 
                      src={entry.user.image} 
                      alt={entry.user.name || 'User'} 
                      className="w-6 h-6 rounded-full mr-2 object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-background mr-2 flex items-center justify-center">
                      <User className="h-3 w-3 text-foreground/70" />
                    </div>
                  )}
                  <span className="font-medium text-sm text-foreground truncate">
                    {entry.user?.name || entry.name}
                  </span>
                </div>
                <div className="text-foreground/90 text-sm max-w-none">
                  <MarkdownPreview 
                    source={truncateMarkdown(entry.blockers || '', 150)} 
                    className="w-md-editor-preview"
                  />
                </div>
                <div className="mt-2 text-xs text-foreground/60">
                  {format(parseISO(entry.createdAt), 'h:mm a')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* View mode toggle */}
      <div className="flex justify-end mb-4 items-center flex-shrink-0">
        <span className="text-sm text-foreground/80 mr-2">Grid</span>
        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'grid' ? 'kanban' : 'grid')}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-pressed={viewMode === 'kanban'}
        >
          <span className="sr-only">Toggle view</span>
          <span
            className={`${
              viewMode === 'kanban' ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-foreground/30'
            } inline-block h-4 w-4 transform rounded-full transition-transform`}
          />
        </button>
        <span className="text-sm text-foreground/80 ml-2">Kanban</span>
      </div>

      {/* Render based on view mode with scrolling container */}
      <div className="flex-grow overflow-y-auto">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
            {entries.map((entry) => (
              <div key={entry.id} className="card p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    {entry.user?.image ? (
                      <img 
                        src={entry.user.image} 
                        alt={entry.user.name || 'User'} 
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary mr-3 flex items-center justify-center">
                        <User className="h-5 w-5 text-foreground/70" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-foreground truncate">
                        {entry.user?.name || entry.name}
                      </h3>
                      <p className="text-xs text-foreground/60">
                        {format(parseISO(entry.createdAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 flex-grow">
                  <div>
                    <h4 className="font-medium text-foreground/80 text-sm mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Yesterday
                    </h4>
                    <div className="text-foreground/90 text-sm max-w-none">
                      <MarkdownPreview 
                        source={truncateMarkdown(entry.yesterday, 200)} 
                        className="w-md-editor-preview"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground/80 text-sm mb-1 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Today
                    </h4>
                    <div className="text-foreground/90 text-sm max-w-none">
                      <MarkdownPreview 
                        source={truncateMarkdown(entry.today, 200)} 
                        className="w-md-editor-preview"
                      />
                    </div>
                  </div>
                  
                  {entry.blockers && (
                    <div>
                      <h4 className="font-medium text-foreground/80 text-sm mb-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Blockers
                      </h4>
                      <div className="text-foreground/90 text-sm max-w-none">
                        <MarkdownPreview 
                          source={truncateMarkdown(entry.blockers, 200)} 
                          className="w-md-editor-preview"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Edit button removed from grid view as per requirement */}
              </div>
            ))}
          </div>
        ) : (
          <KanbanView />
        )}
      </div>
    </div>
  );
}