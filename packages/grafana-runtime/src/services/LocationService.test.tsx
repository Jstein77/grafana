import { createMemoryHistory } from 'history';
import { renderHook } from '@testing-library/react';

import { locationService, HistoryWrapper, useLocationService, LocationServiceProvider } from './LocationService';

describe('LocationService', () => {
  describe('history', () => {
    it('returns the wrapped history instance', () => {
      const history = createMemoryHistory();
      const service = new HistoryWrapper(history);

      expect(service.getHistory()).toBe(history);
    });

    it('pushes a new location and notifies subscribers', () => {
      const service = new HistoryWrapper(createMemoryHistory({ initialEntries: ['/first'] }));
      const locations: string[] = [];
      const subscription = service.getLocationObservable().subscribe((location) => locations.push(location.pathname));

      service.push('/second');

      expect(service.getLocation().pathname).toBe('/second');
      expect(locations).toEqual(['/first', '/second']);
      subscription.unsubscribe();
    });

    it('replaces the current location without adding a history entry', () => {
      const history = createMemoryHistory({ initialEntries: ['/first'] });
      const service = new HistoryWrapper(history);

      service.replace('/second');

      expect(service.getLocation().pathname).toBe('/second');
      expect(history.length).toBe(1);
      expect(history.action).toBe('REPLACE');
    });
  });

  describe('getSearchObject', () => {
    it('returns query string as object', () => {
      locationService.push('/test?query1=false&query2=123&query3=text');

      expect(locationService.getSearchObject()).toEqual({
        query1: false,
        query2: '123',
        query3: 'text',
      });
    });

    it('returns keys added multiple times as an array', () => {
      locationService.push('/test?servers=A&servers=B&servers=C');

      expect(locationService.getSearchObject()).toEqual({
        servers: ['A', 'B', 'C'],
      });
    });
  });

  describe('partial', () => {
    it('should handle removing params and updating', () => {
      locationService.push('/test?query1=false&query2=123&query3=text');
      locationService.partial({ query1: null, query2: 'update' });

      expect(locationService.getLocation().search).toBe('?query2=update&query3=text');
    });

    it('should handle array values', () => {
      locationService.push('/');
      locationService.partial({ servers: ['A', 'B', 'C'] });

      expect(locationService.getLocation().search).toBe('?servers=A&servers=B&servers=C');
    });

    it('should handle boolean string values', () => {
      locationService.push('/?query1=false&query2=true&query3');
      locationService.partial({ newProp: 'a' });

      expect(locationService.getLocation().search).toBe('?query1=false&query2=true&query3=true&newProp=a');
    });

    it('persist state', () => {
      locationService.push({
        pathname: '/d/123',
        state: {
          some: 'stateToPersist',
        },
      });
      locationService.partial({ q: 1 });

      expect(locationService.getLocation().search).toBe('?q=1');
      expect(locationService.getLocation().state).toEqual({
        some: 'stateToPersist',
      });
    });
  });

  describe('hook access', () => {
    it('can set and access service from a context', () => {
      const locationServiceLocal = new HistoryWrapper();
      const wrapper: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => (
        <LocationServiceProvider service={locationServiceLocal}>{children}</LocationServiceProvider>
      );
      const hookResult = renderHook(() => useLocationService(), { wrapper });
      expect(hookResult.result.current).toBe(locationServiceLocal);
    });
  });
});
