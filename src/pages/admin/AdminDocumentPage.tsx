import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Trash2 } from "lucide-react";
import Editor from '../../components/editor';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import TableOfContents from '../../components/TableOfContents';
import { Button } from '../../components/ui/button';
import { useAdminAccess } from '../../contexts/useAdminAccess';

export default function AdminDocumentPage() {
  const navigate = useNavigate();
  const params = useParams();
  const projectId = params.projectId as Id<"projects"> | undefined;
  const documentId = params.documentId as Id<"documents">;
  const { adminPassword } = useAdminAccess();
  const document = useQuery(
    api.documents.getById,
    projectId
      ? { adminPassword, documentId, projectId }
      : { adminPassword, documentId },
  );
  const update = useMutation(api.documents.update);
  const remove = useMutation(api.documents.remove);
  const hydratedDocId = useRef<Id<"documents"> | null>(null);

  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftFormat, setDraftFormat] = useState<"html" | "markdown">("markdown");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!document) return;
    if (hydratedDocId.current === document._id) return;

    hydratedDocId.current = document._id;
    setDraftTitle(document.title);
    setDraftContent(document.content);
    setDraftFormat(document.contentFormat ?? "html");
    setIsDirty(false);
  }, [document]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const onTitleChange = (value: string) => {
    setDraftTitle(value);
    setIsDirty(true);
  };

  const onContentChange = (value: string) => {
    setDraftContent(value);
    setIsDirty(true);
  };

  const saveDocument = async () => {
    if (isSaving || !isDirty) return;

    setIsSaving(true);
    try {
      await update({
        adminPassword,
        id: documentId,
        title: draftTitle,
        content: draftContent,
        contentFormat: draftFormat,
      });
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteDocument = async () => {
    if (isDeleting) {
      return;
    }

    const confirmed = window.confirm("Delete this document permanently?");
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await remove({ adminPassword, id: documentId });
      if (projectId) {
        navigate(`/admin/projects/${projectId}`, { replace: true });
        return;
      }

      navigate("/admin", { replace: true });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!document) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600"
          aria-label="Loading document"
        />
      </div>
    );
  }

  const isMarkdownDocument = draftFormat === "markdown";

  return (
    <div className="flex h-full bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div id="admin-document-content" className="mx-auto flex w-full max-w-4xl flex-col px-6 pb-16 pt-12 text-left lg:px-10">
          <div className="mb-6 border-b border-slate-200 pb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Document</p>
            <div className="flex items-start gap-4">
              <input
                className="scheme-light w-full border-none bg-transparent text-4xl font-bold text-slate-950 outline-none placeholder:text-slate-400"
                style={{ color: "#000000", WebkitTextFillColor: "#000000", opacity: 1 }}
                placeholder="Untitled"
                value={draftTitle}
                onChange={(e) => onTitleChange(e.target.value)}
              />
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={deleteDocument}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete Page"}
                </Button>
                <Button
                  type="button"
                  onClick={saveDocument}
                  disabled={!isDirty || isSaving || isDeleting}
                  className="shrink-0"
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {isSaving ? "Saving changes..." : isDirty ? "Unsaved changes" : "All changes saved"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {isMarkdownDocument ? "Markdown source document" : "Legacy HTML document"}
            </p>
          </div>
          <div className="min-h-0">
            {isMarkdownDocument ? (
              <div className="grid min-h-160 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="flex min-h-160 flex-col overflow-hidden rounded-lg border border-slate-300 bg-white">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Markdown</p>
                  </div>
                  <textarea
                    className="markdown-source-editor scheme-light min-h-140 w-full flex-1 resize-none border-0 bg-transparent p-5 font-mono text-sm text-slate-950 outline-none"
                    value={draftContent}
                    onChange={(event) => onContentChange(event.target.value)}
                    placeholder="# Heading\n\nWrite markdown here..."
                    spellCheck={false}
                  />
                </div>
                <div className="flex min-h-160 flex-col overflow-hidden rounded-lg border border-slate-300 bg-white">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    <MarkdownRenderer content={draftContent} />
                  </div>
                </div>
              </div>
            ) : (
              <Editor
                key={documentId}
                onChange={onContentChange}
                initialContent={draftContent}
              />
            )}
          </div>
        </div>
      </div>
      <TableOfContents content={draftContent} contentRootId="admin-document-content" contentFormat={draftFormat} />
    </div>
  );
}