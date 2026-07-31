# Explore

Explore lets users run ad hoc queries against datasources and inspect metrics, logs, traces, profiles, and tables without first creating a dashboard.

## User capabilities

- Select a datasource, author queries, run them, and inspect results.
- Change time range, use live tail where supported, and inspect query details.
- Open a second pane and compare queries or time ranges.
- Revisit query history and follow correlations or data links.
- Move a useful query into a dashboard.

## Entry points

- Main navigation and `/explore`.
- Datasource and panel actions that open a query in Explore.
- Explore-to-dashboard actions that hand a query to Dashboards.
- URL state that restores panes, datasources, queries, and time ranges.

## Source anchors

- `public/app/routes/routes.tsx`
- `public/app/features/explore/ExplorePage.tsx`
- `public/app/features/explore/Explore.tsx`
- `public/app/features/explore/state/main.ts`
- `public/app/features/explore/state/query.ts`
- `public/app/features/explore/hooks/useStateSync`
- `public/app/features/query/state/runRequest.ts`
- `public/app/core/journeys/exploreToDashboard.ts`
- `packages/grafana-e2e-selectors/src/selectors/pages.ts`
- `e2e-playwright/various-suite/explore.spec.ts`
- `pkg/api/api.go`

## Boundaries and change paths

- `ExplorePage` owns the page shell and pane layout. Per-pane behavior continues through `Explore`, connected pane containers, and the reducers under `state/`.
- URL synchronization under `hooks/useStateSync` is part of the public behavior. Update its schema migrators and tests when serialized Explore state changes.
- Query execution leaves Explore through the shared query runner and reaches the generic datasource query API. Explore has no dedicated query backend.
- Datasource plugins own query editors and result behavior after the plugin boundary.
- The Add to dashboard extension crosses into Dashboards. Treat that flow as a two-area change.
- Access depends on Explore configuration, datasource exploration permission, and datasource-level query permission.

## Verification anchors

- Use the `Pages.Explore` selector group from `packages/grafana-e2e-selectors/src/selectors/pages.ts`.
- Use `public/app/features/explore/spec/helper/setup.tsx` for feature-level integration tests.
- Keep URL synchronization covered by tests under `hooks/useStateSync`.
- For query changes, prove datasource selection, query execution, visible results, loading, and error behavior.
- For pane or URL changes, reload the copied URL and verify the same state returns.
- For Add to dashboard, run the `exploreToDashboard` critical user journey and verify the query appears in the dashboard editor.

## Gotchas

- URL state and Redux state are synchronized. Changing only one side creates reload and history bugs.
- Explore supports at most two panes. Closing and reopening panes can expose stale connected children.
- `Explore.tsx` still mixes a connected class component with newer hooks-based children.
- Metrics sidebar behavior can use OpenFeature in addition to Grafana feature toggles.
- Generic datasource query permissions still apply after the Explore route guard passes.
