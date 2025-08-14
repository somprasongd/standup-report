import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-foreground/70 text-sm">
              Made with
            </span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span className="text-foreground/70 text-sm">
              for efficient team collaboration
            </span>
          </div>
          <div className="text-foreground/70 text-sm">
            © {new Date().getFullYear()} Team Standup Report. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}