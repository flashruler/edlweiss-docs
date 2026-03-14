import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { requireAdmin } from "./auth";

async function getFirstProjectIdForRead(ctx: QueryCtx | MutationCtx) {
  const projects = await ctx.db
    .query("projects")
    .withIndex("by_archived", (q) => q.eq("isArchived", false))
    .order("asc")
    .collect();

  return projects[0]?._id ?? null;
}

async function getOrCreateFirstProjectIdForWrite(ctx: MutationCtx) {
  const currentProjectId = await getFirstProjectIdForRead(ctx);
  if (currentProjectId) {
    return currentProjectId;
  }

  return await ctx.db.insert("projects", {
    name: "Default Project",
    isArchived: false,
    isPublic: true,
    createdAt: Date.now(),
  });
}

export const create = mutation({
  args: {
    adminPassword: v.string(),
    title: v.string(),
    parentDocument: v.optional(v.id("documents")),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminPassword);
    const projectId = args.projectId ?? (await getOrCreateFirstProjectIdForWrite(ctx));

    return await ctx.db.insert("documents", {
      title: args.title,
      parentDocument: args.parentDocument,
      projectId,
      isArchived: false,
      content: "",
      contentFormat: "markdown",
      icon: "📄",
      createdAt: Date.now(),
    });
  },
});

export const getSidebarPublic = query({
  args: {
    parentDocument: v.optional(v.id("documents")),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const fallbackProjectId = await getFirstProjectIdForRead(ctx);
    const activeProjectId = args.projectId ?? fallbackProjectId;

    if (!activeProjectId) {
      return [];
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_parent", (q) =>
        q.eq("parentDocument", args.parentDocument)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("isArchived"), false),
          q.or(
            q.eq(q.field("projectId"), activeProjectId),
            q.and(
              q.eq(q.field("projectId"), undefined),
              q.eq(activeProjectId, fallbackProjectId),
            ),
          ),
        ),
      )
      .order("desc")
      .collect();
  },
});

export const getSidebarAll = query({
  args: {
    adminPassword: v.string(),
    parentDocument: v.optional(v.id("documents")),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminPassword);
    const fallbackProjectId = await getFirstProjectIdForRead(ctx);
    const activeProjectId = args.projectId ?? fallbackProjectId;

    if (!activeProjectId) {
      return [];
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_parent", (q) =>
        q.eq("parentDocument", args.parentDocument)
      )
      .filter((q) =>
        q.or(
          q.eq(q.field("projectId"), activeProjectId),
          q.and(
            q.eq(q.field("projectId"), undefined),
            q.eq(activeProjectId, fallbackProjectId),
          ),
        ),
      )
      .order("desc")
      .collect();
  },
});

export const getByIdPublic = query({
  args: {
    documentId: v.id("documents"),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.isArchived) {
      return null;
    }

    const fallbackProjectId = await getFirstProjectIdForRead(ctx);
    const activeProjectId = args.projectId ?? fallbackProjectId;
    const docProjectId = doc.projectId ?? fallbackProjectId;

    if (!activeProjectId || docProjectId !== activeProjectId) {
      return null;
    }

    return doc;
  },
});

export const getById = query({
  args: {
    adminPassword: v.string(),
    documentId: v.id("documents"),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminPassword);
    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      return null;
    }

    if (!args.projectId) {
      return doc;
    }

    const fallbackProjectId = await getFirstProjectIdForRead(ctx);
    const docProjectId = doc.projectId ?? fallbackProjectId;

    if (docProjectId !== args.projectId) {
      return null;
    }

    return doc;
  },
});

export const update = mutation({
  args: {
    adminPassword: v.string(),
    id: v.id("documents"),
    content: v.optional(v.string()),
    contentFormat: v.optional(v.union(v.literal("html"), v.literal("markdown"))),
    title: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminPassword);
    return await ctx.db.patch(args.id, {
      content: args.content,
      contentFormat: args.contentFormat,
      title: args.title,
      icon: args.icon,
    });
  },
});

export const archive = mutation({
  args: {
    adminPassword: v.string(),
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminPassword);
    return await ctx.db.patch(args.id, { isArchived: true });
  },
});

export const restore = mutation({
  args: {
    adminPassword: v.string(),
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminPassword);
    return await ctx.db.patch(args.id, { isArchived: false });
  },
});

export const remove = mutation({
  args: {
    adminPassword: v.string(),
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminPassword);
    return await ctx.db.delete(args.id);
  },
});