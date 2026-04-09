import { atom } from "jotai";
import type { PaymentQRModalProps } from "../components/modals";

type LockType = "account" | "owner_package" | null;

type UnlockType = "account" | "owner_package" | null;

type CancelType = "owner_package" | null;

type DeleteType = "document" | null;

export type ModalKey =
  | "upload"
  | "index"
  | "add_account"
  | "preview_pdf"
  | "unlock"
  | "lock"
  | "cancel"
  | "delete"
  | "transaction"
  | "confirm_update_profile"
  | "process_rag"
  | null;

export const modalAtom = atom<ModalKey>(null);

export const userIdAtom = atom<string | null>(null);

export const pdfPreviewAtom = atom<string | null>(null);

export const paymentAtom = atom<PaymentQRModalProps | null>(null);

export const confirmSubmitDataAtom = atom<FormData | null>(null);

export const lockTypeAtom = atom<LockType>(null);

export const unlockTypeAtom = atom<UnlockType>(null);

export const cancelTypeAtom = atom<CancelType>(null);

export const deleteTypeAtom = atom<DeleteType>(null);

export const collectionIdAtom = atom<string | null>(null);

export const openModalAtom = atom(null, (_, set, key: ModalKey) => {
  set(modalAtom, key);
});

export const closeModalAtom = atom(null, (_, set) => {
  set(modalAtom, null);
  set(pdfPreviewAtom, null);
  set(lockTypeAtom, null);
  set(unlockTypeAtom, null);
  set(unlockTypeAtom, null);
  set(cancelTypeAtom, null);
  set(deleteTypeAtom, null);
  set(paymentAtom, null);
  set(confirmSubmitDataAtom, null);
});

export const openPdfModalAtom = atom(null, (_, set, fileUrl: string) => {
  set(pdfPreviewAtom, fileUrl);
  set(modalAtom, "preview_pdf");
});

export const openLockModalAtom = atom(null, (_, set, type: LockType, userId: string) => {
  set(userIdAtom, userId);
  set(lockTypeAtom, type);
  set(modalAtom, "lock");
});

export const openUnlockModalAtom = atom(null, (_, set, type: UnlockType, userId: string) => {
  set(userIdAtom, userId);
  set(unlockTypeAtom, type);
  set(modalAtom, "unlock");
});

export const openCancelModalAtom = atom(null, (_, set, type: CancelType) => {
  set(cancelTypeAtom, type);
  set(modalAtom, "cancel");
});

export const openDeleteModalAtom = atom(null, (_, set, type: DeleteType) => {
  set(deleteTypeAtom, type);
  set(modalAtom, "delete");
});

export const openTransactionModalAtom = atom(
  null,
  (_, set, data: PaymentQRModalProps) => {
    set(paymentAtom, data);
    set(modalAtom, "transaction");
  },
);

export const openConfirmUpdateProfileModalAtom = atom(null, (_, set, data: FormData) => {
  set(confirmSubmitDataAtom, data);
  set(modalAtom, "confirm_update_profile");
});

export const openIndexModalAtom = atom(null, (_, set, collectionId: string) => {
  set(collectionIdAtom, collectionId);
  set(modalAtom, "index");
});

export const openProcessRAGModalAtom = atom(
  null,
  (_, set, collectionId: string) => {
    set(collectionIdAtom, collectionId);
    set(modalAtom, "process_rag");
  },
);
