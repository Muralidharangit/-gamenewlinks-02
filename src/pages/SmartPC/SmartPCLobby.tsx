import React, { useState, useEffect, useCallback } from "react";
import { GamingLayout } from "../../components/layout/GamingLayout";
import { GameGrid } from "../../components/gaming/GameGrid";
import { CashOutModal } from "../../components/gaming/CashOutModal";
import { ValidationModals } from "../../components/gaming/ValidationModals";
import { HardwareSimulatorBar } from "../../components/gaming/HardwareSimulatorBar";
import { useMachine, CASHOUT_STATUS_EVENT } from "../../hooks/useMachine";
import { api } from "../../services/api";
import type { ValidationAlertType } from "../../types";

export const SmartPCLobby: React.FC = () => {
  const { machine, updateBalance, addBalance, selectMachineType, toastMessage, showToast } =
    useMachine("smart-pc");

  // Step 4 Cash Out Confirm Modal
  const [isCashoutModalOpen, setIsCashoutModalOpen] = useState(false);

  // Validation / Queue Alerts (05 Pending, 06 Rejected, 06 Low Shop Balance, Approved, Chips Loaded)
  const [activeAlert, setActiveAlert] = useState<ValidationAlertType>("NONE");
  const [pendingCashoutAmount, setPendingCashoutAmount] = useState<number>(0);
  const [loadedChipsAmount, setLoadedChipsAmount] = useState<number>(0);

  const syncSession = useCallback(() => {
    const machineId = api.getStoredMachineId();
    const fingerprint = api.getDeviceFingerprint();

    api
      .getSession(machineId, fingerprint)
      .then((session) => {
        if (session) {
          if (typeof session.current_balance === "number") {
            updateBalance(session.current_balance);
          }
          if (session.pending_cash_out && session.pending_cash_out.requested_amount) {
            setPendingCashoutAmount(session.pending_cash_out.requested_amount);
            // We intentionally do NOT set activeAlert("CASHOUT_PENDING") here 
            // so the popup only shows right after they click confirm, not on every page reload.
          }
        }
      })
      .catch(() => {});
  }, [updateBalance]);

  // 1. PDF Flow #2: Background Heartbeat (POST /smart-pcs/heartbeat - timer only, no button)
  useEffect(() => {
    const machineId = api.getStoredMachineId();
    const fingerprint = api.getDeviceFingerprint();

    const doHeartbeat = () => {
      api
        .sendHeartbeat(machineId, fingerprint)
        .then((res) => {
          if (res.data && typeof res.data.current_balance === "number") {
            updateBalance(res.data.current_balance);
          }
        })
        .catch(() => {});
    };

    // Initial heartbeat
    doHeartbeat();

    // Periodic heartbeat every 15 seconds to keep Smart PC ONLINE and sync balance
    const heartbeatTimer = setInterval(doHeartbeat, 15000);

    // Also sync on window focus (e.g. after returning from provider popout or iframe)
    window.addEventListener("focus", syncSession);

    return () => {
      clearInterval(heartbeatTimer);
      window.removeEventListener("focus", syncSession);
    };
  }, [updateBalance, syncSession]);

  // 2. PDF Flow #3: Initial Session Check (GET /smart-pcs/session)
  useEffect(() => {
    syncSession();
  }, [syncSession]);

  // 3. PDF Flow #7: Step 3 -> 4: Open Cash Out Confirm Modal
  const handleOpenCashout = () => {
    if (machine.balance <= 0) {
      showToast("Session balance is N$ 0.00. No funds to cash out.");
      return;
    }
    setIsCashoutModalOpen(true);
  };

  // 4. PDF Flow #7: Step 4 -> 5: Player confirms Cash Out (POST /cashout/request) -> Status = PENDING
  const handleConfirmCashout = async () => {
    const cashoutAmount = machine.balance;
    setPendingCashoutAmount(cashoutAmount);
    setIsCashoutModalOpen(false);

    try {
      await api.requestCashOut(cashoutAmount);
      updateBalance(0.0);

      // PDF Flow #7: Screen 05 Cash Out Pending (Waiting for Cashier in Shop panel)
      setActiveAlert("CASHOUT_PENDING");
      showToast(`Cash Out of N$ ${cashoutAmount.toFixed(2)} requested! Waiting for cashier...`);
    } catch {
      updateBalance(0.0);
      setActiveAlert("CASHOUT_PENDING");
    }
  };

  // 5. PDF Flow #7 / #8: Staff Cashier Approves Cash Out (Broadcast event: CASHOUT_APPROVED)
  const handleCashierApprove = async () => {
    await api.cashierApproveCashout();
    setActiveAlert("CASHOUT_APPROVED");
    showToast(`Cashier approved! N$ ${pendingCashoutAmount.toFixed(2)} paid in cash.`);
  };

  // 6. PDF Flow #7 / #8: Staff Cashier Rejects Cash Out (Broadcast event: CASHOUT_REJECTED -> Screen 06 Credits Restored)
  const handleCashierReject = async () => {
    const res = await api.cashierRejectCashout();
    const restoredAmt = res.restoredAmount || pendingCashoutAmount || 250.0;
    updateBalance(restoredAmt);
    setActiveAlert("CASHOUT_REJECTED");
    showToast(`Cash Out rejected by cashier. N$ ${restoredAmt.toFixed(2)} restored to Smart PC.`);
  };

  // 7. PDF Flow #5 / #8: Staff Cash-In (Load chips) (POST /terminals/load-coins -> Broadcast: LOAD_SUCCESS)
  const handleStaffLoadCoins = async (amount: number, noteMessage: string) => {
    const machineId = api.getStoredMachineId();
    await api.loadCoinsByStaff(machineId, amount);
    addBalance(amount);
    setLoadedChipsAmount(amount);
    setActiveAlert("CHIPS_LOADED");
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

  // Freeze scrolling when balance is zero
  useEffect(() => {
    if (machine.balance === 0) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [machine.balance]);

  // Listen to remote cashout events from admin
  useEffect(() => {
    const handleCashoutStatus = (e: Event) => {
      const customEvt = e as CustomEvent<{ status: string; amount: number }>;
      if (customEvt.detail.status === "REJECTED") {
        setPendingCashoutAmount(customEvt.detail.amount);
        setActiveAlert("CASHOUT_REJECTED");
      } else if (customEvt.detail.status === "APPROVED") {
        setActiveAlert("CASHOUT_APPROVED");
      }
    };
    window.addEventListener(CASHOUT_STATUS_EVENT, handleCashoutStatus);
    return () => {
      window.removeEventListener(CASHOUT_STATUS_EVENT, handleCashoutStatus);
    };
  }, []);

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
          machineType="smart-pc"
          machineName={machine.name || "Smart PC-03"}
          shopName={machine.shopName}
          balance={machine.balance}
          onBalanceChange={updateBalance}
          showToast={showToast}
          onOpenCashout={handleOpenCashout}
        />
      </GamingLayout>

      {/* Hardware & Desk Simulator Bar (Pure Web Testing of PDF Flow) */}
      {/* 
      <HardwareSimulatorBar
        machineType="smart-pc"
        balance={machine.balance}
        onAddBalance={handleStaffLoadCoins}
        onTriggerAlert={handleTriggerAlert}
        onOpenCashoutFlow={handleOpenCashout}
      /> 
      */}

      {/* Smart PC Step 4: Cash Out Confirmation Modal */}
      <CashOutModal
        isOpen={isCashoutModalOpen}
        onClose={() => setIsCashoutModalOpen(false)}
        onConfirm={handleConfirmCashout}
        amount={machine.balance}
      />

      {/* Smart PC Step 5 (Pending), Step 6 (Rejected), Approved, Chips Loaded, Shop Balance Low */}
      <ValidationModals
        alertType={activeAlert}
        isOpen={activeAlert !== "NONE"}
        onClose={handleCloseAlert}
        amount={activeAlert === "CHIPS_LOADED" ? loadedChipsAmount : pendingCashoutAmount}
        onSimulateApprove={handleCashierApprove}
        onSimulateReject={handleCashierReject}
      />
    </>
  );
};
