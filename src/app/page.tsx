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
    <div className="min-h-screen bg-background py-4 sm:py-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-center mb-4">
          <DialogDemo />
        </div>
        
        <div className="w-full">
          <StandupList />
        </div>
      </div>
    </div>
  );
}