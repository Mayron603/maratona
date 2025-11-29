import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function createPageUrl(page) {
  const basePage = page.split('?')[0]; 
  const query = page.split('?')[1] ? `?${page.split('?')[1]}` : '';
  return `/${basePage.toLowerCase()}${query}`;
}