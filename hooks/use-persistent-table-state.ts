"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to persist table state in localStorage
 * @param key - Unique identifier for the storage key
 * @param defaultState - Default state to use if no persisted state exists
 * @returns A stateful value and a function to update it
 */
export function usePersistentTableState<T extends object>(
  key: string, 
  defaultState: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const storedState = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    return storedState ? JSON.parse(storedState) : defaultState;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState];
} 