"use client";

import { useMemo } from "react";

type FormMode = "create" | "edit";

interface EntityLabels {
  /**
   * The name of the entity in singular form (e.g., "University")
   */
  singular: string;
  
  /**
   * The name of the entity in plural form (e.g., "Universities")
   * If not provided, defaults to singular + "s"
   */
  plural?: string;
}

interface FormModeUtils {
  /**
   * The current form mode
   */
  mode: FormMode;
  
  /**
   * Whether the form is in create mode
   */
  isCreate: boolean;
  
  /**
   * Whether the form is in edit mode
   */
  isEdit: boolean;
  
  /**
   * The action text for the primary action button (e.g., "Create University")
   */
  actionText: string;
  
  /**
   * The title text for the form (e.g., "Create University" or "Edit University")
   */
  titleText: string;
  
  /**
   * The description text for the form 
   * (e.g., "Create a new university" or "Edit university details")
   */
  descriptionText: string;
}

export interface UseFormModeOptions {
  /**
   * The mode of the form
   */
  mode: FormMode;
  
  /**
   * Labels for the entity being created/edited
   */
  entityLabels: EntityLabels;
  
  /**
   * Custom verbs to use for actions (defaults to "Create" and "Edit")
   */
  verbs?: {
    create?: string;
    edit?: string;
  };
}

/**
 * A hook that provides consistent text and utilities for forms based on their mode (create or edit)
 */
export function useFormMode({
  mode,
  entityLabels,
  verbs = {}
}: UseFormModeOptions): FormModeUtils {
  const { 
    singular,
    plural = `${singular}s`
  } = entityLabels;
  
  const createVerb = verbs.create || "Create";
  const editVerb = verbs.edit || "Edit";
  
  const utils = useMemo(() => {
    const isCreate = mode === "create";
    const isEdit = mode === "edit";
    
    const actionVerb = isCreate ? createVerb : editVerb;
    const actionText = `${actionVerb} ${singular}`;
    
    const titleText = actionText;
    
    const descriptionText = isCreate
      ? `${createVerb} a new ${singular.toLowerCase()}`
      : `${editVerb} ${singular.toLowerCase()} details`;
    
    return {
      mode,
      isCreate,
      isEdit,
      actionText,
      titleText,
      descriptionText,
    };
  }, [mode, singular, createVerb, editVerb]);
  
  return utils;
} 