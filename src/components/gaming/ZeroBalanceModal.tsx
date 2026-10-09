import React from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";

interface ZeroBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName?: string;
  machineName?: string;
}

export const ZeroBalanceModal: React.FC<ZeroBalanceModalProps> = ({
  isOpen,
  onClose,
  shopName: _shopName,
  machineName: _machineName = "Smart PC",
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="410px">
      <div className="modal-body p-4 text-center">
        {/* Step Pill */}
        <div className="step-pill-box justify-content-center mb-3">
          <span className="pill-text fw-bold text-warning">
            <i className="fa-solid fa-coins me-1"></i> Station Balance Alert
          </span>
        </div>

        {/* 3D Glowing Animated Coin Icon */}
        <div className="d-flex justify-content-center mb-3">
          <div
            style={{
              width: "78px",
              height: "78px",
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 30%, #fbbf24 0%, #d97706 65%, #78350f 100%)",
              border: "2.5px solid #fde68a",
              boxShadow: "0 0 35px rgba(245, 179, 0, 0.75), inset 0 2px 6px rgba(255, 255, 255, 0.7)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "2.1rem",
              animation: "pulse3DGlow 2.5s infinite alternate ease-in-out",
            }}
          >
            <i className="fa-solid fa-hand-holding-dollar"></i>
          </div>
        </div>

        {/* Inner Zero Balance Panel */}
        <div
          className="p-3 rounded-3 mb-3 text-center"
          style={{
            background: "radial-gradient(circle at 50% 0%, #200c40 0%, #0d031c 100%)",
            border: "1.5px solid rgba(245, 179, 0, 0.4)",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(245, 179, 0, 0.1)",
          }}
        >
          <p className="text-secondary small text-uppercase mb-1" style={{ fontSize: "0.74rem", letterSpacing: "0.5px" }}>
            Current Balance
          </p>
          <div className="fs-2 fw-bold text-light mb-2">
            <span className="currency-symbol text-warning me-1">N$</span>
            <span>0.00</span>
          </div>

          <div
            className="p-2 rounded-2 text-start small mb-1"
            style={{ background: "rgba(94, 23, 187, 0.25)", border: "1px solid rgba(168, 85, 247, 0.2)" }}
          >
            <div className="d-flex align-items-start gap-2 text-light" style={{ fontSize: "0.82rem" }}>
              <i className="fa-solid fa-cash-register text-warning mt-1"></i>
              <div>
                <span>Please visit the </span>
                <strong className="text-warning">Cashier Desk</strong>
                <span> to load coins </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-dim small mb-3" style={{ fontSize: "0.78rem" }}>
          Once coins are loaded by the cashier, your balance will update instantly.
        </p>

        {/* Action Button */}
        <div className="d-flex flex-column gap-2">
          <Button variant="gold" onClick={onClose} className="w-100 py-2 fw-bold text-dark">
            <i className="fa-solid fa-circle-check me-1"></i> Understood, Visit Cashier
          </Button>
        </div>
      </div>
    </Modal>
  );
};
