import { createMemoryHistory } from 'history';

import { createHistoryRouterAdapter } from './historyRouterAdapter';

describe('createHistoryRouterAdapter', () => {
  it('adapts locations and navigation actions', () => {
    const history = createMemoryHistory({ initialEntries: ['/start'] });
    const adapter = createHistoryRouterAdapter(history);
    const listener = jest.fn();
    adapter.listen(listener);

    adapter.push('/next?query=value', { source: 'test' });

    expect(adapter.action).toBe('PUSH');
    expect(adapter.location).toEqual(
      expect.objectContaining({
        pathname: '/next',
        search: '?query=value',
        state: { source: 'test' },
        key: expect.any(String),
      })
    );
    expect(listener).toHaveBeenCalledWith({
      action: 'PUSH',
      location: expect.objectContaining({ pathname: '/next' }),
    });
  });

  it('supports string hrefs and back/forward navigation', () => {
    const history = createMemoryHistory({ initialEntries: ['/first', '/second'], initialIndex: 1 });
    const adapter = createHistoryRouterAdapter(history);

    expect(adapter.createHref('/target?query=value#hash')).toBe('/target?query=value#hash');

    adapter.back();
    expect(adapter.location.pathname).toBe('/first');

    adapter.forward();
    expect(adapter.location.pathname).toBe('/second');
  });
});
