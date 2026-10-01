import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Registration } from "../pages/Registration/Registration";
import { RegistrationSuccess } from "../pages/RegistrationSuccess/RegistrationSuccess";
import { SmartPCLobby } from "../pages/SmartPC/SmartPCLobby";
import { SmartPCCashOut } from "../pages/SmartPC/SmartPCCashOut";
import { TerminalLobby } from "../pages/Terminal/TerminalLobby";
import { TerminalCashOut } from "../pages/Terminal/TerminalCashOut";
import { TicketSuccess } from "../pages/Terminal/TicketSuccess";
import { NotAuthorized } from "../pages/NotAuthorized/NotAuthorized";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/register" replace />} />

      {/* Registration Flow */}
      <Route path="/register" element={<Registration />} />
      <Route path="/register/success" element={<RegistrationSuccess />} />

      {/* Security / Unbind */}
      <Route path="/not-authorized" element={<NotAuthorized />} />

      {/* Smart PC Flow */}
      <Route path="/smart-pc" element={<SmartPCLobby />} />
      <Route path="/smart-pc/cashout" element={<SmartPCCashOut />} />

      {/* Terminal Flow */}
      <Route path="/terminal" element={<TerminalLobby />} />
      <Route path="/terminal/cashout" element={<TerminalCashOut />} />
      <Route path="/terminal/ticket-success" element={<TicketSuccess />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  );
};

