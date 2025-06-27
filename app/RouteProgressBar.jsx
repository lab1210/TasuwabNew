"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const RouteProgressBar = () => {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.start();
    const timeout = setTimeout(() => {
      NProgress.done();
    }, 300); // simulate load delay

    return () => clearTimeout(timeout);
  }, [pathname]);

  return null; // No UI needed, just side-effect
};

export default RouteProgressBar;
