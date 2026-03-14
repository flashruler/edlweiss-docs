import { useParams } from "react-router-dom";
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import Editor from '../../components/editor';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import TableOfContents from '../../components/TableOfContents';

export default function PublicDocumentPage() {
  const params = useParams();
  const projectId = params.projectId as Id<"projects"> | undefined;
  const documentId = params.documentId as Id<"documents">;
  const document = useQuery(
    api.documents.getByIdPublic,
    projectId ? { documentId, projectId } : { documentId },
  );

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

  const contentFormat = document.contentFormat ?? "html";

  return (
    <div className="flex h-full bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div id="public-document-content" className="mx-auto flex w-full max-w-3xl flex-col px-6 pb-16 pt-12 text-left lg:px-10">
          <div className="mb-8 border-b border-slate-200 pb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide">Document</p>
            <h1
              className="text-4xl font-bold leading-tight"
              style={{ color: "#000000", WebkitTextFillColor: "#000000", opacity: 1 }}
            >
              {document.title}
            </h1>
          </div>
          <div className="min-h-0">
            {contentFormat === "markdown" ? (
              <MarkdownRenderer content={document.content} />
            ) : (
              <Editor
                key={documentId}
                readOnly
                initialContent={document.content}
              />
            )}
          </div>
        </div>
      </div>
      <TableOfContents content={document.content} contentRootId="public-document-content" contentFormat={contentFormat} />
    </div>
  );
}