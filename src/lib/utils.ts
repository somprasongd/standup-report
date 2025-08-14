import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to truncate markdown content
export function truncateMarkdown(content: string, maxLength: number = 100) {
  // Remove markdown formatting for truncation
  const plainText = content.replace(/[#*_\-\[\]()~`>]/g, '').replace(/\n/g, ' ');
  if (plainText.length <= maxLength) {
    return {
      content: content,
      truncated: false
    };
  }
  return {
    content: plainText.substring(0, maxLength) + '...',
    truncated: true
  };
}