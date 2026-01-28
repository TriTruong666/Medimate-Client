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
};
