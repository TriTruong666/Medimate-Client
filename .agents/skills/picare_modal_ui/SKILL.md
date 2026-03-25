---
name: picare_modal_ui
description: "Guidelines and code templates for creating minimalist, high-end dark theme modals in Picare, utilizing Jotai for state management and Framer Motion for transitions."
---

# Picare Modal UI Guidelines

This skill dictates how to build and manage modals within the Picare OMS dashboard. Modals in Picare follow a unified state management pattern using **Jotai** and a centralized container.

## 📦 Architecture

Modals are managed via `src/stores/modalStore.ts`. To add a new modal:

1.  **Define a ModalKey**: Add your modal identifier to the `ModalKey` union type.
2.  **Create an Open Atom**: Create a setter atom using `atom(null, (_, set) => { set(modalAtom, "your_key"); })`.
3.  **Register in Container**: Add your modal component to `src/components/ModalContainer.tsx`.

## 🎨 Design Principles (Premium Dark)

- **Backdrop**: Deep black with high opacity (`bg-black/80`).
- **Container**: Minimalist dark background with glassmorphism (`bg-neutral-900/80 backdrop-blur-lg`).
- **Borders**: Thin, subtle white borders (`border-white/10`).
- **Typography**: Clean, high-contrast text for titles, muted gray for descriptions.

## 🏗️ Basic Modal Template

Use this structure for a consistent look and feel:

```tsx
import { useAtom } from "jotai";
import { HiOutlineX } from "react-icons/hi";
import { closeModalAtom } from "../../stores/modalStore";

export function CustomModal() {
  const [, closeModal] = useAtom(closeModalAtom);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/2 p-6 backdrop-blur-md">
        <h2 className="text-base font-semibold tracking-tight text-white">
          Title Here
        </h2>
        <button
          onClick={closeModal}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        <p className="text-sm text-gray-300">Description or content goes here.</p>
        
        {/* Info Box Pattern */}
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 flex gap-3">
           {/* Icon and Text */}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-white/10 bg-white/2 p-6 backdrop-blur-md">
        <button
          onClick={closeModal}
          className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          className="btn-primary px-6"
          onClick={() => {
            /* Action */
            closeModal();
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
```

## 🎞️ Animations

Modals are automatically animated by `ModalContainer.tsx` using `AnimatePresence`. 
- **Backdrop Overlay**: Fade in/out.
- **Content Card**: Scale + Fade + Spring transition.

## ⚖️ Best Practices

1.  **Context Atoms**: If your modal needs specific data (id, type), create a separate atom in `modalStore.ts` and set it within your "open" atom.
2.  **Backdrop Click**: The centralized `ModalContainer` handles closing on backdrop click. Use `e.stopPropagation()` on the modal content to prevent accidental closes.
3.  **Loading States**: Always show a `Spinner` inside the primary button when performing async actions.
4.  **Toasts**: Trigger success/error toasts *inside* the modal component before calling `closeModal()`.
