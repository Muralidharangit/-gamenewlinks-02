import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GamingLayout } from "../../components/layout/GamingLayout";
import { GameGrid } from "../../components/gaming/GameGrid";
import { CashOutModal } from "../../components/gaming/CashOutModal";
import { ZeroBalanceModal } from "../../components/gaming/ZeroBalanceModal";
import { useMachine } from "../../hooks/useMachine";

export const SmartPCCashOut: React.FC = () => {
  const navigate = useNavigate();
  const { machine, updateBalance, selectMachineType, toastMessage, showToast, clearToast } =
    useMachine("smart-pc");
  const [isModalOpen, setIsModalOpen] = useState(machine.balance > 0);
  const [isZeroBalanceOpen, setIsZeroBalanceOpen] = useState(machine.balance <= 0);

  const handleClose = () => {
    setIsModalOpen(false);
    setIsZeroBalanceOpen(false);
    navigate("/smart-pc");
  };

  const handleConfirm = () => {
    const cashoutAmount = machine.balance;
    updateBalance(0.0);
    setIsModalOpen(false);
    showToast(
      `Cash Out of N$ ${cashoutAmount.toFixed(2)} confirmed! Cashier will redeem at counter.`
    );
    navigate("/smart-pc");
  };

  return (
    <>
      <GamingLayout
        machineType="smart-pc"
        machineName={machine.name || "Smart PC-03"}
        shopName={machine.shopName}
        shopLocation={machine.location}
        balance={machine.balance}
        actionText="Cash Out"
        onPrimaryAction={() => {
          if (machine.balance <= 0) {
            setIsZeroBalanceOpen(true);
          } else {
            setIsModalOpen(true);
          }
        }}
        onToggleMachineType={selectMachineType}
        toastMessage={toastMessage}
        onDismissToast={clearToast}
      >
        <GameGrid
          machineType="smart-pc"
          machineName={machine.name || "Smart PC-03"}
          shopName={machine.shopName}
          balance={machine.balance}
          onBalanceChange={updateBalance}
          showToast={showToast}
          onZeroBalance={() => setIsZeroBalanceOpen(true)}
        />
      </GamingLayout>

      <ZeroBalanceModal
        isOpen={isZeroBalanceOpen}
        onClose={handleClose}
        shopName={machine.shopName}
        machineName={machine.name}
      />

      <CashOutModal
        isOpen={isModalOpen && machine.balance > 0}
        onClose={handleClose}
        onConfirm={handleConfirm}
        amount={machine.balance}
      />
    </>
  );
};
