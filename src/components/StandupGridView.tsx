'use client';

import { format, parseISO } from 'date-fns';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { User, Clock, Folder } from 'lucide-react';
import { truncateMarkdown } from '@/lib/utils';
import { useState } from 'react';

interface StandupEntry {
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
}

interface StandupGridViewProps {
  entries: StandupEntry[];
  // Note: Edit functionality was removed from grid view as per requirements
}

export default function StandupGridView({ entries }: StandupGridViewProps) {
  const [selectedEntry, setSelectedEntry] = useState<StandupEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (entry: StandupEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
        {entries.map((entry) => (
          <div 
            key={entry.id} 
            className="card p-5 flex flex-col h-full cursor-pointer hover:bg-secondary/30 transition-colors"
            onClick={() => handleOpenModal(entry)}
          >
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
                    source={truncateMarkdown(entry.yesterday, 200).content} 
                    className="w-md-editor-preview"
                  />
                  {truncateMarkdown(entry.yesterday, 200).truncated && (
                    <span className="text-primary text-xs mt-1 block">Click to view full content</span>
                  )}
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
                    source={truncateMarkdown(entry.today, 200).content} 
                    className="w-md-editor-preview"
                  />
                  {truncateMarkdown(entry.today, 200).truncated && (
                    <span className="text-primary text-xs mt-1 block">Click to view full content</span>
                  )}
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
                      source={truncateMarkdown(entry.blockers, 200).content} 
                      className="w-md-editor-preview"
                    />
                    {truncateMarkdown(entry.blockers, 200).truncated && (
                      <span className="text-primary text-xs mt-1 block">Click to view full content</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal for viewing full content */}
      {isModalOpen && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-xl border border-border card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 mb-4">
                  {selectedEntry.user?.image ? (
                    <img 
                      src={selectedEntry.user.image} 
                      alt={selectedEntry.user.name || 'User'} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-5 w-5 text-foreground/70" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-foreground">
                      {selectedEntry.user?.name || selectedEntry.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-foreground/60">
                        {format(parseISO(selectedEntry.createdAt), 'MMMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="text-foreground/70 hover:text-foreground"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6 mt-4">
                <div>
                  <h4 className="font-medium text-foreground/80 text-sm mb-2 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Yesterday
                  </h4>
                  <div className="text-foreground/90 max-w-none border border-border rounded-lg p-4">
                    <MarkdownPreview 
                      source={selectedEntry.yesterday} 
                      className="w-md-editor-preview"
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground/80 text-sm mb-2 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Today
                  </h4>
                  <div className="text-foreground/90 max-w-none border border-border rounded-lg p-4">
                    <MarkdownPreview 
                      source={selectedEntry.today} 
                      className="w-md-editor-preview"
                    />
                  </div>
                </div>
                
                {selectedEntry.blockers && (
                  <div>
                    <h4 className="font-medium text-foreground/80 text-sm mb-2 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Blockers
                    </h4>
                    <div className="text-foreground/90 max-w-none border border-border rounded-lg p-4">
                      <MarkdownPreview 
                        source={selectedEntry.blockers} 
                        className="w-md-editor-preview"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}