import React, { useState, useEffect } from "react";
import type { MachineType } from "../../types";
import { GamingHeader } from "./GamingHeader";
import { ShopLocation } from "./ShopLocation";

interface GamingLayoutProps {
  machineType: MachineType;
  machineName: string;
  shopName: string;
  shopLocation?: string;
  balance: number;
  actionText: string;
  onPrimaryAction: () => void;
  onToggleMachineType?: (type: MachineType) => void;
  toastMessage?: string | null;
  children: React.ReactNode;
}

export const GamingLayout: React.FC<GamingLayoutProps> = ({
  machineType,
  machineName,
  shopName,
  shopLocation,
  balance,
  actionText,
  onPrimaryAction,
  onToggleMachineType,
  toastMessage,
  children,
}) => {
  const [jackpot, setJackpot] = useState(1483061.04);
  const [defaultBet, setDefaultBet] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setJackpot((prev) => prev + Math.random() * 0.45 + 0.1);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="game-lobby-body d-flex flex-column min-vh-100">
      {/* Header */}
      <GamingHeader
        machineType={machineType}
        machineName={machineName}
        shopName={shopName}
        balance={balance}
        actionText={actionText}
        onPrimaryAction={onPrimaryAction}
        onToggleMachineType={onToggleMachineType}
      />

      {/* Main Content Area */}
      <main className="container-fluid px-lg-4 py-3 flex-grow-1">
        {/* Live Jackpot Ticker Hero Banner */}
        <div className="jackpot-hero-stage">
          <div className="jp-chamfer-wrap">
            <div className="jackpot-hero-card">
              {/* Decorative art background */}
              <div className="jackpot-bg-layer">
                <img src="/assets/games/3.png" alt="" className="jp-deco-img jp-deco-left" aria-hidden="true" />
                <img src="/assets/games/6.png" alt="" className="jp-deco-img jp-deco-center-top" aria-hidden="true" />
                <img src="/assets/games/avi.png" alt="" className="jp-deco-img jp-deco-right" aria-hidden="true" />
                <div className="jp-particle jp-p1"></div>
                <div className="jp-particle jp-p2"></div>
                <div className="jp-particle jp-p3"></div>
                <div className="jp-particle jp-p4"></div>
                <div className="jp-particle jp-p5"></div>
              </div>

              {/* Inner Row */}
              <div className="jackpot-inner-row">
                {/* Left: Gold Coin Vault */}
                <div className="jackpot-player-badge">
                  <div className="gold-coin-vault">
                    <div className="gold-coin-disc">
                      <i className="fa-solid fa-coins"></i>
                    </div>
                    <i className="fa-solid fa-crown gold-crown-floater"></i>
                    <i className="fa-solid fa-sparkles gold-coin-sparkle"></i>
                  </div>
                  <div className="jackpot-meta-col">
                    <div className="jackpot-info-title">
                      <span>WINBET GRAND JACKPOT</span>
                      <span className="jp-live-pill">
                        <i className="fa-solid fa-circle"></i> LIVE
                      </span>
                    </div>
                    <div className="jackpot-ticker-val" id="liveJackpotMeter">
                      N$ {jackpot.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="jp-sub-label">
                      <i className="fa-solid fa-users me-1"></i>24,891 Players Active Right Now
                    </div>
                  </div>
                </div>

                {/* Right: Tournament & Spin Button */}
                <div className="jackpot-cta-wrap">
                  <div className="jp-tournament-card">
                    <div className="jp-tour-label">
                      <i className="fa-solid fa-fire-flame-curved"></i> HOT TOURNAMENT
                    </div>
                    <div className="jp-tour-prize">N$ 50,000 Prize Pool</div>
                    <div className="jp-tour-game">Zeus Blitz • Ends in 04:22:38</div>
                  </div>
                  <button
                    type="button"
                    className="btn-jackpot-spin"
                    onClick={onPrimaryAction}
                  >
                    <i className="fa-solid fa-bolt"></i>
                    <span>{actionText}</span>
                  </button>
                </div>
              </div>

              {/* Bottom Accent */}
              <div className="jp-bottom-accent"></div>
            </div>
          </div>
        </div>

        {/* Dynamic Children (GameGrid, etc.) */}
        {children}
      </main>

      {/* Sticky Bottom Dock */}
      <footer className="smart-pc-dock">
        <div className="container-fluid d-flex flex-wrap justify-content-between align-items-center gap-3">
          {/* Bottom Left: Shop Location */}
          <ShopLocation shopName={shopName} location={shopLocation} />

          {/* Middle: Quick Bet Presets */}
          <div className="d-none d-lg-flex align-items-center gap-2">
            <span className="text-secondary small fw-semibold">DEFAULT BET:</span>
            {[10, 25, 50, 100].map((val) => (
              <button
                key={val}
                type="button"
                className={`btn btn-sm py-1 px-3 rounded-pill ${
                  defaultBet === val
                    ? "btn-warning text-dark fw-bold"
                    : "btn-outline-secondary text-light"
                }`}
                style={{ borderColor: "#59259c" }}
                onClick={() => setDefaultBet(val)}
              >
                N$ {val}
              </button>
            ))}
          </div>

          {/* Right: Dock Action Button */}
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn-gold-action py-2 px-4"
              onClick={onPrimaryAction}
              style={{ fontSize: "0.95rem" }}
            >
              <i className="fa-solid fa-circle-check me-1"></i>
              <span id="dockActionText">{actionText}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Full Footer Trust Bar */}
      <div className="winbet-full-footer">
        <div className="container-fluid">
          <div className="row g-4 justify-content-between">
            <div className="col-12 col-md-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="brand-name fs-5">
                  <span style={{ color: "#f5b300" }}>WIN</span>
                  <span style={{ color: "#ffffff" }}>BET</span>
                </span>
                <span className="badge bg-dark border border-warning-subtle text-warning" style={{ fontSize: "0.7rem" }}>
                  OFFICIAL STATION
                </span>
              </div>
              <p className="text-dim small mb-3">
                Authorized Gaming Terminal and Smart PC system. Powered by WinBet Gaming Central.
              </p>
              <div className="security-badge-row">
                <span className="ssl-badge">
                  <i className="fa-solid fa-lock me-1"></i> 256-BIT ENCRYPTION
                </span>
                <span className="age-badge">18+</span>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <h4 className="footer-col-title">Quick Information</h4>
              <ul className="footer-links-list">
                <li><span className="text-dim">Shop: {shopName}</span></li>
                <li><span className="text-dim">Station: {machineName}</span></li>
                <li><span className="text-dim">Mode: {machineType === "terminal" ? "Terminal (Ticket)" : "Smart PC (Cashier)"}</span></li>
              </ul>
            </div>

            <div className="col-6 col-md-3">
              <h4 className="footer-col-title">Player Assistance</h4>
              <ul className="footer-links-list">
                <li><span className="text-dim">Ask shop cashier for assistance</span></li>
                <li><span className="text-dim">Always keep your cashout vouchers safe</span></li>
                <li><span className="text-dim">Play responsibly (18+ only)</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`winbet-toast ${toastMessage ? "show" : ""}`} id="customToast">
        <i className="fa-solid fa-circle-check text-success fs-5"></i>
        <span id="toastMessage">{toastMessage}</span>
      </div>
    </div>
  );
};
