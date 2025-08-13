"use client";

import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Team Standup Report</h1>
          <p className="text-gray-600 mb-6">
            Please sign in with your Hospital-OS Google account to access the standup report system.
          </p>
          <Button 
            onClick={() => signIn("google")} 
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
          >
            Sign in with Google
          </Button>
          <p className="mt-4 text-sm text-gray-500">
            Note: Only users with @hospital-os.com email addresses can access this system.
          </p>
        </div>
      </div>
    );
  }

  return null; // This component only shows content for unauthenticated users
}