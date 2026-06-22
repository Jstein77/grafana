import { createTheme, type ThemeRegistryItem } from '@grafana/data';

import { getCachedPreviewTheme } from './getCachedPreviewTheme';

describe('getCachedPreviewTheme', () => {
  const buildMock = jest.fn(() => createTheme({ colors: { mode: 'dark' } }));

  const mockTheme: ThemeRegistryItem = {
    id: 'cache-test-theme',
    name: 'Cache test theme',
    build: buildMock,
  };

  beforeEach(() => {
    buildMock.mockClear();
  });

  it('should build the theme only once for the same theme id', () => {
    const first = getCachedPreviewTheme(mockTheme);
    const second = getCachedPreviewTheme(mockTheme);

    expect(buildMock).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
  });
});
