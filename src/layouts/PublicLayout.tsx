import { Outlet } from "react-router-dom";
import PublicNavigation from "../components/public/PublicNavigation.tsx";
import TopNavigation from "../components/TopNavigation";
import { usePublicSidebar } from "@/contexts/usePublicSidebar";

const PublicLayout = () => {
  const { isCollapsed } = usePublicSidebar();

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <TopNavigation mode="public" />
      <div className="flex min-h-0 flex-1">
        <div
          className={`min-h-0 shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out ${
            isCollapsed ? "w-0" : "w-64"
          }`}
        >
          <PublicNavigation />
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PublicLayout;