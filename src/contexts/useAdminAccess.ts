import { createContext, useContext } from "react";

export type AdminAccessContextValue = {
  adminPassword: string;
  isUnlocked: boolean;
  unlock: (password: string) => void;
  lock: () => void;
};

export const AdminAccessContext = createContext<AdminAccessContextValue | null>(null);

export function useAdminAccess() {
  const context = useContext(AdminAccessContext);
  if (!context) {
    throw new Error("useAdminAccess must be used within an AdminAccessProvider.");
  }

  return context;
}
