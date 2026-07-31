# Alerting

Alerting lets users define rules, inspect alert activity, and route notifications through contact points, policies, templates, mute timings, and silences.

## User capabilities

- List, create, edit, view, export, migrate, restore, and delete alert rules.
- Inspect firing and pending alerts, groups, state history, and notification history.
- Configure contact points, notification policies, templates, and time intervals.
- Create and manage silences.
- Select Grafana-managed or datasource-managed rules and Alertmanagers.
- Configure Alertmanager behavior and alerting administration.

## Entry points

- Alerting navigation and `/alerting`.
- Rule routes under `/alerting/list`, `/alerting/new`, and rule view or edit paths.
- Notification configuration under `/alerting/notifications` and `/alerting/routes`.
- Alert activity, groups, history, silences, and recently deleted routes.
- Folder and dashboard panel links that open alerting in resource context.

## Source anchors

- `public/app/features/alerting/routes.tsx`
- `public/app/features/alerting/unified/AGENTS.md`
- `public/app/features/alerting/unified/TESTING.md`
- `public/app/features/alerting/unified/RuleList.tsx`
- `public/app/features/alerting/unified/rule-editor`
- `public/app/features/alerting/unified/api/alertingApi.ts`
- `public/app/features/alerting/unified/navigation`
- `public/app/features/alerting/unified/featureToggles.ts`
- `public/app/features/alerting/unified/utils/navigation.ts`
- `packages/grafana-alerting`
- `packages/grafana-e2e-selectors/src/selectors/pages.ts`
- `e2e-playwright/alerting-suite`
- `pkg/services/ngalert`
- `pkg/services/navtree/navtreeimpl/navtree.go`

## Boundaries and change paths

- `routes.tsx` is the frontend route table and applies the global unified-alerting availability gate.
- Most current frontend work lives under `unified`. Read its `AGENTS.md` before editing.
- New server data access should start with generated `@grafana/api-clients` clients and RTK Query. Legacy Redux remains for existing flows.
- Grafana-managed and datasource-managed rules use different API and ownership paths. Resolve the rule source before changing behavior.
- Notification configuration crosses Alertmanager APIs and can target Grafana or external Alertmanagers.
- The Go service and HTTP registrations live under `pkg/services/ngalert`. Generated base API files are outputs, not editing targets.
- Navigation has server and client layers, and the active structure can change behind alerting navigation toggles.

## Verification anchors

- Follow `public/app/features/alerting/unified/TESTING.md` for MSW, permissions, datasource setup, and factories.
- Use the alerting selector groups from `packages/grafana-e2e-selectors/src/selectors/pages.ts` and `selectors/components.ts`.
- Use page objects and specs under `e2e-playwright/alerting-suite`.
- Test route access with the exact read or write permission required by the route and control.
- For rule mutations, prove save and reload against the correct rule source.
- For notification changes, prove the visible configuration and a read-only API result from the selected Alertmanager.

## Gotchas

- Alerting can be globally disabled even when the SPA route exists.
- Navigation v1 and v2 use different nav IDs and groupings.
- Rule list v1 and v2 can also vary by user preview preference.
- Grafana-managed and external rules are not interchangeable test fixtures.
- Static routes must remain ahead of dynamic rule identifier routes.
- Use `createRelativeUrl` for native anchors, but not with router-aware navigation helpers.
- Do not hand-edit generated API registration files.
