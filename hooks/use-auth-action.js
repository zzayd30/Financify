"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Custom hook to handle server action responses with authentication
 * Automatically redirects to sign-in page if user is not authenticated
 */
export function useAuthAction() {
  const router = useRouter();

  const handleResponse = (response) => {
    if (response && !response.success && response.redirect) {
      // Show error message
      toast.error(response.error || "Authentication required");
      
      // Redirect to sign-in page
      router.push(response.redirect);
      return false; // Indicates redirect happened
    }
    return true; // Continue normal processing
  };

  return { handleResponse };
}

/**
 * Higher-order function to wrap server actions with auth handling
 */
export function withAuthAction(actionFn) {
  return async (...args) => {
    const result = await actionFn(...args);
    
    // Check if result indicates authentication failure
    if (result && !result.success && result.redirect) {
      // For server actions, we can't redirect directly
      // The component using this action should handle the redirect
      return result;
    }
    
    return result;
  };
}