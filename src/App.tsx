import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import Lenis from "lenis";
import { AppRoutes } from "./routes/AppRoutes";
import { liveSocket } from "./services/socket";
import "./styles/theme.css";
import "./styles/global.css";
import "./styles/responsive.css";

export const App: React.FC = () => {
  useEffect(() => {
    liveSocket.init();
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    let animationFrameId: number;

    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;

