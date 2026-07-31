# Grafana feature map

This index maps Grafana's major user areas to stable code entry points. Read the relevant area before changing or verifying behavior.

## Map contract

Each area records:

1. User capabilities and entry points.
2. Structural source anchors that an agent can follow from the current checkout.
3. Frontend, state, API, backend, permission, and storage boundaries.
4. Existing tests and selectors that can prove behavior.
5. Cross-area handoffs and traps.

The source anchors are maintained. Detailed component trees, route inventories, display labels, toggle defaults, and selector strings are runtime discoveries because they change too often to freeze here.

## Areas

- [Explore](explore.md)
- [Dashboards](dashboards.md)
- [Alerting](alerting.md)
- [Connections](connections.md)
- [Administration](administration.md)
- [Plugins](plugins.md)

## Cross-area handoffs

- Explore sends queries and visualizations into Dashboards through the Add to dashboard extension and its critical user journey.
- Dashboards and Explore share the datasource query pipeline.
- Connections owns datasource setup, while datasource plugins and the plugin catalog belong to Plugins.
- Alerting consumes datasources for external rules and links alert rules back to dashboard panels.
- Administration supplies server-wide access and settings for Connections, Alerting, and Plugins.
- App plugins can add navigation under Connections and Administration or register standalone pages.

## Reading rules

- Start with route and navigation registrations, then follow imports into the feature.
- Treat a top-level directory as an orientation point, not proof of ownership.
- Read directory-scoped `AGENTS.md` files before editing.
- Resolve permissions from route guards and backend registration, not from whether a control happens to render.
- Resolve feature toggles from the registry and current code. Do not assume defaults.
- Resolve test selectors from `packages/grafana-e2e-selectors`.
- When frontend and backend deploy independently, preserve compatibility across the boundary.

## Maintenance

Run the validator after every map edit:

```bash
python3 .cursor/skills/grafana-feature-map/scripts/validate_feature_map.py
```

For each changed area, open every source anchor and check one representative flow from route to visible result. Remove dead anchors instead of adding aliases for old paths.
