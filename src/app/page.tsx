import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StandupList from '@/components/StandupList';
import LandingPage from '@/components/LandingPage';
import { DialogDemo } from "@/components/DialogDemo";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return <LandingPage />;
  }
  
  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Team Standup Reports
          </h1>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Share your daily progress, plans, and blockers with your team
          </p>
        </div>
        
        <div className="flex justify-center mb-8">
          <DialogDemo />
        </div>
        
        <div className="w-full">
          <StandupList />
        </div>
      </div>
    </div>
  );
}