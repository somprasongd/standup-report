import { Suspense } from 'react';
import StandupListContent from './StandupListContent';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function StandupList() {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Recent Standup Entries</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <StandupListContent />
      </Suspense>
    </div>
  );
}