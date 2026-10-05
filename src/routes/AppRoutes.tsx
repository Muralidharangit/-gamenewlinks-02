import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Registration } from "../pages/Registration/Registration";
import { RegistrationSuccess } from "../pages/RegistrationSuccess/RegistrationSuccess";
import { SmartPCLobby } from "../pages/SmartPC/SmartPCLobby";
import { SmartPCCashOut } from "../pages/SmartPC/SmartPCCashOut";
import { GamePlayPage } from "../pages/SmartPC/GamePlayPage";
import { TerminalLobby } from "../pages/Terminal/TerminalLobby";
import { TerminalCashOut } from "../pages/Terminal/TerminalCashOut";
import { TicketSuccess } from "../pages/Terminal/TicketSuccess";
import { NotAuthorized } from "../pages/NotAuthorized/NotAuthorized";

import { TerminalLogin, TerminalRegistration } from "../pages/Terminal/TerminalLogin";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/register" replace />} />

      {/* Smart PC Registration & Login Flow */}
      <Route path="/register" element={<Registration defaultMachineType="smart-pc" />} />
      <Route path="/smart-pc/register" element={<Registration defaultMachineType="smart-pc" />} />
      <Route path="/smart-pc/login" element={<Registration defaultMachineType="smart-pc" />} />
      <Route path="/register/smart-pc" element={<Registration defaultMachineType="smart-pc" />} />

      {/* Terminal Registration & Login Flow */}
      <Route path="/terminal/login" element={<TerminalLogin />} />
      <Route path="/terminal/register" element={<TerminalRegistration />} />
      <Route path="/terminal-login" element={<TerminalLogin />} />
      <Route path="/terminal-register" element={<TerminalRegistration />} />
      <Route path="/register/terminal" element={<TerminalRegistration />} />

      <Route path="/register/success" element={<RegistrationSuccess />} />

      {/* Security / Unbind */}
      <Route path="/not-authorized" element={<NotAuthorized />} />

      {/* Smart PC Flow */}
      <Route path="/smart-pc" element={<SmartPCLobby />} />
      <Route path="/smart-pc/play/:gameId" element={<GamePlayPage />} />
      <Route path="/smart-pc/play" element={<GamePlayPage />} />
      <Route path="/play/:gameId" element={<GamePlayPage />} />
      <Route path="/smart-pc/cashout" element={<SmartPCCashOut />} />

      {/* Terminal Flow */}
      <Route path="/terminal" element={<TerminalLobby />} />
      <Route path="/terminal/play/:gameId" element={<GamePlayPage />} />
      <Route path="/terminal/cashout" element={<TerminalCashOut />} />
      <Route path="/terminal/ticket-success" element={<TicketSuccess />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  );
};

