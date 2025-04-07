"use client";

import { useState, useCallback, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmDialogState extends ConfirmOptions {
  isOpen: boolean;
  resolve: (value: boolean) => void;
}

export function useConfirm() {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: "Confirmation",
    description: "Are you sure you want to proceed?",
    confirmText: "Confirm",
    cancelText: "Cancel",
    resolve: () => {},
  });

  const confirm = useCallback(
    (options: ConfirmOptions = {}) => {
      return new Promise<boolean>((resolve) => {
        setDialogState({
          ...dialogState,
          ...options,
          isOpen: true,
          resolve,
        });
      });
    },
    [dialogState]
  );

  const handleConfirm = useCallback(() => {
    dialogState.resolve(true);
    setDialogState({ ...dialogState, isOpen: false });
  }, [dialogState]);

  const handleCancel = useCallback(() => {
    dialogState.resolve(false);
    setDialogState({ ...dialogState, isOpen: false });
  }, [dialogState]);

  const ConfirmationDialog = useCallback(
    () => (
      <AlertDialog open={dialogState.isOpen} onOpenChange={(isOpen) => {
        if (!isOpen) handleCancel();
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogState.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {dialogState.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {dialogState.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
    [dialogState, handleCancel, handleConfirm]
  );

  return {
    confirm,
    ConfirmationDialog,
  };
} 