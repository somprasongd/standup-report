import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StandupList from '@/components/StandupList';
import LandingPage from '@/components/LandingPage';
import { StandupDialog } from "@/components/StandupDialog";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return <LandingPage />;
  }
  
  return (
    <div className="h-full bg-background flex flex-col">
      <div className="container mx-auto px-4 py-4 flex-shrink-0">
        <div className="flex justify-center">
          <StandupDialog />
        </div>
      </div>
      
      <div className="flex-grow overflow-hidden px-4 pb-4">
        <StandupList />
      </div>
    </div>
  );
}