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
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <DialogDemo />
        </div>
        
        <div className="w-full">
          <StandupList />
        </div>
      </div>
    </div>
  );
}