import React from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import type { ValidationAlertType } from "../../types";
import { formatCurrency } from "../../utils/formatCurrency";

interface ValidationModalProps {
  alertType: ValidationAlertType;
  isOpen: boolean;
  onClose: () => void;
  amount?: number;
  onSimulateApprove?: () => void;
  onSimulateReject?: () => void;
  onRetry?: () => void;
}

export const ValidationModals: React.FC<ValidationModalProps> = ({
  alertType,
  isOpen,
  onClose,
  amount = 0,
  onSimulateApprove,
  onSimulateReject,
  onRetry,
}) => {
  if (!isOpen || alertType === "NONE") return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="420px">
      <div className="modal-body p-4 text-center">
        {/* =========================================================================
            SCREEN 06 (Terminal & Smart PC): Shop Balance Too Low
            ========================================================================= */}
        {alertType === "SHOP_BALANCE_TOO_LOW" && (
          <div>
            <div className="step-pill-box justify-content-center mb-3">
              <span className="pill-text fw-bold text-danger">Shop Balance Alert</span>
            </div>

            <div className="neon-alert-circle-wrap mb-3">
              <div
                className="neon-alert-circle"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 30%, #ff5252 0%, #b91c1c 65%, #7f1d1d 100%)",
                  border: "2.5px solid #fca5a5",
                  boxShadow: "0 0 35px rgba(239, 68, 68, 0.8), inset 0 2px 6px rgba(255, 255, 255, 0.8)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "2.2rem",
                  animation: "pulse3DGlow 2.5s infinite alternate ease-in-out"
                }}
              >
                <i className="fa-solid fa-vault"></i>
              </div>
            </div>

            <h3 className="success-text-heading text-danger mb-2" style={{ textShadow: "0 0 15px rgba(239, 68, 68, 0.6)" }}>
              Shop Balance Too Low
            </h3>

            <p className="text-light small mb-3" style={{ lineHeight: "1.5", fontSize: "0.85rem" }}>
              Shop balance is lower than the requested note or ticket amount.
              <br />
              <strong className="text-warning" style={{ fontSize: "0.95rem", display: "inline-block", marginTop: "4px" }}>Please contact the shop cashier.</strong>
            </p>

            <div
              className="p-3 mb-4 rounded border text-start small"
              style={{
                background: "radial-gradient(circle at 50% 0%, #3f1010 0%, #1a0505 100%)",
                borderColor: "rgba(239, 68, 68, 0.5)",
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(239, 68, 68, 0.15)",
                fontSize: "0.82rem",
              }}
            >
              <div className="d-flex justify-content-between text-secondary mb-2">
                <span>Machine Credits:</span>
                <span className="text-light fw-bold bg-dark px-2 py-1 rounded border border-secondary" style={{fontSize: "0.75rem"}}>Unchanged</span>
              </div>
              <div className="d-flex justify-content-between align-items-center text-secondary">
                <span>Rule:</span>
                <span className="text-warning fw-bold"><i className="fa-solid fa-scale-unbalanced text-danger me-1"></i> Shop Balance ≥ Required</span>
              </div>
            </div>

            <div className="d-flex flex-column gap-2 mt-2">
              <Button variant="danger" onClick={onClose} icon="fa-solid fa-check">
                Understood
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 07 (Terminal): Printer Failed / Cashout Cancelled
            ========================================================================= */}
        {alertType === "PRINTER_FAILED" && (
          <div>
            <div className="step-pill-box justify-content-center mb-3">
              <span className="badge-circle bg-danger text-white">07</span>
              <span className="pill-text fw-bold text-danger">Print Failure</span>
            </div>

            <div className="neon-alert-circle-wrap mb-3">
              <div
                className="neon-alert-circle"
                style={{
                  width: "74px",
                  height: "74px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 30%, #ef4444 0%, #991b1b 65%, #450a0a 100%)",
                  border: "2px solid #fca5a5",
                  boxShadow: "0 0 30px rgba(239, 68, 68, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.6)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "1.9rem",
                }}
              >
                <i className="fa-solid fa-print"></i>
              </div>
            </div>

            <h3 className="success-text-heading text-danger mb-2">Cash-out Cancelled</h3>

            <p className="text-light small mb-3">
              Ticket was issued on server, but paper printing failed on the receipt printer.
            </p>

            <div
              className="p-3 mb-3 rounded border text-center"
              style={{
                background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(6, 78, 59, 0.15) 100%)",
                borderColor: "rgba(16, 185, 129, 0.5)",
                boxShadow: "0 0 20px rgba(16, 185, 129, 0.25)",
              }}
            >
              <span className="badge bg-success text-dark fw-bold mb-1" style={{ fontSize: "0.72rem" }}>
                FUNDS RESTORED
              </span>
              <div className="fw-bold fs-4 text-success" style={{ textShadow: "0 0 10px rgba(16, 185, 129, 0.5)" }}>
                +{formatCurrency(amount)}
              </div>
              <div className="text-light small" style={{ fontSize: "0.76rem" }}>
                Credits have been returned to this Terminal session.
              </div>
            </div>

            <div className="d-flex flex-column gap-2 mt-2">
              <Button variant="primary" onClick={onClose} icon="fa-solid fa-arrow-rotate-left">
                Back to Games
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 08 (Terminal): Note Not Accepted (Bill Acceptor Rejected)
            ========================================================================= */}
        {alertType === "NOTE_NOT_ACCEPTED" && (
          <div>
            <div className="step-pill-box justify-content-center mb-3">
              <span className="badge-circle bg-warning text-dark">08</span>
              <span className="pill-text fw-bold text-warning">Bill Acceptor</span>
            </div>

            <div className="neon-alert-circle-wrap mb-3">
              <div
                className="neon-alert-circle"
                style={{
                  width: "74px",
                  height: "74px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 30%, #f5b300 0%, #b45309 65%, #451a03 100%)",
                  border: "2px solid #fde68a",
                  boxShadow: "0 0 30px rgba(245, 179, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.7)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "1.9rem",
                }}
              >
                <i className="fa-solid fa-money-bill-transfer"></i>
              </div>
            </div>

            <h3 className="success-text-heading text-warning mb-2">Cash Not Accepted</h3>

            <p className="text-light small mb-3">
              The bill acceptor could not accept the note. Please smooth the bill and re-insert, try another note, or see the cashier.
            </p>

            <div
              className="p-2 mb-3 rounded border text-start small"
              style={{
                background: "rgba(245, 179, 0, 0.1)",
                borderColor: "rgba(245, 179, 0, 0.4)",
                fontSize: "0.78rem",
              }}
            >
              <div className="d-flex justify-content-between text-secondary">
                <span>Machine Credits:</span>
                <span className="text-light fw-bold">Unchanged</span>
              </div>
              <div className="d-flex justify-content-between text-secondary">
                <span>Acceptor Status:</span>
                <span className="text-warning">Ready for retry</span>
              </div>
            </div>

            <div className="d-flex flex-column gap-2 mt-2">
              <Button
                variant="primary"
                onClick={() => {
                  onClose();
                  if (onRetry) onRetry();
                }}
                icon="fa-solid fa-rotate"
              >
                Try Again
              </Button>
              <Button variant="cancel" onClick={onClose} icon="fa-solid fa-xmark">
                Close
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 09 (Terminal): Scan Again (Barcode scanner waking up / partial)
            ========================================================================= */}
        {alertType === "SCAN_AGAIN" && (
          <div>
            <div className="step-pill-box justify-content-center mb-3">
              <span className="badge-circle bg-info text-dark">09</span>
              <span className="pill-text fw-bold text-info">Scanner Alert</span>
            </div>

            <div className="neon-alert-circle-wrap mb-3">
              <div
                className="neon-alert-circle"
                style={{
                  width: "74px",
                  height: "74px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 30%, #0ea5e9 0%, #0369a1 65%, #082f49 100%)",
                  border: "2px solid #bae6fd",
                  boxShadow: "0 0 30px rgba(14, 165, 233, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.7)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "1.9rem",
                }}
              >
                <i className="fa-solid fa-barcode"></i>
              </div>
            </div>

            <h3 className="success-text-heading text-info mb-2">Scan Again</h3>

            <p className="text-light small mb-3">
              The barcode scanner was waking up or the barcode was only partially read. Please re-scan your ticket barcode.
            </p>

            <div
              className="p-2 mb-3 rounded border text-start small"
              style={{
                background: "rgba(14, 165, 233, 0.1)",
                borderColor: "rgba(14, 165, 233, 0.4)",
                fontSize: "0.78rem",
              }}
            >
              <div className="d-flex justify-content-between text-secondary">
                <span>Machine Credits:</span>
                <span className="text-light fw-bold">Unchanged</span>
              </div>
              <div className="d-flex justify-content-between text-secondary">
                <span>Scanner Device:</span>
                <span className="text-info">Ready for scan</span>
              </div>
            </div>

            <div className="d-flex flex-column gap-2 mt-2">
              <Button
                variant="primary"
                onClick={() => {
                  onClose();
                  if (onRetry) onRetry();
                }}
                icon="fa-solid fa-barcode"
              >
                Scan Ticket Again
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 10 (Terminal): Ticket Not Accepted (Bad / used / invalid ticket)
            ========================================================================= */}
        {alertType === "TICKET_NOT_ACCEPTED" && (
          <div>
            <div className="step-pill-box justify-content-center mb-3">
              <span className="badge-circle bg-danger text-white">10</span>
              <span className="pill-text fw-bold text-danger">Invalid Ticket</span>
            </div>

            <div className="neon-alert-circle-wrap mb-3">
              <div
                className="neon-alert-circle"
                style={{
                  width: "74px",
                  height: "74px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 30%, #ef4444 0%, #991b1b 65%, #450a0a 100%)",
                  border: "2px solid #fca5a5",
                  boxShadow: "0 0 30px rgba(239, 68, 68, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.6)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "1.9rem",
                }}
              >
                <i className="fa-solid fa-ban"></i>
              </div>
            </div>

            <h3 className="success-text-heading text-danger mb-2">Ticket Not Accepted</h3>

            <p className="text-light small mb-3">
              The scanned ticket is invalid, already redeemed, expired, or belongs to another shop.
            </p>

            <div
              className="p-2 mb-3 rounded border text-start small"
              style={{
                background: "rgba(239, 68, 68, 0.12)",
                borderColor: "rgba(239, 68, 68, 0.4)",
                fontSize: "0.78rem",
              }}
            >
              <div className="d-flex justify-content-between text-secondary">
                <span>Machine Credits:</span>
                <span className="text-light fw-bold">Unchanged</span>
              </div>
              <div className="d-flex justify-content-between text-secondary">
                <span>Validation Result:</span>
                <span className="text-danger">REJECTED / USED</span>
              </div>
            </div>

            <div className="d-flex flex-column gap-2 mt-2">
              <Button variant="primary" onClick={onClose} icon="fa-solid fa-check">
                Close
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 11 (Terminal): Printer Required (Printer disconnected/offline)
            ========================================================================= */}
        {alertType === "PRINTER_REQUIRED" && (
          <div>
            <div className="step-pill-box justify-content-center mb-3">
              <span className="badge-circle bg-warning text-dark">11</span>
              <span className="pill-text fw-bold text-warning">Printer Alert</span>
            </div>

            <div className="neon-alert-circle-wrap mb-3">
              <div
                className="neon-alert-circle"
                style={{
                  width: "74px",
                  height: "74px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 30%, #f5b300 0%, #b45309 65%, #451a03 100%)",
                  border: "2px solid #fde68a",
                  boxShadow: "0 0 30px rgba(245, 179, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.7)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "1.9rem",
                }}
              >
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
            </div>

            <h3 className="success-text-heading text-warning mb-2">Printer Required</h3>

            <p className="text-light small mb-3">
              Receipt printer is not connected or out of paper. No ticket was created.
              <br />
              <strong className="text-light">Credits stay on this Terminal.</strong>
            </p>

            <div
              className="p-2 mb-3 rounded border text-start small"
              style={{
                background: "rgba(245, 179, 0, 0.1)",
                borderColor: "rgba(245, 179, 0, 0.4)",
                fontSize: "0.78rem",
              }}
            >
              <div className="d-flex justify-content-between text-secondary">
                <span>Terminal Credits:</span>
                <span className="text-success fw-bold">Safe on Machine</span>
              </div>
              <div className="d-flex justify-content-between text-secondary">
                <span>Action:</span>
                <span className="text-warning">Connect printer & retry</span>
              </div>
            </div>

            <div className="d-flex flex-column gap-2 mt-2">
              <Button variant="primary" onClick={onClose} icon="fa-solid fa-check">
                OK
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 05 (Smart PC): Cash Out Pending (Waiting for Cashier)
            ========================================================================= */}
        {alertType === "CASHOUT_PENDING" && (
          <div>
            <div className="step-pill-box justify-content-center mb-3">
              <span className="pill-text fw-bold text-warning">Pending Desk Queue</span>
            </div>

            {/* Glowing Amber Pulse Circle */}
            <div className="neon-alert-circle-wrap mb-3">
              <div
                className="neon-alert-circle"
                style={{
                  width: "78px",
                  height: "78px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 30%, #f5b300 0%, #b45309 65%, #451a03 100%)",
                  border: "2.5px solid #fde68a",
                  boxShadow: "0 0 35px rgba(245, 179, 0, 0.7), inset 0 2px 5px rgba(255, 255, 255, 0.7)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "2rem",
                  animation: "cashout3DPulse 2.2s infinite ease-in-out",
                }}
              >
                <i className="fa-solid fa-hourglass-half fa-spin" style={{ animationDuration: "3s" }}></i>
              </div>
            </div>

            <h3 className="success-text-heading text-warning mb-2">Cash Out Pending</h3>

            <div
              className="p-3 mb-3 rounded border text-center position-relative overflow-hidden"
              style={{
                background: "radial-gradient(circle at 50% 0%, #1e0d3d 0%, #0e041f 100%)",
                borderColor: "rgba(245, 179, 0, 0.45)",
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(245, 179, 0, 0.1)",
              }}
            >
              <div className="text-secondary small text-uppercase fw-semibold mb-1" style={{ letterSpacing: "0.5px" }}>
                Requested Payout
              </div>
              <div className="fs-2 fw-bold text-warning" style={{ textShadow: "0 0 15px rgba(245, 179, 0, 0.5)" }}>
                {formatCurrency(amount)}
              </div>
              <div
                className="badge mt-2 px-3 py-1 rounded-pill"
                style={{
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(245, 179, 0, 0.3)",
                  color: "#fde68a",
                  fontSize: "0.74rem",
                }}
              >
                <i className="fa-solid fa-circle-notch fa-spin me-1 text-warning"></i> Machine Credits: N$ 0.00
              </div>
            </div>

            <p className="text-light small mb-3" style={{ lineHeight: "1.4" }}>
              Waiting for cashier at the desk to approve and pay cash.
              <br />
              <span className="text-secondary">Please proceed to the counter.</span>
            </p>

            {/* Back Office Cashier Simulator Controls */}
            <div
              className="p-3 mb-2 rounded border"
              style={{
                background: "rgba(30, 12, 60, 0.7)",
                borderColor: "rgba(168, 85, 247, 0.4)",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div className="text-dim small mb-2 text-start fw-semibold d-flex align-items-center gap-1" style={{ fontSize: "0.76rem" }}>
                <i className="fa-solid fa-desktop text-info"></i> Cashier Back Office Simulation:
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-success flex-grow-1 fw-bold py-2 d-inline-flex align-items-center justify-content-center gap-1"
                  style={{
                    fontSize: "0.78rem",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)",
                    border: "none",
                  }}
                  onClick={onSimulateApprove}
                >
                  <i className="fa-solid fa-check"></i> Cashier Approves
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger flex-grow-1 fw-bold py-2 d-inline-flex align-items-center justify-content-center gap-1"
                  style={{
                    fontSize: "0.78rem",
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.35)",
                    border: "none",
                  }}
                  onClick={onSimulateReject}
                >
                  <i className="fa-solid fa-xmark"></i> Cashier Rejects
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 06 (Smart PC): Cash Out Rejected by Cashier
            ========================================================================= */}
        {alertType === "CASHOUT_REJECTED" && (
          <div>
            <div className="step-pill-box justify-content-center mb-3">
              <span className="pill-text fw-bold text-danger">Cashier Action</span>
            </div>

            <div className="neon-alert-circle-wrap mb-4 text-center">
              <div
                className="neon-alert-circle"
                style={{
                  width: "84px",
                  height: "84px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 30%, #ff5252 0%, #b91c1c 65%, #7f1d1d 100%)",
                  border: "2.5px solid #fca5a5",
                  boxShadow: "0 0 35px rgba(239, 68, 68, 0.8), inset 0 2px 6px rgba(255, 255, 255, 0.8)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "2.4rem",
                  animation: "pulse3DGlow 2.5s infinite alternate ease-in-out"
                }}
              >
                <i className="fa-solid fa-ban"></i>
              </div>
            </div>

            <h3 className="card-heading text-danger text-center mb-2" style={{ textShadow: "0 0 15px rgba(239, 68, 68, 0.6)" }}>
              Cash-out Rejected
            </h3>

            <p className="text-light small text-center mb-4" style={{ lineHeight: "1.5", fontSize: "0.85rem" }}>
              Cashier rejected the cash out request in Back Office.
            </p>

            <div
              className="p-3 mb-4 rounded border text-center"
              style={{
                background: "radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(6, 78, 59, 0.15) 100%)",
                borderColor: "rgba(16, 185, 129, 0.5)",
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(16, 185, 129, 0.2)",
              }}
            >
              <span className="badge bg-success text-dark fw-bold px-2 py-1 mb-2" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                <i className="fa-solid fa-rotate-left me-1"></i> CREDITS RESTORED
              </span>
              <div className="fw-bold text-success mb-1" style={{ fontSize: "2.2rem", textShadow: "0 0 15px rgba(16, 185, 129, 0.6)" }}>
                +{formatCurrency(amount)}
              </div>
              <div className="text-light small" style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                Credits stay on this Smart PC so you can play again.
              </div>
            </div>

            <div className="d-flex flex-column gap-2 mt-2">
              <Button variant="primary" onClick={onClose} icon="fa-solid fa-gamepad">
                Back to Games
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================================
            Smart PC: Cash Out Approved by Cashier
            ========================================================================= */}
        {alertType === "CASHOUT_APPROVED" && (
          <div>
            <div className="neon-success-circle-wrap mb-3">
              <div className="neon-success-circle">
                <i className="fa-solid fa-check"></i>
              </div>
            </div>

            <h3 className="success-text-heading mb-2">Cash Paid at Desk</h3>

            <div
              className="p-3 mb-3 rounded border text-center"
              style={{
                background: "radial-gradient(circle at 50% 0%, #1e0d3d 0%, #0e041f 100%)",
                borderColor: "rgba(245, 179, 0, 0.45)",
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(245, 179, 0, 0.1)",
              }}
            >
              <div className="text-secondary small">Paid by Cashier</div>
              <div className="fs-3 fw-bold text-warning">{formatCurrency(amount)}</div>
            </div>

            <p className="text-light small mb-3">
              Cashier approved your request and paid cash. Session complete.
            </p>

            <div className="d-flex flex-column gap-2 mt-2">
              <Button variant="primary" onClick={onClose} icon="fa-solid fa-circle-check">
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
