import { atom } from "jotai";

export type ModalKey = "upload" | "index" | null;

export const modalAtom = atom<ModalKey>(null);

export const openModalAtom = atom(null, (_, set, key: ModalKey) => {
  set(modalAtom, key);
});

export const closeModalAtom = atom(null, (_, set) => {
  set(modalAtom, null);
});
