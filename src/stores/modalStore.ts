import { atom } from "jotai";

export type ModalKey =
  | "upload"
  | "index"
  | "add_account"
  | "preview_pdf"
  | null;

export const modalAtom = atom<ModalKey>(null);

export const pdfPreviewAtom = atom<string | null>(null);

export const openModalAtom = atom(null, (_, set, key: ModalKey) => {
  set(modalAtom, key);
});

// close modal
export const closeModalAtom = atom(null, (_, set) => {
  set(modalAtom, null);
  set(pdfPreviewAtom, null);
});

export const openPdfModalAtom = atom(null, (_, set, fileUrl: string) => {
  set(pdfPreviewAtom, fileUrl);
  set(modalAtom, "preview_pdf");
});
