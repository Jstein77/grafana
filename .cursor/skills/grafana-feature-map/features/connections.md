# Connections

Connections is Grafana's hub for finding integrations and creating, configuring, testing, and managing datasources.

## User capabilities

- Browse available connections and datasource plugins.
- Add a datasource and configure authentication, endpoints, and plugin-specific settings.
- List, edit, test, delete, and manage permissions for existing datasources.
- Open datasource-provided dashboards and health or advisor results.
- Reach integration, collector, and private-connection pages supplied by plugins.

## Entry points

- Connections navigation and `/connections`.
- Add new connection under `/connections/add-new-connection`.
- Datasource list and create routes under `/connections/datasources`.
- Datasource edit, detail, and bundled-dashboard routes.
- Legacy `/datasources` routes that redirect into Connections.
- Plugin navigation entries registered under Connections.

## Source anchors

- `public/app/features/connections/routes.tsx`
- `public/app/features/connections/constants.ts`
- `public/app/features/connections/Connections.tsx`
- `public/app/features/connections/pages`
- `public/app/features/connections/tabs/ConnectData`
- `public/app/features/datasources/api.ts`
- `public/app/features/datasources/state`
- `public/app/features/datasources/components/DataSourceTabPage.tsx`
- `public/app/features/plugins/admin`
- `packages/grafana-e2e-selectors/src/selectors/pages.ts`
- `e2e-playwright/smoke-tests-suite/accessibility.spec.ts`
- `pkg/api/datasources.go`
- `pkg/services/datasources`
- `pkg/services/navtree/navtreeimpl/applinks.go`

## Boundaries and change paths

- Connections owns routing, discovery, and page composition. Datasource CRUD and configuration usually live under `public/app/features/datasources`.
- The add-connection catalog consumes plugin-admin state. Plugin installation and runtime belong to Plugins.
- Datasource persistence uses datasource APIs and services. There is no separate Connections backend service.
- Datasource plugins own their query editors and most plugin-specific configuration fields.
- The server navigation tree and app-plugin links can add or replace pages under Connections.
- Legacy datasource routes and selector URLs still exist. Check redirects and current canonical routes before changing navigation.

## Verification anchors

- Use datasource selector groups from `packages/grafana-e2e-selectors/src/selectors/pages.ts`, but confirm whether each URL is legacy or canonical.
- Use Connections and datasource component tests for routing and configuration forms.
- Use the Connections routes in `e2e-playwright/smoke-tests-suite/accessibility.spec.ts` for basic reachability.
- For datasource creation, prove catalog selection, configuration save, health check, list presence, and API persistence.
- For edit changes, use a disposable datasource and restore or delete it after proof.
- Verify plugin-supplied pages with the plugin enabled and the expected navigation registration present.

## Gotchas

- Connections and datasources are separate frontend areas. Thin Connections pages often delegate to datasource components.
- Plugin routes register before core nested routes and can override the add-connection page.
- Connections home cards come from the navigation index, not a fixed frontend list.
- Existing e2e selector URLs may still use `/datasources`.
- Datasource route contexts can override default paths.
- Permissions, caching, insights, and advisor tabs vary by edition, license, and access.
