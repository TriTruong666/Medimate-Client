import { atom } from "jotai";

export const chatPopupAtom = atom<string[]>([]);

export const openPopupAtom = atom(null, (get, set, chatId: string) => {
  const current = get(chatPopupAtom);

  if (current.includes(chatId)) return;

  if (current.length >= 3) {
    set(chatPopupAtom, [...current.slice(1), chatId]);
    return;
  }

  set(chatPopupAtom, [...current, chatId]);
});

export const closePopupAtom = atom(null, (get, set, chatId: string) => {
  const current = get(chatPopupAtom);

  set(
    chatPopupAtom,
    current.filter((id) => id !== chatId),
  );
});
