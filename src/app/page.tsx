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
          <Dialog>
            <DialogTrigger asChild>
              <Button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md whitespace-nowrap">
                + New Standup
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">Daily Standup Report</DialogTitle>
              </DialogHeader>
              <StandupForm />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="w-full">
          <StandupList />
        </div>
      </div>
    </div>
  );
}