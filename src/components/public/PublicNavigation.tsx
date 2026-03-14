import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ItemProps {
  documentId: Id<"documents">;
  projectId: Id<"projects">;
  level?: number;
}

const DocumentItem = ({ documentId, projectId, level = 0 }: ItemProps) => {
  const document = useQuery(api.documents.getByIdPublic, { documentId, projectId });
  const navigate = useNavigate();
  const params = useParams();
  const [expanded, setExpanded] = useState(false);

  if (!document) return null;

  const isActive = params.documentId === documentId;

  return (
    <div className="group flex flex-col w-full">
      <div
        onClick={() => navigate(`/projects/${projectId}/documents/${documentId}`)}
        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer text-sm font-medium
          ${isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
        style={{ paddingLeft: level ? `${level * 12 + 12}px` : "12px" }}
      >
        <div
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="h-4 w-4 shrink-0 flex items-center justify-center hover:bg-slate-200 rounded-sm"
        >
          <ChevronRight className={`h-3 w-3 text-slate-500 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </div>

        <span className="truncate flex-1">{document.icon} {document.title}</span>
      </div>
      {expanded && <DocumentList parentDocument={documentId} projectId={projectId} level={level + 1} />}
    </div>
  );
};

export const DocumentList = ({
  parentDocument,
  projectId,
  level = 0,
}: {
  parentDocument?: Id<"documents">;
  projectId?: Id<"projects">;
  level?: number;
}) => {
  const documents = useQuery(
    api.documents.getSidebarPublic,
    projectId ? { parentDocument, projectId } : "skip",
  );

  if (!projectId) {
    return <div className="pl-3 text-xs text-slate-400">Select a project</div>;
  }

  if (documents === undefined) return <div className="pl-8 text-xs text-slate-400">Loading...</div>;
  return (
    <>
      {documents.map((doc) => (
        <DocumentItem
          key={doc._id}
          documentId={doc._id}
          projectId={projectId}
          level={level}
        />
      ))}
    </>
  );
};

const PublicNavigation = () => {
  const projects = useQuery(api.projects.listPublic);
  const navigate = useNavigate();
  const params = useParams();

  const activeProjectId = params.projectId as Id<"projects"> | undefined;

  useEffect(() => {
    if (!projects || projects.length === 0) {
      return;
    }

    if (!activeProjectId) {
      navigate(`/projects/${projects[0]._id}`, { replace: true });
      return;
    }

    const exists = projects.some((project) => project._id === activeProjectId);
    if (!exists) {
      navigate(`/projects/${projects[0]._id}`, { replace: true });
    }
  }, [activeProjectId, navigate, projects]);

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Browse</p>
      </div>

      <Separator />
      <ScrollArea className="flex-1 p-2">
        <DocumentList projectId={activeProjectId} />
      </ScrollArea>
    </aside>
  );
};

export default PublicNavigation;