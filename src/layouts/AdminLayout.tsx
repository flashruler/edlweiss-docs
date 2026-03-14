import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "convex/react";
import { Outlet } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import AdminNavigation from "../components/admin/AdminNavigation.tsx";
import TopNavigation from "../components/TopNavigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAdminAccess } from "../contexts/useAdminAccess";

const AdminLayout = () => {
  const { adminPassword, isUnlocked, unlock, lock } = useAdminAccess();
  const [attemptedPassword, setAttemptedPassword] = useState("");
  const [error, setError] = useState("");
  const configuredPassword = import.meta.env.VITE_ADMIN_PASSWORD?.trim() ?? "";

  const status = useQuery(
    api.projects.adminStatus,
    isUnlocked ? { adminPassword } : "skip",
  );

  const handleUnlock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedInput = attemptedPassword.trim();

    if (!configuredPassword) {
      setError("VITE_ADMIN_PASSWORD is not configured.");
      return;
    }

    if (normalizedInput !== configuredPassword) {
      setError("Incorrect password.");
      return;
    }

    unlock(normalizedInput);
    setAttemptedPassword("");
    setError("");
  };

  if (!isUnlocked) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Admin Password Required</h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter the admin password to unlock this workspace for the current browser session.
          </p>
          <form className="mt-4 space-y-3" onSubmit={handleUnlock}>
            <Input
              type="password"
              autoComplete="current-password"
              value={attemptedPassword}
              onChange={(event) => setAttemptedPassword(event.target.value)}
              placeholder="Admin password"
            />
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <Button type="submit" className="w-full">
              Unlock Admin
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (status === undefined) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-400">
        Loading admin workspace...
      </div>
    );
  }

  if (!status.authorized) {
    return (
      <div className="h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-2">
          <h1 className="text-xl font-semibold text-slate-900">Admin Access Denied</h1>
          <p className="text-sm text-slate-500">
            {status.hint ?? "Admin password verification failed."}
          </p>
          <Button size="sm" variant="outline" onClick={lock}>
            Reset Session Password
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <TopNavigation mode="admin" />
      <div className="flex min-h-0 flex-1">
        <AdminNavigation />
        <main className="min-h-0 flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;