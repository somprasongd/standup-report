'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import StandupForm from '@/components/StandupForm';
import { Plus, CalendarCheck } from "lucide-react";

export function DialogDemo() {
  const [open, setOpen] = useState(false);
  const [hasEntry, setHasEntry] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  // Check if user already has an entry for today
  useEffect(() => {
    const checkExistingEntry = async () => {
      if (!session?.user || !('id' in session.user)) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/standup/check');
        if (response.ok) {
          const data = await response.json();
          setHasEntry(data.hasEntry);
        }
      } catch (err) {
        console.error('Error checking existing entry:', err);
      } finally {
        setLoading(false);
      }
    };

    checkExistingEntry();
    
    // Also listen for updates from the form
    const handleStandupEntryUpdated = () => {
      checkExistingEntry();
    };
    
    window.addEventListener('standupEntryUpdated', handleStandupEntryUpdated);
    
    return () => {
      window.removeEventListener('standupEntryUpdated', handleStandupEntryUpdated);
    };
  }, [session?.user]);

  if (loading) {
    return (
      <Button 
        className="fixed bottom-6 right-6 rounded-full p-4 btn btn-primary shadow-lg z-10" 
        disabled
      >
        <Plus className="h-6 w-6" />
      </Button>
    );
  }

  // Show a different button if user already has an entry for today
  if (hasEntry) {
    return (
      <div className="fixed bottom-6 right-6 z-10">
        <Button 
          className="rounded-full p-4 btn btn-secondary shadow-lg gap-2"
          onClick={() => setOpen(true)}
        >
          <CalendarCheck className="h-6 w-6" />
          <span className="hidden sm:inline">Edit Today's Entry</span>
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground">Edit Standup Report</DialogTitle>
            </DialogHeader>
            <StandupForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 rounded-full p-4 btn btn-primary shadow-lg z-10 gap-2"
          >
            <Plus className="h-6 w-6" />
            <span className="hidden sm:inline">New Standup</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">Daily Standup Report</DialogTitle>
          </DialogHeader>
          <StandupForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}