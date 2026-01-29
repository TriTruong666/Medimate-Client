import { Outlet } from "react-router-dom";
import FloatingLines from "../components/FloatingLine";
import ColorBends from "../components/ColorBend";

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
          lineCount={4}
          lineDistance={10}
          bendRadius={10}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
        />
        {/* <ColorBends
          colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
          rotation={0}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.1}
          transparent
          autoRotate={0}
        /> */}
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
}
