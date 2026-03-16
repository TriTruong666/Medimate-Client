import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicRoute from "./routes/publicRoute";
import PrivateRoute from "./routes/privateRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./hooks/useAuth";

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
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
