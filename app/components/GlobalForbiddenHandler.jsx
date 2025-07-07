"use client";

import { setupAxiosInterceptor } from "@/Services/axiosInterceptor";
import { useEffect } from "react";
import { useAccessDenied } from "./AccessDeniedContext";
import ForbiddenModal from "./ForbiddenModal";

const GlobalForbiddenHandler = () => {
  const { isForbidden, hide } = useAccessDenied();

  useEffect(() => {
    setupAxiosInterceptor(); // Initialize once on client
  }, []);

  return <ForbiddenModal show={isForbidden} onClose={hide} />;
};
export default GlobalForbiddenHandler;
