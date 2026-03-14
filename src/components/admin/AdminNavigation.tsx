import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  PlusCircle,
  ChevronRight,
  Archive,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAdminAccess } from "@/contexts/useAdminAccess";

interface ItemProps {
  documentId: Id<"documents">;
  projectId: Id<"projects">;
  adminPassword: string;
  level?: number;
}

const DocumentItem = ({ documentId, projectId, adminPassword, level = 0 }: ItemProps) => {
  const document = useQuery(api.documents.getById, { adminPassword, documentId, projectId });
  const create = useMutation(api.documents.create);
  const archive = useMutation(api.documents.archive);
  const restore = useMutation(api.documents.restore);
  const remove = useMutation(api.documents.remove);
  const navigate = useNavigate();
  const params = useParams();
  const [expanded, setExpanded] = useState(false);

  const handleCreate = (e: React.MouseEvent) => {
    e.stopPropagation();
    create({
      adminPassword,
      title: "Untitled",
      parentDocument: documentId,
      projectId,
    }).then((newId) => {
      if (!expanded) setExpanded(true);
      navigate(`/admin/projects/${projectId}/documents/${newId}`);
    });
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    archive({ adminPassword, id: documentId });
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    restore({ adminPassword, id: documentId });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this document permanently?")) {
      remove({ adminPassword, id: documentId });
      if (params.documentId === documentId) {
        navigate(`/admin/projects/${projectId}`);
      }
    }
  };

  if (!document) return null;

  const isActive = params.documentId === documentId;

  return (
    <div className="group flex flex-col w-full">
      <div
        onClick={() => navigate(`/admin/projects/${projectId}/documents/${documentId}`)}
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

        <span className={`truncate flex-1 ${document.isArchived ? "line-through text-slate-400" : ""}`}>
          {document.icon} {document.title}
        </span>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
          <div onClick={handleCreate} className="hover:bg-slate-200 p-1 rounded-sm text-slate-500">
            <PlusCircle className="h-3.5 w-3.5" />
          </div>
          {document.isArchived ? (
            <div onClick={handleRestore} className="hover:bg-slate-200 p-1 rounded-sm text-slate-500">
              <RotateCcw className="h-3.5 w-3.5" />
            </div>
          ) : (
            <div onClick={handleArchive} className="hover:bg-slate-200 p-1 rounded-sm text-slate-500">
              <Archive className="h-3.5 w-3.5" />
            </div>
          )}
          <div onClick={handleDelete} className="hover:bg-rose-100 p-1 rounded-sm text-rose-500">
            <Trash2 className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
      {expanded && (
        <DocumentList
          parentDocument={documentId}
          projectId={projectId}
          adminPassword={adminPassword}
          level={level + 1}
        />
      )}
    </div>
  );
};

export const DocumentList = ({
  parentDocument,
  projectId,
  adminPassword,
  level = 0,
}: {
  parentDocument?: Id<"documents">;
  projectId?: Id<"projects">;
  adminPassword: string;
  level?: number;
}) => {
  const documents = useQuery(
    api.documents.getSidebarAll,
    projectId ? { adminPassword, parentDocument, projectId } : "skip",
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
          adminPassword={adminPassword}
          level={level}
        />
      ))}
    </>
  );
};

const AdminNavigation = () => {
  const { adminPassword } = useAdminAccess();
  const projects = useQuery(api.projects.listAll, { adminPassword });
  const create = useMutation(api.documents.create);
  const ensureDefaultProject = useMutation(api.projects.ensureDefault);
  const navigate = useNavigate();
  const params = useParams();

  const activeProjectId = params.projectId as Id<"projects"> | undefined;

  useEffect(() => {
    if (!projects || projects.length === 0) {
      return;
    }

    if (!activeProjectId) {
      navigate(`/admin/projects/${projects[0]._id}`, { replace: true });
    }
  }, [activeProjectId, navigate, projects]);

  const handleCreatePage = () => {
    if (!activeProjectId) {
      ensureDefaultProject({ adminPassword }).then((projectId) => {
        navigate(`/admin/projects/${projectId}`);
      });
      return;
    }

    create({ adminPassword, title: "Untitled", projectId: activeProjectId }).then((id) =>
      navigate(`/admin/projects/${activeProjectId}/documents/${id}`),
    );
  };

  return (
    <aside className="w-64 flex h-full flex-col border-r border-slate-200 bg-slate-50">
      <div className="space-y-2 border-b border-slate-200 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Document tree</p>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-700"
          onClick={handleCreatePage}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Page
        </Button>
      </div>

      <Separator />
      <ScrollArea className="flex-1 p-2">
        <DocumentList projectId={activeProjectId} adminPassword={adminPassword} />
      </ScrollArea>
    </aside>
  );
};

export default AdminNavigation;