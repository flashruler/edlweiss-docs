# Refactoring Plan for Gitbook Clone

## Current Status
[x] Analyze current codebase structure
[x] Define admin and public route structure
[x] Plan admin layout and components
[x] Plan public layout and components
[x] Identify components to reuse/modify (Navigation, Editor, DocumentPage)
[x] Plan data fetching differences (admin sees all, public sees only non-archived)
[x] Update routing in App.tsx
[x] Create admin document page (with editing capabilities)
[x] Create public document page (read-only)
[x] Create admin navigation (with create/edit/organize features)
[x] Create public navigation (read-only, for browsing)
[x] Adjust convex queries to filter archived documents for public

## Implementation Log
- 2026-03-13: Phase 1 baseline repair started.
- 2026-03-13: Fixed `src/components/admin/AdminNavigation.tsx` to use `api.documents.getSidebarAll` and removed stale `Doc` import.
- 2026-03-13: Removed legacy duplicate files not used by current routes:
	- `src/components/navigation.tsx`
	- `src/pages/DocumentPage.tsx`
- 2026-03-13: Updated layout/page imports to explicit `.tsx` paths in `src/App.tsx`, `src/layouts/AdminLayout.tsx`, and `src/layouts/PublicLayout.tsx` to resolve Vite dev import analysis failures.
- 2026-03-13: Verified baseline with `npm run build` and started dev server successfully (running on port `5174`).
- 2026-03-13: Added `projects` domain model in Convex schema and created `convex/projects.ts` for project listing, creation, defaults, and admin status checks.
- 2026-03-13: Added document archive/restore/delete mutations and project-aware document queries/mutations in `convex/documents.ts`.
- 2026-03-13: Added admin access control helpers in `convex/auth.ts` and enforced admin checks on admin-only queries/mutations.
- 2026-03-13: Added project-scoped routing and redirect pages:
	- `src/pages/admin/AdminProjectHome.tsx`
	- `src/pages/public/PublicProjectHome.tsx`
- 2026-03-13: Implemented project tabs/switching in both navigations and wired admin archive/restore/delete UI actions.
- 2026-03-13: Updated public document page to use public query path and project scoping.
- 2026-03-13: Updated editor read-only mode to disable editing (`editable: !readOnly`).
- 2026-03-13: Regenerated Convex indexes/types (`npx convex dev --once`) and verified production build.
- 2026-03-13: Started fresh dev server after full implementation (running on port `5173`).

## Todo List
[x] Consider authentication or access control (if needed for admin)
[x] Plan project-based organization (each project as top-level document or separate entity)
[x] Implement project selection/switching mechanism
[x] Create tabbed interface for project navigation
[x] Add archive/delete/restore document mutations and wire admin actions
[x] Integrate Convex Auth and enforce admin route/query/mutation authorization
[x] Test and validate separation

## Notes
- Admin authorization checks are implemented server-side and UI-side.
- Current setup uses a development fallback in `convex/auth.ts` (`isAdmin` returns true when no identity) until a concrete Convex Auth provider is configured.
- To enforce strict auth in production, replace the fallback with provider-backed identity checks only.