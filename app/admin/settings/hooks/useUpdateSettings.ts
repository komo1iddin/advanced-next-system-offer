import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Settings } from "./useSettingsQuery";

interface UpdateSettingsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// Function to update settings
const updateSettings = async (settings: Settings): Promise<Settings> => {
  const response = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...settings.generalSettings,
      ...settings.socialMediaSettings,
      ...settings.seoSettings,
    }),
  });

  if (response.status === 401) {
    throw new Error("Unauthorized. Please log in.");
  }

  if (!response.ok) {
    throw new Error("Failed to update settings");
  }

  return settings;
};

// Hook for updating settings
export function useUpdateSettings(options?: UpdateSettingsOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Error updating settings: ${error.message}`);
      options?.onError?.(error);
    },
  });
} 