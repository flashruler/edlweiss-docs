import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { isAdmin, requireAdmin } from "./auth";

export const adminStatus = query({
  args: {
    adminPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const authorized = await isAdmin(ctx, args.adminPassword);
    return {
      authorized,
      mode: authorized ? "granted" : "denied",
      hint: authorized
        ? null
        : "Admin password is invalid or missing. Verify ADMIN_PASSWORD in Convex settings.",
    };
  },
});

export const listAll = query({
  args: {
    adminPassword: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminPassword);
    return await ctx.db
      .query("projects")
      .withIndex("by_archived", (q) => q.eq("isArchived", false))
      .order("asc")
      .collect();
  },
});

export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_public_archived", (q) =>
        q.eq("isPublic", true).eq("isArchived", false),
      )
      .order("asc")
      .collect();
  },
});

export const getFirstAdminProject = query({
  args: {
    adminPassword: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminPassword);
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_archived", (q) => q.eq("isArchived", false))
      .order("asc")
      .collect();
    return projects[0] ?? null;
  },
});

export const getFirstPublicProject = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_public_archived", (q) =>
        q.eq("isPublic", true).eq("isArchived", false),
      )
      .order("asc")
      .collect();
    return projects[0] ?? null;
  },
});

export const ensureDefault = mutation({
  args: {
    adminPassword: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminPassword);
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_archived", (q) => q.eq("isArchived", false))
      .order("asc")
      .collect();

    if (projects.length > 0) {
      return projects[0]._id;
    }

    return await ctx.db.insert("projects", {
      name: "Default Project",
      isArchived: false,
      isPublic: true,
      createdAt: Date.now(),
    });
  },
});

export const create = mutation({
  args: {
    adminPassword: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminPassword);
    return await ctx.db.insert("projects", {
      name: args.name,
      isArchived: false,
      isPublic: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    adminPassword: v.string(),
    id: v.id("projects"),
    name: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminPassword);

    // Only patch keys that are explicitly provided, so required schema fields
    // are never overwritten with undefined during partial updates.
    const updates: {
      name?: string;
      isArchived?: boolean;
      isPublic?: boolean;
    } = {};

    if (args.name !== undefined) updates.name = args.name;
    if (args.isArchived !== undefined) updates.isArchived = args.isArchived;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    if (Object.keys(updates).length === 0) {
      return;
    }

    return await ctx.db.patch(args.id, updates);
  },
});
