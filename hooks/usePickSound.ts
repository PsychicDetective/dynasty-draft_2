"use client";
import { useCallback } from "react";

export function usePickSound() {
  const playPickIsIn = useCallback((soundFile: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") { resolve(); return; }
      try {
        const audio = new Audio(`/sounds/${soundFile}`);
        audio.volume = 1.0;
        audio.onended = () => resolve();
        audio.onerror = () => resolve(); // fall through silently if file missing
        audio.play().catch(() => resolve());
      } catch {
        resolve();
      }
    });
  }, []);

  return { playPickIsIn };
}