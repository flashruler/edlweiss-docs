import { useQuery } from "convex/react";
import { Navigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const PublicProjectHome = () => {
  const params = useParams();
  const activeProjectId = params.projectId as Id<"projects"> | undefined;
  const projects = useQuery(api.projects.listPublic);
  const firstProject = projects?.[0];
  const activeProject = projects?.find((project) => project._id === activeProjectId);
  const targetProjectId = activeProject?._id ?? firstProject?._id;

  const topLevelDocuments = useQuery(
    api.documents.getSidebarPublic,
    targetProjectId ? { projectId: targetProjectId } : "skip",
  );

  if (projects === undefined) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        Loading projects...
      </div>
    );
  }

  if (!firstProject) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 px-6 text-center">
        No public project available yet.
      </div>
    );
  }

  if (activeProjectId && !activeProject) {
    return <Navigate to={`/projects/${firstProject._id}`} replace />;
  }

  if (topLevelDocuments === undefined) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        Loading project...
      </div>
    );
  }

  const firstDocument = topLevelDocuments[0];

  if (firstDocument && targetProjectId) {
    return (
      <Navigate
        to={`/projects/${targetProjectId}/documents/${firstDocument._id}`}
        replace
      />
    );
  }

  if (!activeProjectId && targetProjectId) {
    return <Navigate to={`/projects/${targetProjectId}`} replace />;
  }

  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 px-6 text-center">
      <h2 className="text-xl font-semibold text-slate-900">
        {activeProject?.name ?? firstProject.name}
      </h2>
      <p className="max-w-md text-sm text-slate-500">
        No public documents are available in this project yet.
      </p>
    </div>
  );
};

export default PublicProjectHome;
