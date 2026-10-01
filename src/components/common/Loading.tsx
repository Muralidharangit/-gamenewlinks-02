import React from "react";

interface LoadingProps {
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message = "Loading Gaming Station..." }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center" style={{ minHeight: "200px" }}>
      <div
        className="spinner-border mb-3"
        role="status"
        style={{ width: "3rem", height: "3rem", color: "#f5b300" }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-dim small mb-0">{message}</p>
    </div>
  );
};
