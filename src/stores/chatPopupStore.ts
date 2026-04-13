import { atom } from "jotai";

export const chatPopupAtom = atom<string[]>([]);

// Lưu mapping sessionId -> expiredAt
export const chatSessionExpiryAtom = atom<Record<string, string | null>>({});

export const openPopupAtom = atom(
  null,
  (get, set, chatId: string, expiredAt?: string | null) => {
    const current = get(chatPopupAtom);
    const expiry = get(chatSessionExpiryAtom);

    if (current.includes(chatId)) return;

    // Lưu expiredAt vào mapping
    set(chatSessionExpiryAtom, { ...expiry, [chatId]: expiredAt || null });

    if (current.length >= 3) {
      set(chatPopupAtom, [...current.slice(1), chatId]);
      return;
    }

    set(chatPopupAtom, [...current, chatId]);
  },
);

export const closePopupAtom = atom(null, (get, set, chatId: string) => {
  const current = get(chatPopupAtom);
  const expiry = get(chatSessionExpiryAtom);

  // Xóa expiredAt khi close popup
  const newExpiry = { ...expiry };
  delete newExpiry[chatId];
  set(chatSessionExpiryAtom, newExpiry);

  set(
    chatPopupAtom,
    current.filter((id) => id !== chatId),
  );
});
