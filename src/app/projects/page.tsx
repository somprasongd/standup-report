import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProjectsClient from "./ProjectsClient";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/");
  }
  
  return (
    <div className="h-full bg-background flex flex-col">
      <div className="container mx-auto px-4 py-6 flex-shrink-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        </div>
        
        <ProjectsClient />
      </div>
    </div>
  );
}