import toast, { Toast } from "react-hot-toast";

// Custom toast with click-to-dismiss functionality
export const customToast = {
  success: (message: string, options?: any) => {
    return toast.success(message, {
      ...options,
      onClick: (t: Toast) => {
        toast.dismiss(t.id);
      },
    });
  },

  error: (message: string, options?: any) => {
    return toast.error(message, {
      ...options,
      onClick: (t: Toast) => {
        toast.dismiss(t.id);
      },
    });
  },

  loading: (message: string, options?: any) => {
    return toast.loading(message, {
      ...options,
      onClick: (t: Toast) => {
        toast.dismiss(t.id);
      },
    });
  },

  custom: (message: string, options?: any) => {
    return toast(message, {
      ...options,
      onClick: (t: Toast) => {
        toast.dismiss(t.id);
      },
    });
  },

  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss();
  },

  // Dismiss specific toast
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};

// Add global click handler for existing toasts
if (typeof window !== "undefined") {
  // Use a more reliable method to detect toast clicks
  let clickHandlerAdded = false;

  const addClickHandler = () => {
    if (clickHandlerAdded) return;

    document.addEventListener("click", (event) => {
      const target = event.target as Element;

      // Look for toast container elements
      const toastElement =
        target.closest('[role="status"]') ||
        target.closest("[data-hot-toast]") ||
        target.closest(".react-hot-toast > div");

      if (toastElement) {
        // Try to get toast ID from various possible attributes
        const toastId =
          toastElement.getAttribute("data-hot-toast") ||
          toastElement.getAttribute("data-toast-id") ||
          toastElement.id;

        if (toastId) {
          toast.dismiss(toastId);
        } else {
          // If no specific ID, dismiss the most recent toast
          toast.dismiss();
        }
      }
    });

    clickHandlerAdded = true;
  };

  // Add handler when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addClickHandler);
  } else {
    addClickHandler();
  }
}

export default customToast;
