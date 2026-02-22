import { AnimatePresence, motion } from "framer-motion";
import { drawerAtom, closeDrawerAtom } from "../stores/drawerStore";
import { useAtom } from "jotai";
import { TransactionDrawer } from "./Drawer";

export default function DrawerContainer() {
  const [drawerKey] = useAtom(drawerAtom);
  const [, closeDrawer] = useAtom(closeDrawerAtom);

  return (
    <AnimatePresence>
      {drawerKey && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeDrawer()}
            className="fixed inset-0 z-40 bg-black/80"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex shadow-2xl"
          >
            {drawerKey === "transaction_details" && <TransactionDrawer />}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
