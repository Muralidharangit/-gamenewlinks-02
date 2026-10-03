import React, { useState } from "react";
import { GamingLayout } from "../../components/layout/GamingLayout";
import { GameGrid } from "../../components/gaming/GameGrid";
import { TicketConfirmModal } from "../../components/gaming/TicketConfirmModal";
import { TicketSuccess } from "../../components/gaming/TicketSuccess";
import { ValidationModals } from "../../components/gaming/ValidationModals";
import { HardwareSimulatorBar } from "../../components/gaming/HardwareSimulatorBar";
import { useMachine } from "../../hooks/useMachine";
import { generateTicketNumber } from "../../utils/formatCurrency";
import type { ValidationAlertType } from "../../types";

export const TerminalLobby: React.FC = () => {
  const { machine, updateBalance, addBalance, selectMachineType, toastMessage, showToast } =
    useMachine("terminal");

  // Step 4 & 5 Happy Path Modals
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("TKT-88421");
  const [printedAmount, setPrintedAmount] = useState(100.0);

  // Failure & Validation Alert Popups (06 - 11)
  const [activeAlert, setActiveAlert] = useState<ValidationAlertType>("NONE");
  const [alertAmount, setAlertAmount] = useState<number>(0);

  // Step 3 -> 4: Open Print Ticket Confirm
  const handleOpenPrintModal = () => {
    if (machine.balance <= 0) {
      showToast("Session balance is N$ 0.00. Please insert cash or scan a ticket.");
      return;
    }
    setIsConfirmModalOpen(true);
  };

  // Step 4 -> 5: Confirm Print Ticket (Happy Path)
  const handleConfirmPrintTicket = () => {
    const tktNum = generateTicketNumber();
    const amt = machine.balance;
    setTicketNumber(tktNum);
    setPrintedAmount(amt);
    setIsConfirmModalOpen(false);

    setTimeout(() => {
      setIsSuccessModalOpen(true);
      showToast(`Ticket ${tktNum} Printed Successfully!`);
    }, 300);
  };

  // Step 5: Back to Games -> Balance becomes 0.00
  const handleBackToGames = () => {
    setIsSuccessModalOpen(false);
    updateBalance(0.0);
    showToast("Ready for new session. Insert note into bill acceptor or scan ticket.");
  };

  // Hardware Simulation Handlers
  const handleAddBalance = (amount: number, noteMessage: string) => {
    addBalance(amount);
    showToast(noteMessage);
  };

  const handleTriggerAlert = (type: ValidationAlertType, customAmount?: number) => {
    const amt = customAmount !== undefined ? customAmount : machine.balance;
    setAlertAmount(amt);

    if (type === "PRINTER_FAILED") {
      // Screen 07: Ticket issued on server, print failed -> Credits restored to Terminal
      setIsConfirmModalOpen(false);
      // Ensure machine has balance restored
      if (machine.balance === 0 && amt > 0) {
        updateBalance(amt);
      }
    } else if (type === "PRINTER_REQUIRED") {
      // Screen 11: Printer required -> credits stay on terminal
      setIsConfirmModalOpen(false);
    }

    setActiveAlert(type);
  };

  const handleCloseAlert = () => {
    setActiveAlert("NONE");
  };

  return (
    <>
      <GamingLayout
        machineType="terminal"
        machineName={machine.name || "Terminal-02"}
        shopName={machine.shopName}
        shopLocation={machine.location}
        balance={machine.balance}
        actionText="Print Ticket"
        onPrimaryAction={handleOpenPrintModal}
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

      {/* Hardware & Validation Simulator Panel (Pure Web Testing) */}
      <HardwareSimulatorBar
        machineType="terminal"
        balance={machine.balance}
        onAddBalance={handleAddBalance}
        onTriggerAlert={handleTriggerAlert}
        onOpenCashoutFlow={handleOpenPrintModal}
      />

      {/* Terminal Step 4: Confirm Modal */}
      <TicketConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirmPrint={handleConfirmPrintTicket}
        amount={machine.balance}
      />

      {/* Terminal Step 5: Ticket Printed Success Modal */}
      <TicketSuccess
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        ticketNumber={ticketNumber}
        amount={printedAmount}
        onBackToGames={handleBackToGames}
      />

      {/* Terminal Failure / Alert Screens 06 - 11 */}
      <ValidationModals
        alertType={activeAlert}
        isOpen={activeAlert !== "NONE"}
        onClose={handleCloseAlert}
        amount={alertAmount}
        onRetry={() => {
          showToast("Retrying hardware interaction...");
        }}
      />
    </>
  );
};
