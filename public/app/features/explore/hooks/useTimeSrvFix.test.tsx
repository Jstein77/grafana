import { renderHook, waitFor } from '@testing-library/react';
import { stringify } from 'querystring';
import { TestProvider } from 'test/helpers/TestProvider';
import { getGrafanaContextMock } from 'test/mocks/getGrafanaContextMock';

import { HistoryWrapper } from '@grafana/runtime';

import { useTimeSrvFix } from './useTimeSrvFix';

describe('useTimeSrvFix', () => {
  it('removes `from` and `to` parameters from url when first mounted', async () => {
    const location = new HistoryWrapper([{ pathname: '/explore', search: stringify({ from: '1', to: '2' }) }]);

    const context = getGrafanaContextMock();

    renderHook(() => useTimeSrvFix(), {
      wrapper: ({ children }) => (
        <TestProvider
          grafanaContext={{
            ...context,
            location,
          }}
        >
          {children}
        </TestProvider>
      ),
    });

    await waitFor(() => {
      expect(location.getSearchObject()).toEqual(expect.not.objectContaining({ from: '1', to: '2' }));
    });
  });
});
