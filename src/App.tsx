import { BrowserRouter } from "react-router-dom";
import PublicRoute from "./routes/publicRoute";
import PrivateRoute from "./routes/privateRoute";

export default function App() {
  return (
    <BrowserRouter>
      <PublicRoute />
      <PrivateRoute />
    </BrowserRouter>
  );
}
