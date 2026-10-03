import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GamingLayout } from "../../components/layout/GamingLayout";
import { GameGrid } from "../../components/gaming/GameGrid";
import { TicketConfirmModal } from "../../components/gaming/TicketConfirmModal";
import { TicketSuccess } from "../../components/gaming/TicketSuccess";
import { useMachine } from "../../hooks/useMachine";
import { generateTicketNumber } from "../../utils/formatCurrency";

export const TerminalCashOut: React.FC = () => {
  const navigate = useNavigate();
  const { machine, updateBalance, selectMachineType, toastMessage, showToast } =
    useMachine("terminal");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(true);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("TKT-88421");
  const [printedAmount, setPrintedAmount] = useState(170.0);

  const handleClose = () => {
    setIsConfirmModalOpen(false);
    navigate("/terminal");
  };

  const handleConfirmPrint = () => {
    const tktNum = generateTicketNumber();
    const amt = machine.balance || 170.0;
    setTicketNumber(tktNum);
    setPrintedAmount(amt);
    setIsConfirmModalOpen(false);

    setTimeout(() => {
      setIsSuccessModalOpen(true);
      showToast(`Ticket ${tktNum} Printed Successfully!`);
    }, 300);
  };

  const handleBackToGames = () => {
    setIsSuccessModalOpen(false);
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
        balance={machine.balance}
        actionText="Print Cashout Ticket"
        onPrimaryAction={() => setIsConfirmModalOpen(true)}
        onToggleMachineType={selectMachineType}
        toastMessage={toastMessage}
      >
        <GameGrid
          machineType="terminal"
          balance={machine.balance}
          onBalanceChange={updateBalance}
          showToast={showToast}
        />
      </GamingLayout>

      <TicketConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleClose}
        onConfirmPrint={handleConfirmPrint}
        amount={machine.balance || 170.0}
      />

      <TicketSuccess
        isOpen={isSuccessModalOpen}
        onClose={handleClose}
        ticketNumber={ticketNumber}
        amount={printedAmount}
        onBackToGames={handleBackToGames}
      />
    </>
  );
};
