import { getCoreExtensionConfigurations } from './getCoreExtensionConfigurations';

jest.mock('app/features/explore/extensions/getExploreExtensionConfigs', () => ({
  getExploreExtensionConfigs: jest.fn(() => [{ title: 'Add to dashboard' }]),
}));

describe('getCoreExtensionConfigurations', () => {
  it('dynamically loads explore extension configs', async () => {
    const configs = await getCoreExtensionConfigurations();
    expect(configs).toEqual([{ title: 'Add to dashboard' }]);

    const exploreConfigs = await import('app/features/explore/extensions/getExploreExtensionConfigs');
    expect(exploreConfigs.getExploreExtensionConfigs).toHaveBeenCalled();
  });
});
