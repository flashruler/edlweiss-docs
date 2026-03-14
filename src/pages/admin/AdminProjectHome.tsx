import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAccess } from "@/contexts/useAdminAccess";

const AdminProjectHome = () => {
  const { adminPassword } = useAdminAccess();
  const navigate = useNavigate();
  const params = useParams();
  const activeProjectId = params.projectId as Id<"projects"> | undefined;
  const status = useQuery(api.projects.adminStatus, { adminPassword });
  const projects = useQuery(api.projects.listAll, { adminPassword });
  const firstProject = useQuery(api.projects.getFirstAdminProject, { adminPassword });
  const createDefaultProject = useMutation(api.projects.ensureDefault);
  const updateProject = useMutation(api.projects.update);
  const [pendingArchivedProjectId, setPendingArchivedProjectId] = useState<Id<"projects"> | null>(null);
  const [isArchivingProject, setIsArchivingProject] = useState(false);
  const [draftProjectName, setDraftProjectName] = useState("");
  const [isRenamingProject, setIsRenamingProject] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  const visibleProjects =
    projects?.filter((project) => project._id !== pendingArchivedProjectId) ?? projects;
  const visibleFirstProject = visibleProjects?.[0] ?? null;
  const activeProject = visibleProjects?.find((project) => project._id === activeProjectId);

  useEffect(() => {
    if (!activeProject) {
      setDraftProjectName("");
      setRenameError(null);
      return;
    }

    setDraftProjectName(activeProject.name);
    setRenameError(null);
  }, [activeProject]);

  const handleRenameProject = async () => {
    if (!activeProjectId || !activeProject || isRenamingProject || isArchivingProject) {
      return;
    }

    const nextName = draftProjectName.trim();
    if (!nextName) {
      setRenameError("Project name cannot be empty.");
      return;
    }

    if (nextName === activeProject.name) {
      setRenameError(null);
      return;
    }

    setIsRenamingProject(true);
    setRenameError(null);

    try {
      await updateProject({
        adminPassword,
        id: activeProjectId,
        name: nextName,
      });
    } catch {
      setRenameError("Unable to update project name. Please try again.");
    } finally {
      setIsRenamingProject(false);
    }
  };

  const handleArchiveProject = async () => {
    if (!activeProjectId || !activeProject || isArchivingProject) {
      return;
    }

    const confirmed = window.confirm(
      `Archive project "${activeProject.name}"? It will disappear from active admin and public views.`,
    );

    if (!confirmed) {
      return;
    }

    const remainingProjects = visibleProjects?.filter((project) => project._id !== activeProjectId) ?? [];

    setPendingArchivedProjectId(activeProjectId);
    setIsArchivingProject(true);

    try {
      await updateProject({
        adminPassword,
        id: activeProjectId,
        isArchived: true,
      });

      if (remainingProjects.length > 0) {
        navigate(`/admin/projects/${remainingProjects[0]._id}`, { replace: true });
        return;
      }

      navigate("/admin", { replace: true });
    } catch (error) {
      setPendingArchivedProjectId(null);
      window.alert("Unable to archive the project. Please try again.");
      throw error;
    } finally {
      setIsArchivingProject(false);
    }
  };

  if (status === undefined || firstProject === undefined || projects === undefined) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        Loading workspace...
      </div>
    );
  }

  if (!status.authorized) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
        <h2 className="text-xl font-semibold text-slate-900">Admin Access Required</h2>
        <p className="text-sm text-slate-500 max-w-md">
          {status.hint ?? "Provide a valid admin password to access this area."}
        </p>
      </div>
    );
  }

  if (!visibleFirstProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h2 className="text-xl font-semibold text-slate-900">No Projects Yet</h2>
        <p className="text-sm text-slate-500 max-w-md">
          Create your first project to start organizing documents.
        </p>
        <Button
          onClick={() => {
            createDefaultProject({ adminPassword });
          }}
        >
          Create Default Project
        </Button>
      </div>
    );
  }

  if (activeProjectId) {
    if (!activeProject) {
      return (
        <div className="h-full flex items-center justify-center text-slate-400">
          Loading project...
        </div>
      );
    }

    return (
      <div className="h-full flex items-center justify-center px-6">
        <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project</p>
              <h2 className="text-2xl font-semibold text-slate-900">{activeProject.name}</h2>
              <div className="mx-auto flex w-full max-w-md items-center gap-2">
                <Input
                  value={draftProjectName}
                  onChange={(event) => {
                    setDraftProjectName(event.target.value);
                    if (renameError) {
                      setRenameError(null);
                    }
                  }}
                  placeholder="Project name"
                  disabled={isRenamingProject || isArchivingProject}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRenameProject}
                  disabled={isRenamingProject || isArchivingProject}
                >
                  {isRenamingProject ? "Saving..." : "Save Name"}
                </Button>
              </div>
              {renameError ? <p className="text-sm text-rose-600">{renameError}</p> : null}
              <p className="max-w-md text-sm text-slate-500">
                Select a page from the document tree or create a new one to start editing this project.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={handleArchiveProject}
              disabled={isArchivingProject}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isArchivingProject ? "Deleting Project..." : "Delete Project"}
            </Button>
            <p className="text-xs text-slate-400">
              Deleting a project archives it and removes it from active project lists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <Navigate to={`/admin/projects/${visibleFirstProject._id}`} replace />;
};

export default AdminProjectHome;
