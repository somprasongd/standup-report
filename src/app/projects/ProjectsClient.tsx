"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, User, Folder } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type Project = {
  id: number;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    name: string | null;
    email: string;
    image: string | null;
  };
};

export default function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/projects");
      const data = await res.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        setProjects([]);
        console.error("Unexpected data format:", data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive"
      });
      setProjects([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch projects
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter projects based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProjects(filtered);
    }
  }, [searchTerm, projects]);

  const handleCreateProject = () => {
    setIsEditing(false);
    setCurrentProject(null);
    setFormData({
      name: "",
      code: "",
      description: ""
    });
    setIsDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setIsEditing(true);
    setCurrentProject(project);
    setFormData({
      name: project.name,
      code: project.code,
      description: project.description || ""
    });
    setIsDialogOpen(true);
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete project");
      }

      toast({
        title: "Success",
        description: "Project deleted successfully"
      });

      fetchProjects();
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete project",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/projects/${currentProject?.id}` : "/api/projects";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? "update" : "create"} project`);
      }

      toast({
        title: "Success",
        description: `Project ${isEditing ? "updated" : "created"} successfully`
      });

      setIsDialogOpen(false);
      fetchProjects();
    } catch (error: any) {
      console.error(`Error ${isEditing ? "updating" : "creating"} project:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? "update" : "create"} project`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search and Create */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search projects..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleCreateProject} className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Project</span>
        </Button>
      </div>

      {/* Projects List */}
      <div className="flex-grow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="h-12 w-12 text-muted-foreground mb-4 flex items-center justify-center">
              <Folder className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No projects match your search." : "Get started by creating a new project."}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateProject} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            )}
          </div>
        ) : Array.isArray(filteredProjects) && filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-4 h-full">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="font-mono">{project.code}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditProject(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  {project.description && (
                    <p className="text-muted-foreground text-sm">{project.description}</p>
                  )}
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="truncate">{project.createdBy.name || project.createdBy.email}</span>
                  </div>
                  <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="h-12 w-12 text-muted-foreground mb-4 flex items-center justify-center">
              <Folder className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No projects match your search." : "Get started by creating a new project."}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateProject} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Project" : "Create Project"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the project details below." 
                : "Enter the details for your new project."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">Project Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="e.g. HOSV3, IPD"
                  maxLength={10}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Usually 3-6 characters (e.g. HOSV3, IPD, HOSWEB)
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter project description (optional)"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Project" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
