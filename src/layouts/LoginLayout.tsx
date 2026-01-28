import { Outlet } from "react-router-dom";
import FloatingLines from "../components/FloatingLine";

export default function LoginLayout() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
        `,
          backgroundSize: "60px 60px",
        }}
      /> */}
      <div className="absolute inset-0">
        <FloatingLines
          enabledWaves={["middle", "top", "bottom"]}
          lineCount={3}
          lineDistance={5}
          bendRadius={5}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
}
