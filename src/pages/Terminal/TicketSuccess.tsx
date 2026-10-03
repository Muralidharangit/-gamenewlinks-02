import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GamingLayout } from "../../components/layout/GamingLayout";
import { GameGrid } from "../../components/gaming/GameGrid";
import { TicketSuccess as TicketSuccessModal } from "../../components/gaming/TicketSuccess";
import { useMachine } from "../../hooks/useMachine";

export const TicketSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { machine, updateBalance, selectMachineType, toastMessage, showToast } =
    useMachine("terminal");

  const [isOpen, setIsOpen] = useState(true);

  const handleBackToGames = () => {
    setIsOpen(false);
    updateBalance(0.0);
    navigate("/terminal");
  };

  return (
    <>
      <GamingLayout
        machineType="terminal"
        machineName={machine.name || "Terminal-02"}
        shopName={machine.shopName}
        shopLocation={machine.location}
        balance={0.0}
        actionText="Print Cashout Ticket"
        onPrimaryAction={() => setIsOpen(true)}
        onToggleMachineType={selectMachineType}
        toastMessage={toastMessage}
      >
        <GameGrid
          machineType="terminal"
          balance={0.0}
          onBalanceChange={updateBalance}
          showToast={showToast}
        />
      </GamingLayout>

      <TicketSuccessModal
        isOpen={isOpen}
        onClose={handleBackToGames}
        ticketNumber="TKT-88421"
        amount={170.0}
        onBackToGames={handleBackToGames}
      />
    </>
  );
};
