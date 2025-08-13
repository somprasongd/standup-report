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

export function DialogDemo() {
  const [open, setOpen] = useState(false);
  const [hasEntry, setHasEntry] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  // Check if user already has an entry for today
  useEffect(() => {
    const checkExistingEntry = async () => {
      if (!session?.user?.id) {
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
  }, [session?.user?.id]);

  if (loading) {
    return (
      <Button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md whitespace-nowrap" disabled>
        Loading...
      </Button>
    );
  }

  // Hide the button if user already has an entry for today
  if (hasEntry) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md whitespace-nowrap">
          + New Standup
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Daily Standup Report</DialogTitle>
        </DialogHeader>
        <StandupForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}