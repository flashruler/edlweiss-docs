import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AdminAccessContext } from "./useAdminAccess";
import type { AdminAccessContextValue } from "./useAdminAccess";

const ADMIN_PASSWORD_STORAGE_KEY = "gitbook_admin_password";

function readInitialPassword() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY) ?? "";
}

export function AdminAccessProvider({ children }: { children: ReactNode }) {
  const [adminPassword, setAdminPassword] = useState<string>(() => readInitialPassword());

  const unlock = useCallback((password: string) => {
    const normalized = password.trim();
    window.sessionStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, normalized);
    setAdminPassword(normalized);
  }, []);

  const lock = useCallback(() => {
    window.sessionStorage.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
    setAdminPassword("");
  }, []);

  const value = useMemo<AdminAccessContextValue>(
    () => ({
      adminPassword,
      isUnlocked: adminPassword.length > 0,
      unlock,
      lock,
    }),
    [adminPassword, lock, unlock],
  );

  return <AdminAccessContext.Provider value={value}>{children}</AdminAccessContext.Provider>;
}
