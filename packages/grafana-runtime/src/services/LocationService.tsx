import * as H from 'history';
import React, { useContext } from 'react';
import { BehaviorSubject, type Observable } from 'rxjs';

import {
  deprecationWarning,
  type GrafanaLocation,
  type GrafanaLocationDescriptor,
  type GrafanaNavigationAction,
  type UrlQueryMap,
  urlUtil,
} from '@grafana/data';
import { attachDebugger, createLogger } from '@grafana/ui';

import { config } from '../config';

import { type LocationUpdate } from './LocationSrv';

/**
 * @public
 * Callback used to block or confirm a navigation transition.
 * Return `false` to block, a string to use as a confirmation message, or a truthy value to allow.
 */
export type GrafanaTransitionPrompt = string | ((location: GrafanaLocation, action: GrafanaNavigationAction) => string | boolean);

/**
 * @public
 * History-like adapter used by the React Router v5 `<Router>` bridge.
 * Prefer `LocationService.subscribe` and `LocationService.block` for new code.
 */
export interface GrafanaHistory {
  readonly length: number;
  readonly action: GrafanaNavigationAction;
  readonly location: GrafanaLocation;
  push: (path: GrafanaLocationDescriptor, state?: unknown) => void;
  replace: (path: GrafanaLocationDescriptor, state?: unknown) => void;
  go: (n: number) => void;
  goBack: () => void;
  goForward: () => void;
  block: (prompt: GrafanaTransitionPrompt) => () => void;
  listen: (listener: (location: GrafanaLocation, action: GrafanaNavigationAction) => void) => () => void;
  createHref: (location: GrafanaLocationDescriptor) => string;
}

/**
 * @public
 * A wrapper to help work with browser location and history
 */
export interface LocationService {
  partial: (query: Record<string, any>, replace?: boolean) => void;
  push: (location: GrafanaLocationDescriptor) => void;
  replace: (location: GrafanaLocationDescriptor) => void;
  reload: () => void;
  getLocation: () => GrafanaLocation;
  /**
   * @deprecated Use `subscribe` for location listeners and `block` for navigation blocking.
   * Kept so React Router v5 can still receive a history-compatible object.
   */
  getHistory: () => GrafanaHistory;
  subscribe: (listener: (location: GrafanaLocation, action: GrafanaNavigationAction) => void) => () => void;
  block: (prompt: GrafanaTransitionPrompt) => () => void;
  getSearch: () => URLSearchParams;
  getSearchObject: () => UrlQueryMap;
  getLocationObservable: () => Observable<GrafanaLocation>;

  /**
   * This is from the old LocationSrv interface
   * @deprecated use partial, push or replace instead */
  update: (update: LocationUpdate) => void;
}

function asHistory(history: GrafanaHistory): H.History {
  return history as unknown as H.History;
}

function asGrafanaHistory(history: H.History): GrafanaHistory {
  return history as unknown as GrafanaHistory;
}

function asGrafanaLocation(location: H.Location): GrafanaLocation {
  return location as GrafanaLocation;
}

/** @internal */
export class HistoryWrapper implements LocationService {
  private readonly history: H.History;
  private locationObservable: BehaviorSubject<GrafanaLocation>;

  constructor(history?: GrafanaHistory | H.History) {
    // If no history passed create an in memory one if being called from test
    this.history =
      (history ? asHistory(history as GrafanaHistory) : undefined) ||
      (process.env.NODE_ENV === 'test'
        ? H.createMemoryHistory({ initialEntries: ['/'] })
        : H.createBrowserHistory({ basename: config.appSubUrl ?? '/' }));

    this.locationObservable = new BehaviorSubject(asGrafanaLocation(this.history.location));

    this.history.listen((location) => {
      this.locationObservable.next(asGrafanaLocation(location));
    });

    this.partial = this.partial.bind(this);
    this.push = this.push.bind(this);
    this.replace = this.replace.bind(this);
    this.getSearch = this.getSearch.bind(this);
    this.getHistory = this.getHistory.bind(this);
    this.getLocation = this.getLocation.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.block = this.block.bind(this);
  }

  getLocationObservable() {
    return this.locationObservable.asObservable();
  }

  getHistory() {
    return asGrafanaHistory(this.history);
  }

  subscribe(listener: (location: GrafanaLocation, action: GrafanaNavigationAction) => void) {
    return this.history.listen((location, action) => {
      listener(asGrafanaLocation(location), action as GrafanaNavigationAction);
    });
  }

  block(prompt: GrafanaTransitionPrompt) {
    // history@4 types omit boolean returns from the prompt callback
    return this.history.block(prompt as unknown as H.TransitionPromptHook);
  }

  getSearch() {
    return new URLSearchParams(this.history.location.search);
  }

  partial(query: Record<string, any>, replace?: boolean) {
    const currentLocation = this.history.location;
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
      this.history.replace(updatedUrl, this.history.location.state);
    } else {
      this.history.push(updatedUrl, this.history.location.state);
    }
  }

  push(location: GrafanaLocationDescriptor) {
    this.history.push(location as H.Path | H.LocationDescriptor);
  }

  replace(location: GrafanaLocationDescriptor) {
    this.history.replace(location as H.Path | H.LocationDescriptor);
  }

  reload() {
    const prevState = (this.history.location.state as { routeReloadCounter?: number } | undefined)?.routeReloadCounter;
    this.history.replace({
      ...this.history.location,
      state: { routeReloadCounter: prevState ? prevState + 1 : 1 },
    });
  }

  getLocation() {
    return asGrafanaLocation(this.history.location);
  }

  getSearchObject() {
    return locationSearchToObject(this.history.location.search);
  }

  /** @deprecated use partial, push or replace instead */
  update(options: LocationUpdate) {
    deprecationWarning('LocationSrv', 'update', 'partial, push or replace');
    if (options.partial && options.query) {
      this.partial(options.query, options.partial);
    } else {
      const newLocation: Exclude<GrafanaLocationDescriptor, string> = {
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
