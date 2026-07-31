# Administration

Administration groups server and organization settings, users and access, authentication, provisioning, statistics, and other instance-wide controls.

## User capabilities

- View and change server settings and organization defaults.
- Create and manage users, organizations, teams, and service accounts.
- Configure authentication providers and inspect LDAP state.
- Manage provisioning repositories and reload provisioned resources.
- Inspect server statistics, upgrade information, and migration tools.
- Reach plugin, extension, and data administration through nested sections.

## Entry points

- Administration navigation and `/admin`.
- General, Plugins and data, and Users and access landing pages.
- Settings, users, organizations, authentication, stats, provisioning, and migration routes.
- Organization routes for teams, service accounts, and preferences.
- Plugin-injected administration pages.

## Source anchors

- `public/app/routes/routes.tsx`
- `public/app/core/components/NavLandingPage/NavLandingPage.tsx`
- `public/app/features/admin`
- `public/app/features/auth-config`
- `public/app/features/org`
- `public/app/features/teams`
- `public/app/features/serviceaccounts`
- `public/app/features/provisioning/utils/routes.tsx`
- `public/app/types/accessControl.ts`
- `packages/grafana-e2e-selectors/src/selectors/pages.ts`
- `e2e-playwright/smoke-tests-suite/accessibility.spec.ts`
- `pkg/services/navtree/navtreeimpl/admin.go`
- `pkg/services/navtree/models.go`
- `pkg/api/admin.go`
- `pkg/api/admin_users.go`
- `pkg/api/admin_provisioning.go`
- `pkg/services/ldap/api`

## Boundaries and change paths

- Administration is a navigation grouping, not one frontend module. Follow the selected card or route into its owning feature.
- The server builds the administration navigation tree and removes sections the current user cannot access.
- SPA route guards and backend HTML or API authorization both matter. Check both for permission changes.
- `NavLandingPage` renders the current navigation children, including plugin extensions.
- User, organization, authentication, service-account, and provisioning state live in separate feature reducers and APIs.
- Plugin and connection administration cross into their own areas. Read those map files when changing nested cards or routes.

## Verification anchors

- Use `e2e-playwright/smoke-tests-suite/accessibility.spec.ts` for route reachability across administration pages.
- Use admin page selector groups from `packages/grafana-e2e-selectors/src/selectors/pages.ts`.
- Use colocated tests under `public/app/features/admin` for users, tables, and server stats.
- For permission work, verify that navigation, direct route access, and API access agree.
- For user or organization mutations, prove the updated list or detail and cross-check the read API.
- For server settings pages, distinguish read-only display from settings that are editable elsewhere.

## Gotchas

- Teams, service accounts, authentication, and provisioning do not live under `features/admin`.
- `/admin/users` combines global and organization user views in tabs.
- Datasource administration moved to Connections even though old administration links may redirect.
- A route visible to an organization admin can still require a different backend action.
- Empty administration sections disappear after permission filtering.
- Plugin extensions can change landing-page content after core navigation loads.
