import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GamingLayout } from "../../components/layout/GamingLayout";
import { GameGrid } from "../../components/gaming/GameGrid";
import { CashOutModal } from "../../components/gaming/CashOutModal";
import { useMachine } from "../../hooks/useMachine";

export const SmartPCCashOut: React.FC = () => {
  const navigate = useNavigate();
  const { machine, updateBalance, selectMachineType, toastMessage, showToast } =
    useMachine("smart-pc");
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    setIsModalOpen(false);
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
        onPrimaryAction={() => setIsModalOpen(true)}
        onToggleMachineType={selectMachineType}
        toastMessage={toastMessage}
      >
        <GameGrid
          machineType="smart-pc"
          machineName={machine.name || "Smart PC-03"}
          shopName={machine.shopName}
          balance={machine.balance}
          onBalanceChange={updateBalance}
          showToast={showToast}
        />
      </GamingLayout>

      <CashOutModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        amount={machine.balance}
      />
    </>
  );
};
