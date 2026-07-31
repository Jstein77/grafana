# Plugins

Plugins covers catalog administration and the runtime that loads datasource, panel, app, and renderer extensions into Grafana.

## User capabilities

- Browse installed and available plugins and inspect plugin details.
- Install, update, uninstall, enable, disable, and configure plugins when allowed.
- Open app-plugin pages and custom navigation.
- Use datasource and panel plugins inside Connections, Explore, and Dashboards.
- Register and consume plugin links, components, and extension points.
- Inspect signatures, compatibility, loading failures, and extension logs.

## Entry points

- Plugin catalog under `/plugins` and `/plugins/browse`.
- Plugin detail pages under `/plugins/:pluginId`.
- App-plugin runtime routes under `/a/:pluginId`.
- Connections for datasource discovery and setup.
- Dashboard panel and Explore datasource pickers for runtime plugin use.
- Administration's Plugins and data section and extension log.

## Source anchors

- `public/app/features/plugins/admin/routes.tsx`
- `public/app/features/plugins/admin`
- `public/app/features/plugins/routes.tsx`
- `public/app/features/plugins/components/AppRootPage.tsx`
- `public/app/features/plugins/importer`
- `public/app/features/plugins/loader`
- `public/app/features/plugins/extensions`
- `public/app/plugins`
- `packages/grafana-e2e-selectors/src/selectors/pages.ts`
- `e2e-playwright/plugin-catalog-suite`
- `pkg/api/plugins.go`
- `pkg/services/pluginsintegration`
- `pkg/services/pluginsintegration/pluginaccesscontrol/accesscontrol.go`
- `pkg/services/navtree/navtreeimpl/applinks.go`
- `pkg/setting/setting_plugins.go`

## Boundaries and change paths

- Catalog and install behavior live under `features/plugins/admin`. Runtime loading, app routes, sandboxing, and extensions live beside it.
- Built-in plugin implementations live under `public/app/plugins` and may be separate Yarn workspaces.
- App-plugin routes are derived from the navigation index before the fallback `/a/:pluginId` route.
- Datasource plugin discovery appears in Connections. Query and visualization runtime appears in Explore and Dashboards.
- Plugin installation can cross legacy REST and Kubernetes-backed plugin metadata paths. Trace both paths before changing install behavior.
- Backend plugin discovery, settings, loading, and access control live under `pkg/services/pluginsintegration`.

## Verification anchors

- Use `PluginsList`, `PluginPage`, and plugin URL selector groups from `packages/grafana-e2e-selectors/src/selectors/pages.ts`.
- Use `e2e-playwright/plugin-catalog-suite` for install and uninstall round trips.
- Use colocated tests under `public/app/features/plugins/admin` for catalog, detail, and API behavior.
- For install changes, prove install, visible installed state, runtime availability, uninstall, and clean final state.
- For app routes, verify direct navigation and a navigation-index entry.
- For extensions, verify the host extension point and the plugin contribution together.

## Gotchas

- The plugin catalog is only the `admin` subtree. It is not the whole plugin runtime.
- Catalog lookup can fall back to local plugins when the remote catalog times out.
- Plugin administration can be disabled or externally managed.
- Provisioned and built-in plugins do not support every install control.
- App routes can override core routes and may require a reload after navigation registration changes.
- The Redux `plugins` state is unrelated to the built-in plugin source directory name.
- Plugin list links can perform full-page navigation instead of client-side routing.
