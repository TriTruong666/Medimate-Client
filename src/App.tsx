import { BrowserRouter } from "react-router-dom";
import PublicRoute from "./routes/publicRoute";

export default function App() {
  return (
    <BrowserRouter>
      <PublicRoute />
    </BrowserRouter>
  );
}
