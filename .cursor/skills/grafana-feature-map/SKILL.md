---
name: grafana-feature-map
description: Navigate Grafana's major product areas and trace user-visible changes to routes, frontend code, backend services, permissions, tests, and proof paths. Use when scoping, implementing, reviewing, or verifying work in Explore, Dashboards, Alerting, Connections, Administration, or Plugins, or when asked for Grafana's feature map or control glass.
---

# Grafana feature map

Use this skill as the control glass for Grafana's major product areas. It points to structural sources of truth. It does not replace reading the current code.

## Start here

1. Read [`features/README.md`](features/README.md).
2. Open every area touched by the request.
3. Resolve routes, navigation, permissions, feature flags, selectors, and tests from the cited source anchors. Treat literals in the map as orientation, not authority.
4. Trace the user action through the frontend boundary and into the backend when the change crosses it.
5. State the affected areas, cross-area handoffs, and proof path before editing.
6. Follow any directory-scoped `AGENTS.md` files under the paths you touch.

## Choose the area

- [Explore](features/explore.md) covers ad hoc datasource queries, split panes, query history, live tail, correlations, and Explore-to-dashboard handoff.
- [Dashboards](features/dashboards.md) covers browse, view, edit, panels, variables, sharing, storage, and public dashboards.
- [Alerting](features/alerting.md) covers rules, alert instances, notification routing, silences, history, and Alertmanager settings.
- [Connections](features/connections.md) covers connection discovery and datasource creation, configuration, health, and dashboards.
- [Administration](features/administration.md) covers server and organization settings, users, access, authentication, provisioning, and stats.
- [Plugins](features/plugins.md) covers the plugin catalog, installation, settings, runtime loading, app routes, and extension points.

Read more than one file when a flow crosses an area boundary. Common handoffs include Explore to Dashboards, Connections to Plugins, Connections to Alerting, and Administration to Plugins.

## Scope a change

For each affected area, report:

- The user capability and entry point.
- The route and navigation source.
- The frontend owner and state or API boundary.
- The backend service when persistence, permissions, or query execution changes.
- The permission, configuration, edition, or feature-toggle gate.
- The nearest automated test and the user-visible proof path.
- Cross-area effects and compatibility constraints.

Do not turn the map into an exhaustive file list. Follow imports and registrations from the anchors for the requested behavior.

## Verify behavior

Use the repository's existing test and selector anchors first. Resolve selector values from `@grafana/e2e-selectors`; do not copy generated CSS classes or DOM positions into new tests.

For a UI change, prove the real user path and its resulting state. For a mutation, add a read-only cross-check of the saved value. For permission and feature-gated behavior, exercise both the allowed path and the unavailable or denied state.

Use the local development skills for launch instructions. This skill owns feature location and proof scope, not process startup.

## Keep the map alive

Update an area file when a structural source moves, an area gains or loses a major capability, or its boundary changes. Do not update it for a component rename that leaves the starting anchors and runtime flow intact.

Run:

```bash
python3 .cursor/skills/grafana-feature-map/scripts/validate_feature_map.py
```

The validator checks the six-area index, required sections, links, and source-anchor paths. A passing validator proves the map is structurally coherent. It does not prove that its architectural claims are current, so inspect the cited code in every maintenance pass.
