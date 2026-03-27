/* eslint-disable react-hooks/set-state-in-effect */
import { useAtom } from "jotai";
import {
  AddAccountModal,
  CancelModal,
  DeleteModal,
  IndexDocumentModal,
  LockModal,
  PaymentQRModal,
  PreviewPdfModal,
  UnlockModal,
  UploadDocumentModal,
  ConfirmUpdateProfileModal,
} from "./modals";
import { closeModalAtom, modalAtom, paymentAtom } from "../stores/modalStore";
import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useState } from "react";

export default function ModalContainer() {
  const [modalKey] = useAtom(modalAtom);
  const [paymentData] = useAtom(paymentAtom);
  const [, closeModal] = useAtom(closeModalAtom);
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {modalKey && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-2xl"
          >
            {modalKey === "upload" && <UploadDocumentModal />}
            {modalKey === "index" && <IndexDocumentModal />}
            {modalKey === "add_account" && <AddAccountModal />}
            {modalKey === "preview_pdf" && <PreviewPdfModal />}
            {modalKey === "lock" && <LockModal />}
            {modalKey === "unlock" && <UnlockModal />}
            {modalKey === "cancel" && <CancelModal />}
            {modalKey === "delete" && <DeleteModal />}
            {modalKey === "confirm_update_profile" && <ConfirmUpdateProfileModal />}
            {modalKey === "transaction" && paymentData && (
              <PaymentQRModal {...paymentData} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
