import React from "react";
import { formatCurrency } from "../../utils/formatCurrency";

interface BalanceDisplayProps {
  balance: number;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ balance }) => {
  return (
    <div className="balance-chip">
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
