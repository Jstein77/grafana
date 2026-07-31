# Dashboards

Dashboards let users organize, query, visualize, edit, share, and revisit operational views.

## User capabilities

- Browse folders and dashboards, search, star, move, and delete resources.
- Create and edit dashboards, panels, queries, variables, links, annotations, and layout.
- View dashboards with time controls, refresh, interactions, and live updates.
- Import, export, share, snapshot, embed, or publish dashboards.
- Manage library panels, playlists, recently deleted dashboards, and folder-scoped content.

## Entry points

- Dashboards navigation and `/dashboards` for browse.
- `/d/:uid/:slug?` for normal dashboard view and edit.
- `/dashboard/new` and import actions for creation.
- Folder routes under `/dashboards/f/:uid`.
- Public, snapshot, embedded, and solo routes for specialized viewing.

## Source anchors

- `public/app/routes/routes.tsx`
- `public/app/features/dashboard/routes.ts`
- `public/app/features/browse-dashboards/BrowseDashboardsPage.tsx`
- `public/app/features/browse-dashboards/api/browseDashboardsAPI.ts`
- `public/app/features/dashboard/containers/DashboardPageProxy.tsx`
- `public/app/features/dashboard-scene/pages/DashboardScenePage.tsx`
- `public/app/features/dashboard-scene/pages/DashboardScenePageStateManager.ts`
- `public/app/features/dashboard-scene/scene/DashboardScene.tsx`
- `public/app/features/dashboard/api/dashboard_api.ts`
- `public/app/features/dashboard-scene/serialization`
- `public/app/core/journeys/dashboardEdit.ts`
- `e2e-playwright/dashboards-suite`
- `packages/grafana-e2e-selectors/src/selectors/pages.ts`
- `pkg/services/dashboards`
- `pkg/api/dashboard.go`

## Boundaries and change paths

- Browse and folder management live under `browse-dashboards`. Dashboard view and edit run through `dashboard-scene`.
- `DashboardPageProxy` routes normal dashboards into the Scenes implementation. Scene objects and `DashboardScenePageStateManager` own active runtime state.
- Legacy dashboard and panel models still participate in compatibility, import, and serialization. Do not remove them based only on the render path.
- `getDashboardAPI()` chooses the storage client. Follow its version resolver before changing save, load, or schema behavior.
- Panel queries use the shared datasource query pipeline. Query changes can affect Explore and datasource plugins.
- Dashboard API or unified-storage changes cross independently deployed components. Read `pkg/storage/unified/AGENTS.md` and preserve compatibility in both directions.

## Verification anchors

- Use dashboard and browse selector groups from `packages/grafana-e2e-selectors/src/selectors/pages.ts` and panel selectors from `selectors/components.ts`.
- Start with `e2e-playwright/dashboards-suite/general-dashboards.spec.ts` and `dashboard-browse.spec.ts`.
- Use tests under `e2e-playwright/dashboard-new-layouts` when the new layout or v2 schema is involved.
- For edit changes, prove enter edit, mutate, save, reload, and read the persisted value.
- For browse changes, prove search or navigation from the dashboard list into the expected resource.
- Cover both schema paths when behavior differs between dashboard v1 and v2.

## Gotchas

- Browse and dashboard view are separate applications with different state and API paths.
- Scenes owns the render path, but legacy models remain part of saved-model compatibility.
- Dashboard v1 and v2 can differ in layout, serialization, and API selection.
- The home route may resolve preferences before loading or redirecting to a dashboard.
- Public, snapshot, and solo routes have different authentication and chrome assumptions.
- Some panel menus become actionable only after hover in browser tests.
