import type { Metadata } from "next";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DialogProvider } from "@/components/ui/dialog-context";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Team Standup Report",
  description: "A simple tool for team standup meetings",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="en">
      <body
        className="antialiased h-screen flex flex-col overflow-hidden"
      >
        <AuthProvider session={session}>
          <DialogProvider>
            <div className="flex flex-col h-full">
              <Navbar />
              <main className="flex-grow overflow-hidden">{children}</main>
              <Footer />
              <Toaster />
            </div>
          </DialogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
