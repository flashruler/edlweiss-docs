import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { PublicSidebarContext } from "./usePublicSidebar";
import type { PublicSidebarContextValue } from "./usePublicSidebar";

const PUBLIC_SIDEBAR_STORAGE_KEY = "gitbook_public_sidebar_collapsed";

function readInitialCollapsedState() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(PUBLIC_SIDEBAR_STORAGE_KEY) === "true";
}

export function PublicSidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => readInitialCollapsedState());

  const setCollapsed = useCallback((collapsed: boolean) => {
    window.sessionStorage.setItem(PUBLIC_SIDEBAR_STORAGE_KEY, String(collapsed));
    setIsCollapsed(collapsed);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((current) => {
      const next = !current;
      window.sessionStorage.setItem(PUBLIC_SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const value = useMemo<PublicSidebarContextValue>(
    () => ({
      isCollapsed,
      setCollapsed,
      toggleCollapsed,
    }),
    [isCollapsed, setCollapsed, toggleCollapsed],
  );

  return <PublicSidebarContext.Provider value={value}>{children}</PublicSidebarContext.Provider>;
}