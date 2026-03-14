import { useQuery } from "convex/react";
import { ChevronRight, Home } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useAdminAccess } from "@/contexts/useAdminAccess";

interface BreadcrumbProps {
  mode: "admin" | "public";
}

const Breadcrumb = ({ mode }: BreadcrumbProps) => {
  const params = useParams();
  const { adminPassword } = useAdminAccess();
  const projectId = params.projectId as Id<"projects"> | undefined;
  const documentId = params.documentId as Id<"documents"> | undefined;

  const adminProjects = useQuery(
    api.projects.listAll,
    mode === "admin" ? { adminPassword } : "skip",
  );
  const publicProjects = useQuery(api.projects.listPublic, mode === "public" ? {} : "skip");

  const adminDocument = useQuery(
    api.documents.getById,
    mode === "admin" && documentId
      ? projectId
        ? { adminPassword, documentId, projectId }
        : { adminPassword, documentId }
      : "skip",
  );
  const publicDocument = useQuery(
    api.documents.getByIdPublic,
    mode === "public" && documentId
      ? projectId
        ? { documentId, projectId }
        : { documentId }
      : "skip",
  );

  const projects = mode === "admin" ? adminProjects : publicProjects;
  const document = mode === "admin" ? adminDocument : publicDocument;

  const activeProject = projects?.find((project) => project._id === projectId);
  const basePath = mode === "admin" ? "/admin" : "/";
  const projectPath = mode === "admin" ? `/admin/projects/${projectId}` : `/projects/${projectId}`;

  return (
    <nav className="hidden items-center gap-1 text-xs text-slate-500 md:flex" aria-label="Breadcrumb">
      <Link className="inline-flex items-center rounded px-1.5 py-1 hover:bg-slate-100" to={basePath}>
        <Home className="h-3.5 w-3.5" />
      </Link>
      {activeProject ? (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link className="rounded px-1.5 py-1 font-medium text-slate-600 hover:bg-slate-100" to={projectPath}>
            {activeProject.name}
          </Link>
        </>
      ) : null}
      {document ? (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="max-w-[28ch] truncate rounded bg-slate-100 px-1.5 py-1 font-medium text-slate-700">
            {document.icon} {document.title}
          </span>
        </>
      ) : null}
    </nav>
  );
};

export default Breadcrumb;
