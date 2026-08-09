import React from "react";
import { useNavigate } from "react-router-dom";
import StockVerificationsList from "@/src/components/StockVerificationsList";

/**
 * Physical Asset Verification under Store Management.
 * Route: /store-management/verification/verify
 * Reuses the live stock verification list/form backed by stockApi.
 */
export default function VerificationView() {
  const navigate = useNavigate();

  return (
    <StockVerificationsList
      onBack={() => navigate("/store-management/assets/list")}
    />
  );
}
