import React from "react";
import { formatCurrency } from "../../utils/formatCurrency";

interface BalanceDisplayProps {
  balance: number;
  onClick?: () => void;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ balance, onClick }) => {
  return (
    <div
      className={`balance-chip ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={onClick ? (balance === 0 ? "Zero Balance - Click for details" : "Available Balance - Click to Cash Out") : undefined}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      <div>
        <span className="label">Balance</span>
        <div className="d-flex align-items-center gap-1">
          <span className="val" id="playerBalanceDisplay">
            {formatCurrency(balance)}
          </span>
        </div>
      </div>
    </div>
  );
};
