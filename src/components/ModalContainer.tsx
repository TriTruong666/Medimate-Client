/* eslint-disable react-hooks/set-state-in-effect */
import { useAtom } from "jotai";
import { IndexDocumentModal, UploadDocumentModal } from "./Modal";
import { closeModalAtom, modalAtom } from "../stores/modalStore";
import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useState } from "react";

const MODAL_MAP = {
  upload: UploadDocumentModal,
  index: IndexDocumentModal,
};

export default function ModalContainer() {
  const [modalKey] = useAtom(modalAtom);
  const [, closeModal] = useAtom(closeModalAtom);
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);
  const ModalComponent = modalKey ? MODAL_MAP[modalKey] : null;
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
            {ModalComponent && <ModalComponent />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
