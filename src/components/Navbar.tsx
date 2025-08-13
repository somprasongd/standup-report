"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Team Standup Report</h1>
          </div>
          <div className="flex items-center">
            {loading ? (
              <div>Loading...</div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Hi, {session.user?.name}</span>
                <Button onClick={() => signOut()} variant="outline" size="sm">
                  Sign out
                </Button>
              </div>
            ) : (
              <Button onClick={() => signIn("google")} variant="outline" size="sm">
                Sign in with Google
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}