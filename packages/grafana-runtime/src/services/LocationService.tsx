import React, { useContext } from 'react';
import { createMemoryRouter, createPath, parsePath, type InitialEntry, type Location, type To } from 'react-router-dom';
import { BehaviorSubject, type Observable } from 'rxjs';

import { deprecationWarning, type UrlQueryMap, urlUtil } from '@grafana/data';
import { attachDebugger, createLogger } from '@grafana/ui';

import { type LocationUpdate } from './LocationSrv';

/**
 * @public
 * A wrapper to help work with browser location and history
 */
export interface LocationService {
  partial: (query: Record<string, any>, replace?: boolean) => void;
  push: (location: LocationDescriptor) => void;
  replace: (location: LocationDescriptor) => void;
  go: (delta: number) => void;
  reload: () => void;
  getLocation: () => Location;
  /** @deprecated Prefer LocationService navigation and observable methods. */
  getHistory: () => LocationHistory;
  getSearch: () => URLSearchParams;
  getSearchObject: () => UrlQueryMap;
  getLocationObservable: () => Observable<Location>;
  /** @internal */
  setRouter: (router: DataRouter, initialLength?: number) => void;

  /**
   * This is from the old LocationSrv interface
   * @deprecated use partial, push or replace instead */
  update: (update: LocationUpdate) => void;
}

/** @internal */
export class HistoryWrapper implements LocationService {
  private router: DataRouter;
  private locationObservable: BehaviorSubject<Location>;
  private unsubscribeRouter?: () => void;
  private historyAction: NavigationAction = 'POP';
  private historyLength: number;

  constructor(initialEntries: InitialEntry[] = ['/']) {
    this.router = createMemoryRouter([{ path: '*' }], { initialEntries });
    this.historyLength = initialEntries.length;
    this.locationObservable = new BehaviorSubject(this.router.state.location);
    this.subscribeToRouter();

    this.partial = this.partial.bind(this);
    this.push = this.push.bind(this);
    this.replace = this.replace.bind(this);
    this.go = this.go.bind(this);
    this.getSearch = this.getSearch.bind(this);
    this.getHistory = this.getHistory.bind(this);
    this.getLocation = this.getLocation.bind(this);
  }

  getLocationObservable() {
    return this.locationObservable.asObservable();
  }

  getHistory() {
    const service = this;
    return {
      get action() {
        return service.historyAction;
      },
      get length() {
        return service.historyLength;
      },
      get location() {
        return service.getLocation();
      },
      createHref(location) {
        return typeof location === 'string' ? location : createPath(location);
      },
      push(location, state) {
        service.push(withState(location, state));
      },
      replace(location, state) {
        service.replace(withState(location, state));
      },
      go(delta) {
        service.go(delta);
      },
      goBack() {
        service.go(-1);
      },
      goForward() {
        service.go(1);
      },
      listen(listener) {
        let currentLocation = service.getLocation();
        const subscription = service.getLocationObservable().subscribe((location) => {
          if (location !== currentLocation) {
            currentLocation = location;
            listener(location, service.historyAction);
          }
        });
        return () => subscription.unsubscribe();
      },
    };
  }

  setRouter(router: DataRouter, initialLength = 1) {
    this.unsubscribeRouter?.();
    this.router = router;
    this.historyLength = initialLength;
    this.historyAction = router.state.historyAction;
    this.locationObservable.next(router.state.location);
    this.subscribeToRouter();
  }

  getSearch() {
    return new URLSearchParams(this.getLocation().search);
  }

  partial(query: Record<string, any>, replace?: boolean) {
    const currentLocation = this.getLocation();
    const newQuery = this.getSearchObject();

    for (const key in query) {
      // removing params with null | undefined
      if (query[key] === null || query[key] === undefined) {
        delete newQuery[key];
      } else {
        newQuery[key] = query[key];
      }
    }

    const updatedUrl = urlUtil.renderUrl(currentLocation.pathname, newQuery);

    if (replace) {
      this.replace({ ...parsePath(updatedUrl), state: this.getLocation().state });
    } else {
      this.push({ ...parsePath(updatedUrl), state: this.getLocation().state });
    }
  }

