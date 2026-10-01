import React, { useState } from "react";
import { GamingLayout } from "../../components/layout/GamingLayout";
import { GameGrid } from "../../components/gaming/GameGrid";
import { CashOutModal } from "../../components/gaming/CashOutModal";
import { ValidationModals } from "../../components/gaming/ValidationModals";
import { HardwareSimulatorBar } from "../../components/gaming/HardwareSimulatorBar";
import { useMachine } from "../../hooks/useMachine";
import type { ValidationAlertType } from "../../types";

export const SmartPCLobby: React.FC = () => {
  const { machine, updateBalance, addBalance, selectMachineType, toastMessage, showToast } =
    useMachine("smart-pc");

  // Step 4 Cash Out Confirm Modal
  const [isCashoutModalOpen, setIsCashoutModalOpen] = useState(false);

  // Validation / Queue Alerts (05 Pending, 06 Rejected, 06 Low Shop Balance, Approved)
  const [activeAlert, setActiveAlert] = useState<ValidationAlertType>("NONE");
  const [pendingCashoutAmount, setPendingCashoutAmount] = useState<number>(0);

  // Step 3 -> 4: Open Cash Out Confirm Modal
  const handleOpenCashout = () => {
    if (machine.balance <= 0) {
      showToast("Session balance is N$ 0.00. No funds to cash out.");
      return;
    }
    setIsCashoutModalOpen(true);
  };

  // Step 4 -> 5: Player confirms Cash Out -> Balance goes to 0.00, goes into Pending desk queue
  const handleConfirmCashout = () => {
    const cashoutAmount = machine.balance;
    setPendingCashoutAmount(cashoutAmount);
    updateBalance(0.0);
    setIsCashoutModalOpen(false);

    // Screen 05: Cash Out Pending
    setActiveAlert("CASHOUT_PENDING");
    showToast(`Cash Out of N$ ${cashoutAmount.toFixed(2)} requested! Waiting for cashier...`);
  };

  // Back Office Cashier Approves Cash Out
  const handleCashierApprove = () => {
    setActiveAlert("CASHOUT_APPROVED");
    showToast(`Cashier approved! N$ ${pendingCashoutAmount.toFixed(2)} paid in cash.`);
  };

  // Back Office Cashier Rejects Cash Out -> Screen 06: Credits Restored
  const handleCashierReject = () => {
    const restoredAmt = pendingCashoutAmount || 250.0;
    updateBalance(restoredAmt);
    setActiveAlert("CASHOUT_REJECTED");
    showToast(`Cash Out rejected by cashier. N$ ${restoredAmt.toFixed(2)} restored to Smart PC.`);
  };

  // Simulator Triggers
  const handleAddBalance = (amount: number, noteMessage: string) => {
    addBalance(amount);
    showToast(noteMessage);
  };

  const handleTriggerAlert = (type: ValidationAlertType, customAmount?: number) => {
    const amt = customAmount !== undefined ? customAmount : (machine.balance || 250);
    setPendingCashoutAmount(amt);

    if (type === "CASHOUT_REJECTED") {
      // Restore credits to Smart PC
      if (machine.balance === 0) {
        updateBalance(amt);
      }
    }

    setActiveAlert(type);
  };

  const handleCloseAlert = () => {
    setActiveAlert("NONE");
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
        onPrimaryAction={handleOpenCashout}
        onToggleMachineType={selectMachineType}
        toastMessage={toastMessage}
      >
        <GameGrid
          balance={machine.balance}
          onBalanceChange={updateBalance}
          showToast={showToast}
        />
      </GamingLayout>

      {/* Hardware & Desk Simulator Bar (Pure Web Testing) */}
      <HardwareSimulatorBar
        machineType="smart-pc"
        balance={machine.balance}
        onAddBalance={handleAddBalance}
        onTriggerAlert={handleTriggerAlert}
        onOpenCashoutFlow={handleOpenCashout}
      />

      {/* Smart PC Step 4: Cash Out Confirmation Modal */}
      <CashOutModal
        isOpen={isCashoutModalOpen}
        onClose={() => setIsCashoutModalOpen(false)}
        onConfirm={handleConfirmCashout}
        amount={machine.balance}
      />

      {/* Smart PC Step 5 (Pending), Step 6 (Rejected), Approved, Shop Balance Low */}
      <ValidationModals
        alertType={activeAlert}
        isOpen={activeAlert !== "NONE"}
        onClose={handleCloseAlert}
        amount={pendingCashoutAmount}
        onSimulateApprove={handleCashierApprove}
        onSimulateReject={handleCashierReject}
      />
    </>
  );
};
