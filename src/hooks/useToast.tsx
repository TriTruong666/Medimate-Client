import { toastStore } from "../stores/toastStore";

export const toast = {
  error(title: string, message: string, options = {}) {
    toastStore.push({
      title,
      message,
      type: "error",
      ...options,
    });
  },
  warn(title: string, message: string, options = {}) {
    toastStore.push({
      title,
      message,
      type: "warning",
      ...options,
    });
  },
  success(title: string, message: string, options = {}) {
    toastStore.push({
      title,
      message,
      type: "success",
      ...options,
    });
  },
  info(title: string, message: string, options = {}) {
    toastStore.push({
      title,
      message,
      type: "info",
      ...options,
    });
  },
};
