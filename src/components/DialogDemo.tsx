'use client';

import { useState } from "react";
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