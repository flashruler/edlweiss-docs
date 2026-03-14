import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    isArchived: v.boolean(),
    isPublic: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_archived", ["isArchived"])
    .index("by_public_archived", ["isPublic", "isArchived"]),
  documents: defineTable({
    title: v.string(),
    content: v.string(),
    contentFormat: v.optional(v.union(v.literal("html"), v.literal("markdown"))),
    parentDocument: v.optional(v.id("documents")),
    projectId: v.optional(v.id("projects")),
    isArchived: v.boolean(),
    icon: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  })
    .index("by_parent", ["parentDocument"])
    .index("by_project", ["projectId"])
    .index("by_project_parent", ["projectId", "parentDocument"]),
});