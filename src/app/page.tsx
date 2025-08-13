import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StandupForm from '@/components/StandupForm';
import StandupList from '@/components/StandupList';
import LandingPage from '@/components/LandingPage';

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return <LandingPage />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Team Standup Report</h1>
          <p className="text-lg text-gray-600">
            Share what you did yesterday, what you plan to do today, and any blockers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <StandupForm />
          </div>
          <div>
            <StandupList />
          </div>
        </div>
      </div>
    </div>
  );
}