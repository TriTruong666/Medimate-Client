import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicRoute from "./routes/publicRoute";
import PrivateRoute from "./routes/privateRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard & Private pages */}
        <Route path="/dashboard/*" element={<PrivateRoute />} />

        {/* Auth & Public pages */}
        <Route path="/*" element={<PublicRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
