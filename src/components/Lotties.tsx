import Lottie from "lottie-react";
import welcomeAnimation from "../assets/animations/Welcome.json";
export function WelcomeAnimation() {
  return (
    <div className="">
      <Lottie
        animationData={welcomeAnimation}
        loop={false}
        className="h-100 w-100"
      />
    </div>
  );
}
