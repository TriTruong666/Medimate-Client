import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicRoute from "./routes/publicRoute";
import PrivateRoute from "./routes/privateRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./hooks/useAuth";
import { listenToForegroundMessages } from "@/lib/fcm";
import { toast } from "@/hooks/useToast";
import GlobalSSEHandler from "./components/GlobalSSEHandler";

export default function App() {
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    void listenToForegroundMessages((payload) => {
      const title = payload.notification?.title || "Thông báo mới";
      const message = payload.notification?.body || "Bạn vừa nhận thông báo.";
      toast.success(title, message);
    }).then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <QueryProvider>
      <AuthProvider>
        <GlobalSSEHandler />
        <GlobalSSEHandler clientId="all" />
        <BrowserRouter>
          <Routes>
            {/* Dashboard & Private pages */}
            <Route path="/dashboard/*" element={<PrivateRoute />} />

            {/* Auth & Public pages */}
            <Route path="/*" element={<PublicRoute />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
}

function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      {children}
    </QueryClientProvider>
  );
}
