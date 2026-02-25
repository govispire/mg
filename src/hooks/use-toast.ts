
import { toast as sonnerToast, type ToasterProps } from "sonner";
import * as React from "react";

type ToastType = "default" | "success" | "info" | "warning" | "error" | "loading";

// Define our own ToastActionElement type since sonner doesn't export one
export type ToastActionElement = React.ReactNode;

export type ToastProps = {
  variant?: "default" | "destructive";
  type?: "foreground" | "background"; // This aligns with shadcn Toast component
};

export type ToastOptions = {
  title?: string;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
  duration?: number;
  type?: ToastType;
  id?: string;
};

// Define state for storing active toasts
export interface Toast {
  id: string;
  title?: string;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
  duration?: number;
}

// Create a set to track active toast IDs
let toastIds = new Set<string | number>();
let activeToasts = new Map<string | number, Toast>();

// This function will be used to store and get active toasts
const useToasts = () => {
  return {
    toasts: Array.from(activeToasts.values()),
    toast,
  };
};

export const useToast = useToasts;

export function toast({
  title,
  description,
  action,
  variant,
  type = "default",
  ...props
}: ToastOptions) {
  const options: any = {
    ...props,
    className: variant === "destructive" ? "destructive" : "",
  };

  if (action) {
    options.action = action;
  }

  let toastId;

  switch (type) {
    case "success":
      toastId = sonnerToast.success(title, {
        description,
        ...options,
      });
      break;
    case "info":
      toastId = sonnerToast.info(title, {
        description,
        ...options,
      });
      break;
    case "warning":
      toastId = sonnerToast.warning(title, {
        description,
        ...options,
      });
      break;
    case "error":
      toastId = sonnerToast.error(title, {
        description,
        ...options,
      });
      break;
    case "loading":
      toastId = sonnerToast.loading(title, {
        description,
        ...options,
      });
      break;
    default:
      toastId = sonnerToast(title, {
        description,
        ...options,
      });
  }

  // Track the toast ID and details
  if (toastId) {
    const id = String(toastId);
    toastIds.add(id);
    activeToasts.set(id, {
      id,
      title,
      description,
      action,
      variant,
      duration: props.duration,
    });
    
    // Clean up the ID when the toast is dismissed
    setTimeout(() => {
      toastIds.delete(id);
      activeToasts.delete(id);
    }, props.duration || 5000);
  }

  return toastId;
}
