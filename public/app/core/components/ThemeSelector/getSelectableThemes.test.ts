import { FlagKeys, getFeatureFlagClient } from '@grafana/runtime/internal';

import { getSelectableThemes } from './getSelectableThemes';

jest.mock('@grafana/runtime/internal', () => ({
  ...jest.requireActual('@grafana/runtime/internal'),
  getFeatureFlagClient: jest.fn(),
}));

const mockGetFeatureFlagClient = jest.mocked(getFeatureFlagClient);
const getBooleanValueFn = jest.fn();

mockGetFeatureFlagClient.mockReturnValue({ getBooleanValue: getBooleanValueFn } as unknown as ReturnType<
  typeof getFeatureFlagClient
>);

function stubVisualRefreshFlag(enabled: boolean) {
  getBooleanValueFn.mockImplementation((key: string, defaultValue: boolean) =>
    key === FlagKeys.GrafanaVisualDesignRefresh ? enabled : defaultValue
  );
}

describe('getSelectableThemes', () => {
  beforeEach(() => {
    getBooleanValueFn.mockReset();
    stubVisualRefreshFlag(false);
  });

  it('includes the Amethyst theme in the theme switcher', () => {
    const themeIds = getSelectableThemes().map((theme) => theme.id);

    expect(themeIds).toContain('amethyst');
  });

  it('keeps visual refresh themes behind the visual refresh flag', () => {
    expect(getSelectableThemes().map((theme) => theme.id)).not.toContain('visual_refresh_dark');

    stubVisualRefreshFlag(true);

    expect(getSelectableThemes().map((theme) => theme.id)).toEqual(
      expect.arrayContaining(['visual_refresh_dark', 'visual_refresh_light'])
    );
  });
});
