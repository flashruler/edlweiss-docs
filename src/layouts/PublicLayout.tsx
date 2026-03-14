import { Outlet } from "react-router-dom";
import PublicNavigation from "../components/public/PublicNavigation.tsx";
import TopNavigation from "../components/TopNavigation";

const PublicLayout = () => {
  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <TopNavigation mode="public" />
      <div className="flex min-h-0 flex-1">
        <PublicNavigation />
        <main className="min-h-0 flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PublicLayout;