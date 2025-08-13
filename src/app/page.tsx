import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StandupList from '@/components/StandupList';
import LandingPage from '@/components/LandingPage';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import StandupForm from '@/components/StandupForm';
import { DialogDemo } from "@/components/DialogDemo";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return <LandingPage />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Team Standup Report</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Share what you did yesterday, what you plan to do today, and any blockers.
            </p>
          </div>
          <DialogDemo />
        </div>
        
        <div className="w-full">
          <StandupList />
        </div>
      </div>
    </div>
  );
}