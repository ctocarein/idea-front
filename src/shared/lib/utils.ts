import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne des classes Tailwind de façon sûre (gère les conflits + conditionnels).
 * Utilisé par tout le design system (`shared/ui`) et les features.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
