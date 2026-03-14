import { useEffect, useMemo, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  contentRootId: string;
  contentFormat?: "html" | "markdown";
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const TableOfContents = ({ content, contentRootId, contentFormat = "html" }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const items = useMemo<TocItem[]>(() => {
    if (!content) {
      return [];
    }

    if (contentFormat === "markdown") {
      const seen = new Map<string, number>();

      return content
        .split("\n")
        .map((line) => line.match(/^(#{1,3})\s+(.*)$/))
        .filter((match): match is RegExpMatchArray => Boolean(match))
        .map((match) => {
          const level = match[1].length;
          const text = match[2].trim();
          const baseId = slugify(text);
          const count = seen.get(baseId) ?? 0;
          seen.set(baseId, count + 1);

          return {
            id: count === 0 ? baseId : `${baseId}-${count + 1}`,
            text,
            level,
          };
        })
        .filter((item) => item.text.length > 0);
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const headings = Array.from(doc.querySelectorAll("h1, h2, h3"));
    const seen = new Map<string, number>();

    return headings
      .map((heading) => {
        const text = heading.textContent?.trim() ?? "";
        if (!text) {
          return null;
        }

        const baseId = slugify(text);
        const count = seen.get(baseId) ?? 0;
        seen.set(baseId, count + 1);
        const id = count === 0 ? baseId : `${baseId}-${count + 1}`;

        return {
          id,
          text,
          level: Number(heading.tagName.slice(1)),
        };
      })
      .filter((item): item is TocItem => Boolean(item));
  }, [content, contentFormat]);

  useEffect(() => {
    const root = document.getElementById(contentRootId);
    if (!root || items.length === 0) {
      return;
    }

    const headings = Array.from(root.querySelectorAll("h1, h2, h3"));
    headings.forEach((heading, index) => {
      if (!items[index]) {
        return;
      }
      heading.id = items[index].id;
      heading.setAttribute("data-toc-anchor", "true");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-64px 0px -70% 0px",
        threshold: [0, 0.25, 1],
      },
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [contentRootId, items]);

  if (items.length === 0) {
    return (
      <aside className="hidden w-64 shrink-0 border-l border-slate-200 bg-slate-50/40 p-4 xl:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">On this page</p>
        <p className="mt-2 text-xs text-slate-400">Add headings to generate a table of contents.</p>
      </aside>
    );
  }

  return (
    <aside className="hidden w-64 shrink-0 border-l border-slate-200 bg-slate-50/40 p-4 xl:block">
      <div className="sticky top-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">On this page</p>
        <nav className="mt-3 flex flex-col gap-1" aria-label="Table of contents">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`rounded px-2 py-1 text-sm transition-colors ${
                activeId === item.id
                  ? "bg-slate-200/80 font-medium text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
              style={{ paddingLeft: `${item.level * 8}px` }}
            >
              {item.text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default TableOfContents;
