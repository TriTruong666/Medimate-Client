import { WelcomeAnimation } from "./Lotties";

export default function Welcome() {
  return (
    <div className="bg-main-dark absolute z-9999 min-h-screen w-screen">
      <div className="flex items-center justify-center">
        <WelcomeAnimation />
      </div>
    </div>
  );
}
