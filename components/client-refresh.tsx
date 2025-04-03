"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * This component helps ensure all clients see the same version of the site.
 * It stores a timestamp in localStorage and checks if it's current.
 */
export function ClientRefresh() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  
  useEffect(() => {
    // This is a unique identifier for this deployment
    // Change this manually whenever you make significant changes
    const APP_VERSION = "v1.0.1"; // Increment this after each deployment
    
    // Check if browser has the current version
    const storedVersion = localStorage.getItem("app_version");
    
    if (storedVersion !== APP_VERSION) {
      // Store the new version
      localStorage.setItem("app_version", APP_VERSION);
      
      // Clear any stale data
      localStorage.removeItem("last_page_state");
      sessionStorage.clear();
      
      // Force a hard refresh if versions don't match
      // But only do this once to avoid refresh loops
      if (storedVersion && !checked) {
        window.location.reload();
      }
    }
    
    setChecked(true);
  }, [checked, router]);
  
  // This component doesn't render anything visible
  return null;
} 