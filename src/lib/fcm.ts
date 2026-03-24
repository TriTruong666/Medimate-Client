import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
} from "firebase/messaging";

type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

let firebaseApp: FirebaseApp | null = null;

function getFirebaseConfig(): FirebaseWebConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  };
}

function getFirebaseApp(config: FirebaseWebConfig): FirebaseApp {
  if (!firebaseApp) {
    firebaseApp = initializeApp(config);
  }

  return firebaseApp;
}

async function registerMessagingServiceWorker(
  config: FirebaseWebConfig,
): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  const search = new URLSearchParams({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
    measurementId: config.measurementId ?? "",
  });

  return navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?${search.toString()}`,
  );
}

export async function getFCMToken(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }

  const config = getFirebaseConfig();
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

  if (!config || !vapidKey) {
    return null;
  }

  const messagingSupported = await isSupported();
  if (!messagingSupported) {
    return null;
  }

  if (Notification.permission === "denied") {
    return null;
  }

  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return null;
    }
  }

  try {
    const app = getFirebaseApp(config);
    const messaging = getMessaging(app);
    const serviceWorkerRegistration =
      await registerMessagingServiceWorker(config);

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: serviceWorkerRegistration ?? undefined,
    });

    return token || null;
  } catch {
    return null;
  }
}

export async function listenToForegroundMessages(
  onReceive: (payload: MessagePayload) => void,
): Promise<(() => void) | null> {
  const config = getFirebaseConfig();
  if (!config) {
    return null;
  }

  const messagingSupported = await isSupported();
  if (!messagingSupported) {
    return null;
  }

  const app = getFirebaseApp(config);
  const messaging = getMessaging(app);

  return onMessage(messaging, (payload) => {
    onReceive(payload);
  });
}
