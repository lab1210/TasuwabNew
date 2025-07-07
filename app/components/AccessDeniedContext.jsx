"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AccessDeniedContext = createContext();

export const useAccessDenied = () => useContext(AccessDeniedContext);

export const AccessDeniedProvider = ({ children }) => {
  const [isForbidden, setIsForbidden] = useState(false);

  const show = () => setIsForbidden(true);
  const hide = () => setIsForbidden(false);

  useEffect(() => {
    const handle403 = () => show();
    window.addEventListener("forbidden403", handle403);
    return () => window.removeEventListener("forbidden403", handle403);
  }, []);

  return (
    <AccessDeniedContext.Provider value={{ isForbidden, show, hide }}>
      {children}
    </AccessDeniedContext.Provider>
  );
};
