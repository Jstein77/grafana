import { type ReactNode } from 'react';
import { createBrowserRouter, createMemoryRouter } from 'react-router-dom';

import { type LocationInitialEntry, type LocationService } from '@grafana/runtime';

interface DataRouterOptions {
  basename?: string;
  initialEntries?: LocationInitialEntry[];
  initialIndex?: number;
}

export function createDataRouter(
  locationService: LocationService,
  element: ReactNode,
  options: DataRouterOptions = {}
) {
  const routes = [{ id: 'root', path: '*', element }];
  const router = options.initialEntries
    ? createMemoryRouter(routes, {
        basename: options.basename,
        initialEntries: options.initialEntries,
        initialIndex: options.initialIndex,
        future: { v7_relativeSplatPath: true },
      })
    : createBrowserRouter(routes, {
        basename: options.basename,
        future: { v7_relativeSplatPath: true },
      });

  locationService.setRouter(router, options.initialEntries?.length ?? window.history.length);
  return router;
}
