import React from "react";
import { Registration } from "../Registration/Registration";

export const TerminalLogin: React.FC = () => {
  return <Registration defaultMachineType="terminal" />;
};

export const TerminalRegistration: React.FC = () => {
  return <Registration defaultMachineType="terminal" />;
};

export default TerminalLogin;
