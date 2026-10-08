import React, { useEffect } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface ThemeNotificationModalProps {
  isOpen: boolean;
  message: string | null;
  title?: string;
  onClose: () => void;
  autoCloseDuration?: number; // in milliseconds (default 3500)
}

export const ThemeNotificationModal: React.FC<ThemeNotificationModalProps> = ({
  isOpen,
  message,
  title,
  onClose,
  autoCloseDuration = 3500,
}) => {
  useEffect(() => {
    if (!isOpen || !message) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [isOpen, message, autoCloseDuration, onClose]);

  if (!isOpen || !message) return null;

  // Determine notification tone & icon dynamically based on message content
  const lower = message.toLowerCase();
  let icon = "fa-solid fa-bell";
  let tone: "success" | "warning" | "danger" | "info" = "info";
  let displayTitle = title || "Station Notification";

  if (
    lower.includes("approved") ||
    lower.includes("loaded") ||
    lower.includes("success") ||
    lower.includes("enrolled") ||
    lower.includes("activated") ||
    lower.includes("+n$")
  ) {
    icon = "fa-solid fa-circle-check";
    tone = "success";
    if (!title) displayTitle = "Action Successful";
  } else if (
    lower.includes("insufficient") ||
    lower.includes("zero") ||
    lower.includes("0.00") ||
    lower.includes("warning") ||
    lower.includes("low")
  ) {
    icon = "fa-solid fa-triangle-exclamation";
    tone = "warning";
    if (!title) displayTitle = "Balance Notice";
  } else if (
    lower.includes("rejected") ||
    lower.includes("failed") ||
    lower.includes("error") ||
    lower.includes("invalid")
  ) {
    icon = "fa-solid fa-circle-xmark";
    tone = "danger";
    if (!title) displayTitle = "Notification";
  } else if (
    lower.includes("cash out") ||
    lower.includes("waiting") ||
    lower.includes("requested")
  ) {
    icon = "fa-solid fa-money-bill-wave";
    tone = "info";
    if (!title) displayTitle = "Cash Out Status";
  }

  // Gradients and glow settings
  const colorMap = {
    success: {
      grad: "radial-gradient(circle at 35% 30%, #34d399 0%, #059669 65%, #064e3b 100%)",
      border: "#6ee7b7",
      glow: "0 0 30px rgba(16, 185, 129, 0.7)",
      pillClass: "text-success border-success-subtle",
    },
    warning: {
      grad: "radial-gradient(circle at 35% 30%, #fbbf24 0%, #d97706 65%, #78350f 100%)",
      border: "#fde68a",
      glow: "0 0 30px rgba(245, 179, 0, 0.7)",
      pillClass: "text-warning border-warning-subtle",
    },
    danger: {
      grad: "radial-gradient(circle at 35% 30%, #f87171 0%, #dc2626 65%, #7f1d1d 100%)",
      border: "#fca5a5",
      glow: "0 0 30px rgba(239, 68, 68, 0.7)",
      pillClass: "text-danger border-danger-subtle",
    },
    info: {
      grad: "radial-gradient(circle at 35% 30%, #a78bfa 0%, #7c3aed 65%, #4c1d95 100%)",
      border: "#c4b5fd",
      glow: "0 0 30px rgba(139, 92, 246, 0.7)",
      pillClass: "text-info border-info-subtle",
    },
  };

  const styleConfig = colorMap[tone];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="400px">
      <div className="modal-body p-4 text-center">
        {/* Step/Header Pill */}
        <div className="step-pill-box justify-content-center mb-3">
          <span className={`pill-text fw-bold ${styleConfig.pillClass}`}>
            {displayTitle}
          </span>
        </div>

        {/* 3D Glowing Animated Icon */}
        <div className="d-flex justify-content-center mb-3">
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: styleConfig.grad,
              border: `2px solid ${styleConfig.border}`,
              boxShadow: styleConfig.glow,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "1.9rem",
              animation: "pulse3DGlow 2.5s infinite alternate ease-in-out",
            }}
          >
            <i className={icon}></i>
          </div>
        </div>

        {/* Themed Inner Notification Panel */}
        <div
          className="p-3 rounded-3 mb-3 text-center"
          style={{
            background: "radial-gradient(circle at 50% 0%, #220d43 0%, #0d031c 100%)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.5)",
          }}
        >
          <p className="text-light fw-semibold mb-0" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
            {message}
          </p>
        </div>

        {/* Dismiss Button */}
        <div className="mt-3">
          <Button variant="primary" onClick={onClose} className="w-100 py-2">
            <i className="fa-solid fa-check me-1"></i> Understood
          </Button>
        </div>
      </div>
    </Modal>
  );
};