  push(location: LocationDescriptor) {
    const [to, state] = toNavigation(location);
    void this.router.navigate(to, { state });
  }

  replace(location: LocationDescriptor) {
    const [to, state] = toNavigation(location);
    void this.router.navigate(to, { replace: true, state });
  }

  go(delta: number) {
    void this.router.navigate(delta);
  }

  reload() {
    const location = this.getLocation();
    const prevState = (location.state as any)?.routeReloadCounter;
    this.replace({
      ...location,
      state: { routeReloadCounter: prevState ? prevState + 1 : 1 },
    });
  }

  getLocation() {
    return this.router.state.location;
  }

  getSearchObject() {
    return locationSearchToObject(this.getLocation().search);
  }

  /** @deprecated use partial, push or replace instead */
  update(options: LocationUpdate) {
    deprecationWarning('LocationSrv', 'update', 'partial, push or replace');
    if (options.partial && options.query) {
      this.partial(options.query, options.partial);
    } else {
      const newLocation: LocationDescriptor = {
        pathname: options.path,
      };
      if (options.query) {
        newLocation.search = urlUtil.toUrlParams(options.query);
      }
      if (options.replace) {
        this.replace(newLocation);
      } else {
        this.push(newLocation);
      }
    }
  }

  private subscribeToRouter() {
    this.unsubscribeRouter = this.router.subscribe((state) => {
      const locationChanged = state.location !== this.locationObservable.value;
      if (!locationChanged) {
        return;
      }

      this.historyAction = state.historyAction;
      if (state.historyAction === 'PUSH') {
        this.historyLength++;
      }
      this.locationObservable.next(state.location);
    });
  }
}

export type LocationDescriptor = string | Partial<Location>;
export type NavigationAction = 'POP' | 'PUSH' | 'REPLACE';
export type DataRouter = ReturnType<typeof createMemoryRouter>;

export interface LocationHistory {
  readonly action: NavigationAction;
  readonly length: number;
  readonly location: Location;
  createHref(location: LocationDescriptor): string;
  push(location: LocationDescriptor, state?: unknown): void;
  replace(location: LocationDescriptor, state?: unknown): void;
  go(delta: number): void;
  goBack(): void;
  goForward(): void;
  listen(listener: (location: Location, action: NavigationAction) => void): () => void;
}

function toNavigation(location: LocationDescriptor): [To, unknown] {
  if (typeof location === 'string') {
    return [location, undefined];
  }

  const { state, key: _key, ...to } = location;
  return [to, state];
}

function withState(location: LocationDescriptor, state: unknown): LocationDescriptor {
  if (state === undefined) {
    return location;
  }
  return { ...(typeof location === 'string' ? parsePath(location) : location), state };
}

/**
 * @public
 * Parses a location search string to an object
 * */
export function locationSearchToObject(search: string | number): UrlQueryMap {
  let queryString = typeof search === 'number' ? String(search) : search;

  if (queryString.length > 0) {
    if (queryString.startsWith('?')) {
      return urlUtil.parseKeyValue(queryString.substring(1));
    }
    return urlUtil.parseKeyValue(queryString);
  }

  return {};
}

/**
 * @public
 */
export let locationService: LocationService = new HistoryWrapper();

/**
 * Used for tests only
 * @internal
 */
export const setLocationService = (location: LocationService) => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('locationService can be only overriden in test environment');
  }
  locationService = location;
};

const navigationLog = createLogger('Router');

/** @internal */
export const navigationLogger = navigationLog.logger;

// For debugging purposes the location service is attached to global _debug variable
attachDebugger('location', locationService, navigationLog);

// Simple context so the location service can be used without being a singleton
const LocationServiceContext = React.createContext<LocationService | undefined>(undefined);

export function useLocationService(): LocationService {
  const service = useContext(LocationServiceContext);
  if (!service) {
    throw new Error('useLocationService must be used within a LocationServiceProvider');
  }
  return service;
}

export const LocationServiceProvider: React.FC<{ service: LocationService; children: React.ReactNode }> = ({
  service,
  children,
}) => {
  return <LocationServiceContext.Provider value={service}>{children}</LocationServiceContext.Provider>;
};
