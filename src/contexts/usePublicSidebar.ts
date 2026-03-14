import { createContext, useContext } from "react";

export type PublicSidebarContextValue = {
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
};

export const PublicSidebarContext = createContext<PublicSidebarContextValue | null>(null);

export function usePublicSidebar() {
  const context = useContext(PublicSidebarContext);
  if (!context) {
    throw new Error("usePublicSidebar must be used within a PublicSidebarProvider.");
  }

  return context;
}