import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import { liveSocket } from "./services/socket";
import { KeyboardLockProvider } from "./hooks/useKioskKeyboardLock";
import "./styles/theme.css";
import "./styles/global.css";
import "./styles/responsive.css";

export const App: React.FC = () => {
  useEffect(() => {
    liveSocket.init();
  }, []);

  return (
    <BrowserRouter>
      <KeyboardLockProvider>
        <AppRoutes />
      </KeyboardLockProvider>
    </BrowserRouter>
  );
};

export default App;
