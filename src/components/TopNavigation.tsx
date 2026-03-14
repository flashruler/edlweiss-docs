import { useMutation, useQuery } from "convex/react";
import { PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAccess } from "@/contexts/useAdminAccess";
import { usePublicSidebar } from "@/contexts/usePublicSidebar";

interface TopNavigationProps {
  mode: "admin" | "public";
}

const TopNavigation = ({ mode }: TopNavigationProps) => {
  const navigate = useNavigate();
  const params = useParams();
  const { adminPassword, lock } = useAdminAccess();
  const { isCollapsed, toggleCollapsed } = usePublicSidebar();
  const createProject = useMutation(api.projects.create);

  const adminProjects = useQuery(
    api.projects.listAll,
    mode === "admin" ? { adminPassword } : "skip",
  );
  const publicProjects = useQuery(api.projects.listPublic, mode === "public" ? {} : "skip");

  const projects = mode === "admin" ? adminProjects : publicProjects;
  const activeProjectId = params.projectId as Id<"projects"> | undefined;

  const handleProjectClick = (projectId: Id<"projects">) => {
    if (mode === "admin") {
      navigate(`/admin/projects/${projectId}`);
      return;
    }
    navigate(`/projects/${projectId}`);
  };

  const handleCreateProject = () => {
    if (mode !== "admin") {
      return;
    }

    const nextNumber = (projects?.length ?? 0) + 1;
    createProject({ adminPassword, name: `Project ${nextNumber}` }).then((projectId) => {
      navigate(`/admin/projects/${projectId}`);
    });
  };

  const handleSignOut = () => {
    lock();
    navigate("/", { replace: true });
  };

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex h-14 items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {mode === "public" ? (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={isCollapsed ? "Expand document menu" : "Collapse document menu"}
              aria-expanded={!isCollapsed}
              onClick={toggleCollapsed}
            >
              {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          ) : null}
          <div className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm font-semibold text-slate-700">
            Edlweiss Docs
          </div>
          <Breadcrumb mode={mode} />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input className="h-8 w-56 bg-slate-50 pl-8" placeholder="Search docs..." />
          </div>
          {mode === "admin" ? (
            <Button size="sm" variant="outline" className="bg-white" onClick={handleSignOut}>
              Sign Out
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:px-6">
        {projects?.map((project) => (
          <Button
            key={project._id}
            variant={project._id === activeProjectId ? "default" : "outline"}
            size="xs"
            className="shrink-0"
            onClick={() => handleProjectClick(project._id)}
          >
            {project.name}
          </Button>
        ))}
        {mode === "admin" ? (
          <Button size="xs" variant="ghost" onClick={handleCreateProject}>
            + Project
          </Button>
        ) : null}
      </div>
    </header>
  );
};

export default TopNavigation;
