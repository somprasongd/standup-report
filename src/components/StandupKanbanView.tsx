'use client';

import { format, parseISO } from 'date-fns';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { User, Clock, Calendar, Folder } from 'lucide-react';
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

interface StandupKanbanViewProps {
  entries: StandupEntry[];
}

export default function StandupKanbanView({ entries }: StandupKanbanViewProps) {
  const [selectedCard, setSelectedCard] = useState<{ entry: StandupEntry; type: 'yesterday' | 'today' | 'blockers' } | null>(null);

  const getCardContent = (entry: StandupEntry, type: 'yesterday' | 'today' | 'blockers') => {
    switch (type) {
      case 'yesterday':
        return entry.yesterday;
      case 'today':
        return entry.today;
      case 'blockers':
        return entry.blockers || '';
      default:
        return '';
    }
  };

  const getCardTitle = (type: 'yesterday' | 'today' | 'blockers') => {
    switch (type) {
      case 'yesterday':
        return 'Yesterday';
      case 'today':
        return 'Today';
      case 'blockers':
        return 'Blockers';
      default:
        return '';
    }
  };

  const getCardIcon = (type: 'yesterday' | 'today' | 'blockers') => {
    switch (type) {
      case 'yesterday':
        return <Clock className="h-4 w-4" />;
      case 'today':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'blockers':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
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
              <div 
                key={`yesterday-${entry.id}`} 
                className="card p-4 cursor-pointer hover:bg-background/50 transition-colors"
                onClick={() => setSelectedCard({ entry, type: 'yesterday' })}
              >
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
                    source={truncateMarkdown(entry.yesterday, 150).content} 
                    className="w-md-editor-preview"
                  />
                  {truncateMarkdown(entry.yesterday, 150).truncated && (
                    <span className="text-primary text-xs mt-1 block">Click to view full content</span>
                  )}
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
              <div 
                key={`today-${entry.id}`} 
                className="card p-4 cursor-pointer hover:bg-background/50 transition-colors"
                onClick={() => setSelectedCard({ entry, type: 'today' })}
              >
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
                    source={truncateMarkdown(entry.today, 150).content} 
                    className="w-md-editor-preview"
                  />
                  {truncateMarkdown(entry.today, 150).truncated && (
                    <span className="text-primary text-xs mt-1 block">Click to view full content</span>
                  )}
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
              <div 
                key={`blockers-${entry.id}`} 
                className="card p-4 cursor-pointer hover:bg-background/50 transition-colors"
                onClick={() => setSelectedCard({ entry, type: 'blockers' })}
              >
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
                    source={truncateMarkdown(entry.blockers || '', 150).content} 
                    className="w-md-editor-preview"
                  />
                  {truncateMarkdown(entry.blockers || '', 150).truncated && (
                    <span className="text-primary text-xs mt-1 block">Click to view full content</span>
                  )}
                </div>
                <div className="mt-2 text-xs text-foreground/60">
                  {format(parseISO(entry.createdAt), 'h:mm a')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for viewing card content */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-xl border border-border card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 mb-4">
                  {selectedCard.entry.user?.image ? (
                    <img 
                      src={selectedCard.entry.user.image} 
                      alt={selectedCard.entry.user.name || 'User'} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-5 w-5 text-foreground/70" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-foreground">
                      {selectedCard.entry.user?.name || selectedCard.entry.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-foreground/60">
                        {format(parseISO(selectedCard.entry.createdAt), 'MMMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCard(null)}
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
                    {getCardIcon(selectedCard.type)}
                    {getCardTitle(selectedCard.type)}
                  </h4>
                  <div className="text-foreground/90 max-w-none border border-border rounded-lg p-4">
                    <MarkdownPreview 
                      source={getCardContent(selectedCard.entry, selectedCard.type)} 
                      className="w-md-editor-preview"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}