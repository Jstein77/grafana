import { renderHook } from '@testing-library/react';

import { locationService, HistoryWrapper, useLocationService, LocationServiceProvider } from './LocationService';

describe('LocationService', () => {
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

  describe('push and replace', () => {
    it('updates pathname and notifies subscribers', () => {
      const service = new HistoryWrapper();
      const listener = jest.fn();
      const unsubscribe = service.subscribe(listener);

      service.push('/explore');
      expect(service.getLocation().pathname).toBe('/explore');
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/explore' }), 'PUSH');

      service.replace('/dashboards');
      expect(service.getLocation().pathname).toBe('/dashboards');
      expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ pathname: '/dashboards' }), 'REPLACE');

      unsubscribe();
      service.push('/alerting');
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('accepts a location descriptor object', () => {
      const service = new HistoryWrapper();
      service.push({ pathname: '/d/abc', search: '?from=now-1h', hash: '#panel' });

      const location = service.getLocation();
      expect(location.pathname).toBe('/d/abc');
      expect(location.search).toBe('?from=now-1h');
      expect(location.hash).toBe('#panel');
    });
  });

  describe('block', () => {
    it('invokes the prompt and can prevent navigation', () => {
      const service = new HistoryWrapper();
      service.push('/edit');

      const prompt = jest.fn().mockReturnValue(false);
      const unblock = service.block(prompt);

      service.push('/leave');

      expect(prompt).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/leave' }), 'PUSH');
      expect(service.getLocation().pathname).toBe('/edit');

      unblock();
      service.push('/leave');
      expect(service.getLocation().pathname).toBe('/leave');
    });

    it('allows navigation when the prompt returns true', () => {
      const service = new HistoryWrapper();
      service.push('/edit');
      service.block(() => true);

      service.push('/next');
      expect(service.getLocation().pathname).toBe('/next');
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
