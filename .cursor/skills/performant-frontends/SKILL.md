---
name: performant-frontends
description: Builds and reviews Grafana frontend code for fast startup, route transitions, and interaction readiness. Use when adding or changing React routes, renderers, panels, plugins, images, boot logic, data fetching, or other frontend code that can affect bundle size, network waterfalls, or main-thread work.
---

# Performant frontends

## Goal

Keep routes useful quickly without loading or executing code that the current view does not need. Treat network transfer, JavaScript evaluation, React rendering, and API latency as separate costs.

## Before changing code

1. Identify the user-visible milestone: first contentful paint, route shell, first result, or interaction readiness.
2. Record a baseline for that milestone and inspect:
   - Network waterfall: bytes, request count, slow APIs, duplicate requests, and serialized chains.
   - Main thread: long tasks over 50 ms, script evaluation, rendering, and hydration.
   - Bundle composition: route chunk modules and unexpected shared dependencies.
3. Measure the production build before drawing conclusions about bundle size. Grafana's development webpack build is unminified and disables production `splitChunks`, so dev chunk sizes are diagnostic, not production budgets.
4. Repeat measurements and compare medians. Do not optimize a single trace.

## Loading boundaries

- Route-level features must use the repository's dynamic import pattern, such as `SafeDynamicImport` in `public/app/routes/routes.tsx`.
- Lazy-load heavy result renderers by data type. A route that can show traces, logs, flame graphs, node graphs, tables, or charts must not eagerly import every renderer.
- Lazy-load closed or secondary UI such as history, drawers, editors, help, and advanced configuration.
- Load panel and plugin code when results or an interaction require it, not while rendering an empty route shell.
- Avoid broad barrel imports, eager registration, and `require.context` when they pull unrelated features into a universal entry chunk.
- Do not preload every plugin or global registry before non-plugin routes can paint. Define the smallest readiness boundary each route needs.
- Preserve a lightweight fallback with stable dimensions for every lazy boundary.

```tsx
const TraceResults = React.lazy(() => import('./TraceResults'));

return resultType === 'trace' ? (
  <Suspense fallback={<LoadingPlaceholder />}>
    <TraceResults data={data} />
  </Suspense>
) : null;
```

## Boot and data fetching

- Audit sequential `await` chains in `public/app/index.ts` and `public/app/app.ts`.
- Run independent initialization concurrently with `Promise.all`; retain sequencing only for real data or side-effect dependencies.
- Do not block first useful paint on preferences, telemetry, plugin metadata, or registries that the initial route does not need.
- Deduplicate identical requests through a shared promise/cache, especially during concurrent mount.
- Avoid request waterfalls caused by fetching data only after a component renders when the route can start the request earlier.
- Add durable `performance.mark` / `performance.measure` entries around boot and route phases so regressions are attributable.

## React and main-thread work

- Profile before adding memoization. Fix unnecessary work at its source.
- Keep route shells small; move expensive transforms and renderer initialization behind the relevant data-type boundary.
- Avoid mounting hidden tabs, drawers, or result views.
- Stabilize provider values and expensive props when repeated identity changes cause real rerenders.
- Virtualize large lists and tables, but do not eagerly load a virtualization framework for routes that do not display them.
- Move CPU-heavy pure transformations off the critical render path; use a worker when they can create long tasks.

## Assets

- Add `loading="lazy"` to below-the-fold images and avoid fetching offscreen promotional content during navigation.
- Set image dimensions to prevent layout shift.
- Use appropriately sized/compressed assets and responsive sources.
- Treat fonts as route costs: avoid loading unused variants and preload only fonts required for initial paint.

## Performance tests

### Test the behavior, not implementation details

Add normal unit/integration tests for lazy boundaries:

- The route shell renders before a secondary module resolves.
- A heavy renderer is requested only for its matching result type.
- Closed drawers and secondary UI are not mounted.
- Request caches coalesce concurrent calls.

Do not assert webpack chunk names in Jest.

### Add a Playwright route budget

For important or regressed routes, add a focused test under `e2e-playwright/` using `@grafana/plugin-e2e`.

1. Start collection before navigation.
2. Capture resource entries and long tasks.
3. Navigate as a real user and wait for a stable, user-visible selector.
4. Exclude analytics, source maps, browser extensions, and unrelated background polling.
5. Run three samples after one warm-up and evaluate the median.
6. Budget stable signals:
   - Route-owned transferred bytes.
   - Route-owned request count.
   - Number and total duration of long tasks.
   - Route start to visible shell.
7. Keep wall-clock thresholds generous enough for CI variance. Prefer byte/request limits and regression ratios over tight millisecond assertions.
8. Run budget tests against a production build in CI. A dev-server test may diagnose behavior but must not establish production bundle budgets.

Use browser performance APIs rather than sleeps:

```ts
await page.addInitScript(() => {
  window.__longTasks = [];
  new PerformanceObserver((list) => {
    window.__longTasks.push(...list.getEntries().map(({ startTime, duration }) => ({ startTime, duration })));
  }).observe({ type: 'longtask', buffered: true });
});

const startedAt = await page.evaluate(() => performance.now());
await page.getByRole('link', { name: 'Explore' }).click();
await expect(page.getByTestId('explore-shell')).toBeVisible();

const metrics = await page.evaluate((start) => {
  const resources = performance
    .getEntriesByType('resource')
    .filter((entry) => entry.startTime >= start);
  const longTasks = window.__longTasks.filter((entry) => entry.startTime >= start);

  return {
    bytes: resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
    requests: resources.length,
    longTaskDuration: longTasks.reduce((sum, entry) => sum + entry.duration, 0),
  };
}, startedAt);
```

Add the test-only `Window.__longTasks` type declaration locally. Use stable Grafana selectors; add an `@grafana/e2e-selectors` selector when the milestone lacks one.

### Prevent bundle regressions

- Compare production bundle output before and after adding a substantial dependency or import boundary.
- Add or update a CI bundle budget when a route has a known byte target.
- Fail on meaningful regressions, not harmless chunk redistribution: inspect total initial/route bytes and duplicated modules together.

## Verification

For substantive frontend changes:

1. Run targeted Jest tests once with `yarn jest --no-watch <path>`.
2. Run the focused Playwright spec when navigation or loading behavior changed.
3. Run TypeScript and lint checks for touched code.
4. Re-run the same performance capture used for the baseline.
5. Report before/after medians, environment, build type, and remaining uncertainty.

## Review checklist

- [ ] Initial and route chunks contain only code needed for the visible state.
- [ ] Heavy renderers and closed secondary UI are dynamically loaded.
- [ ] Independent initialization and requests are concurrent.
- [ ] Duplicate requests are coalesced.
- [ ] No new long task dominates route readiness.
- [ ] Images and fonts do not compete unnecessarily with the route.
- [ ] Production measurements support performance claims.
- [ ] Tests protect the intended loading boundary and a user-visible milestone.
