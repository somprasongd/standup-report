import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateMarkdown(content: string, maxLength: number) {
  if (!content) return { content: '', truncated: false };
  
  // Simple truncation - in a real app, you might want to use a more sophisticated
  // markdown-aware truncation library
  if (content.length <= maxLength) {
    return { content, truncated: false };
  }
  
  // Truncate and add ellipsis
  const truncated = content.substring(0, maxLength).trim() + '...';
  return { content: truncated, truncated: true };
}