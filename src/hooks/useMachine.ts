import { useState, useEffect } from "react";
import type { Machine, MachineType } from "../types";
import { machineConfig } from "../constants/machine";

export const useMachine = (initialType?: MachineType) => {
  const [machine, setMachine] = useState<Machine>(() => {
    const savedType = (localStorage.getItem("winbet_machine_type") as MachineType) || initialType || "smart-pc";
    const savedName = localStorage.getItem("winbet_machine_name");
    const baseConfig = savedType === "terminal" ? machineConfig.terminal : machineConfig.smartPc;
    
    return {
      ...baseConfig,
      name: savedName || baseConfig.name,
      type: savedType,
    };
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const updateBalance = (newBalance: number) => {
    setMachine((prev) => ({
      ...prev,
      balance: newBalance,
    }));
  };

  const addBalance = (amount: number) => {
    setMachine((prev) => ({
      ...prev,
      balance: prev.balance + amount,
    }));
  };

  const selectMachineType = (type: MachineType) => {
    const config = type === "terminal" ? machineConfig.terminal : machineConfig.smartPc;
    setMachine({
      ...config,
      type,
    });
    localStorage.setItem("winbet_machine_type", type);
    localStorage.setItem("winbet_machine_name", config.name);
  };

  useEffect(() => {
    if (initialType && initialType !== machine.type) {
      selectMachineType(initialType);
    }
  }, [initialType]);

  return {
    machine,
    updateBalance,
    addBalance,
    selectMachineType,
    toastMessage,
    showToast,
  };
};
