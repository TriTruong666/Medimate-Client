import { Outlet } from "react-router-dom";

export default function LoginLayout() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 90%, #000000 40%, #2b092b 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex justify-center items-center min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
