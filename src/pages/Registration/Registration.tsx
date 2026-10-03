import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { shop } from "../../constants/machine";
import type { MachineType, SmartPCRegisterData } from "../../types";
import { api } from "../../services/api";

interface RegistrationProps {
  defaultMachineType?: MachineType;
}

export const Registration: React.FC<RegistrationProps> = ({
  defaultMachineType = "smart-pc",
}) => {
  const navigate = useNavigate();
  const [portal, setPortal] = useState("betwise");
  const [registrationToken, setRegistrationToken] = useState("TES4122000111554535");
  const [machineType] = useState<MachineType>(defaultMachineType);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [registeredData, setRegisteredData] = useState<SmartPCRegisterData | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const inputToken = registrationToken.trim();
    const inputPortal = portal.trim();
    if (!inputToken || !inputPortal) {
      setErrorMessage("Please enter Portal and Registration Token.");
      showToast("Please enter valid details!");
      return;
    }

    setIsLoading(true);

    try {
      // PDF Flow #1: POST /smart-pcs/register (live API call)
      const data = await api.registerSmartPC({
        portal_slug: inputPortal.toLowerCase(),
        registration_token: inputToken.toUpperCase(),
        device_fingerprint: api.getDeviceFingerprint(),
        operating_system: navigator.userAgent.includes("Windows") ? "Windows 11" : "Linux",
      });

      setRegisteredData(data);
      localStorage.setItem("winbet_machine_type", machineType);

      // Switch to step 2 (Screen 2: Registration Successful)
      setWizardStep(2);
      showToast(`Registration Successful for ${data.machine_id}!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setErrorMessage(msg);
      showToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToPlatform = () => {
    const path = machineType === "terminal" ? "/terminal" : "/smart-pc";
    navigate(path);
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: "radial-gradient(circle at 50% 15%, #1d0938 0%, #080214 100%)" }}>
      <div className="container-fluid px-lg-5 py-3 d-flex flex-column flex-grow-1">
        {/* Top Controls Bar 
        <div
          className="d-flex flex-wrap justify-content-between align-items-center mb-4 border-bottom pb-3"
          style={{ borderColor: "rgba(94, 23, 187, 0.4)" }}
        >
          <div className="d-flex align-items-center gap-2">
            <Link to="/register" className="brand-logo-wrap text-decoration-none mb-0" title="WINBET Station">
              <span className="brand-name fs-5">
                <span style={{ color: "#f5b300" }}>WIN</span>
                <span style={{ color: "#ffffff" }}>BET</span>
              </span>
            </Link>
            <span
              className="badge ms-2 bg-dark text-warning border border-warning-subtle"
              style={{ fontSize: "0.75rem" }}
            >
              REGISTRATION PORTAL
            </span>
          </div>

          <div className="d-flex align-items-center gap-3 mt-2 mt-sm-0">
            <span className="badge border border-purple-800 text-secondary" style={{ fontSize: "0.74rem", background: "rgba(22, 10, 48, 0.5)" }}>
              <i className="fa-solid fa-store me-1 text-warning"></i> {shop.name}
            </span>
          </div>
        </div>
        */}

        {/* Center Content Wrapper */}
        <div className="my-auto w-100 py-2">
          <div id="wizardContainer" className="row justify-content-center py-2">
            <div className="col-12 col-md-8 col-lg-5 col-xl-4">
              <div
                className="winbet-card active-step-card"
                style={{
                  animation: "modalPopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                }}
              >
                <div>
                  {wizardStep === 1 ? (
                    /* SCREEN 1: REGISTRATION SETUP */
                    <form id="flowScreen1" onSubmit={handleSubmit} className="text-start">
                      <h2 className="card-heading mb-1 text-start">Register machine</h2>
                      <p className="text-secondary small mb-4" style={{ fontSize: "0.85rem" }}>Enter the portal and registration token.</p>

                      {/* PORTAL Input */}
                      <div className="mb-3">
                        <label className="field-label mb-1" htmlFor="portalInput">
                          PORTAL
                        </label>
                        <input
                          type="text"
                          id="portalInput"
                          className="winbet-input text-light fw-bold"
                          value={portal}
                          onChange={(e) => {
                            setPortal(e.target.value);
                            setErrorMessage(null);
                          }}
                          placeholder="Winbet"
                        />
                      </div>

                      {/* REGISTRATION TOKEN Input */}
                      <div className="mb-3">
                        <label className="field-label mb-1" htmlFor="tokenInput">
                          REGISTRATION TOKEN
                        </label>
                        <input
                          type="text"
                          id="tokenInput"
                          className="winbet-input font-monospace fw-bold text-light"
                          value={registrationToken}
                          onChange={(e) => {
                            setRegistrationToken(e.target.value);
                            setErrorMessage(null);
                          }}
                          placeholder="ABC1234567890123456"
                        />
                        <div className="text-secondary small mt-2 text-start" style={{ fontSize: "0.74rem" }}>
                          Shop name and machine name appear after Register (from the existing API).
                        </div>
                        {errorMessage && (
                          <div
                            className="alert alert-danger py-2 px-3 mt-2 small text-light bg-danger bg-opacity-25 border-danger"
                            style={{ fontSize: "0.82rem" }}
                          >
                            <i className="fa-solid fa-triangle-exclamation me-1 text-danger"></i>
                            {errorMessage}
                          </div>
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="d-flex justify-content-between align-items-center gap-3 mt-4" id="btnGroupScreen1">
                        <button type="button" className="btn btn-secondary fw-semibold" style={{ borderRadius: "8px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "0.5rem 1.5rem" }} onClick={() => navigate(-1)}>
                          Close
                        </button>
                        <button
                          type="submit"
                          className="btn-winbet"
                          style={{ width: "auto", padding: "0.5rem 1.5rem" }}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <i className="fa-solid fa-circle-notch fa-spin me-2"></i> Registering...
                            </>
                          ) : (
                            "Register"
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* SCREEN 2: REGISTRATION SUCCESSFUL */
                    <div id="flowScreen2">
                      {/* Glowing Checkmark Circle */}
                      <div className="success-circle-container mt-2">
                        <div className="neon-success-circle">
                          <i className="fa-solid fa-check"></i>
                        </div>
                      </div>

                      <h2 className="success-banner-text">Registration Successful!</h2>

                      {/* Registration Summary */}
                      <div className="receipt-list mb-3">
                        <div className="receipt-row">
                          <span className="receipt-label">Machine ID:</span>
                          <span className="receipt-value text-warning fw-bold" id="successMachineName">
                            {registeredData?.machine_id || (machineType === "terminal" ? "Terminal-02" : "Smart PC-03")}
                          </span>
                        </div>
                        <div className="receipt-row">
                          <span className="receipt-label">Machine Type:</span>
                          <span className="receipt-value" id="successMachineType">
                            {machineType === "terminal" ? "Terminal" : "Smart PC"}
                          </span>
                        </div>
                        <div className="receipt-row">
                          <span className="receipt-label">Shop Name:</span>
                          <span className="receipt-value">{registeredData?.shop_name || shop.name}</span>
                        </div>
                        <div className="receipt-row">
                          <span className="receipt-label">Player ID:</span>
                          <span className="receipt-value text-info font-monospace">{registeredData?.player_id || 8841}</span>
                        </div>
                        <div className="receipt-row">
                          <span className="receipt-label">Portal:</span>
                          <span className="receipt-value text-light fw-bold">{portal}</span>
                        </div>
                        <div className="receipt-row">
                          <span className="receipt-label">Registration Token:</span>
                          <span className="receipt-value text-light font-monospace" id="successSetupCode">
                            {registrationToken.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Button on Screen 2 */}
                      <div id="btnGroupScreen2">
                        <button
                          type="button"
                          className="btn-winbet"
                          onClick={handleContinueToPlatform}
                        >
                          <span>Continue to Gaming Platform</span>
                          <i className="fa-solid fa-arrow-right ms-2"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Brand Footer */}
                <div className="card-footer-brand mt-3">
                  <div className="brand-badge">
                    <i className="fa-solid fa-scale-balanced"></i>
                  </div>
                  <div className="brand-text-block">
                    <span className="brand-title">WinBet Station</span>
                    <span className="brand-sub">Independent. Fair. Reliable. Windhoek Central.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Toast */}
        {toastMessage && (
          <div
            className="toast-custom-pill position-fixed bottom-0 start-50 translate-middle-x mb-4 px-4 py-2 rounded-pill text-light fw-semibold shadow-lg z-3"
            style={{
              background: "rgba(13, 5, 29, 0.95)",
              border: "1.5px solid rgba(245, 179, 0, 0.6)",
              boxShadow: "0 0 25px rgba(245, 179, 0, 0.4)",
              fontSize: "0.85rem",
              animation: "fadeInUp 0.25s ease forwards",
            }}
          >
            <i className="fa-solid fa-circle-info text-warning me-2"></i>
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
