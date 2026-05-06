import { atom } from "jotai";

export type DrawerKey = "transaction_details" | null;

export const drawerAtom = atom<DrawerKey>(null);

export const openDrawerAtom = atom(null, (_, set, key: DrawerKey) => {
  set(drawerAtom, key);
});

export const closeDrawerAtom = atom(null, (_, set) => {
  set(drawerAtom, null);
});

// Store data for transaction detail drawer
export const transactionDetailIdAtom = atom<string | null>(null);

// Store raw data for payout detail drawer (doctor only)
export const payoutDetailDataAtom = atom<any | null>(null);
