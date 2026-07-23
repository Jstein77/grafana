import { screen } from '@testing-library/react';
import { render } from 'test/test-utils';

import config from 'app/core/config';

import LabsPage, { getEnabledFeatureFlags } from './LabsPage';

describe('LabsPage', () => {
  const originalFeatureToggles = { ...config.featureToggles };

  afterEach(() => {
    config.featureToggles = { ...originalFeatureToggles };
  });

  it('lists only enabled feature flags sorted alphabetically', () => {
    const flags = getEnabledFeatureFlags({
      zebraFlag: true,
      alphaFlag: true,
      disabledFlag: false,
      unsetFlag: undefined,
    });

    expect(flags.map((flag) => flag.name)).toEqual(['alphaFlag', 'zebraFlag']);
  });

  it('renders enabled feature flags on the page', async () => {
    config.featureToggles = {
      publicDashboards: true,
      nestedFolders: true,
      someDisabledFlag: false,
    };

    render(<LabsPage />, {
      preloadedState: {
        navIndex: {
          labs: {
            id: 'labs',
            text: 'Labs',
            subTitle: 'Explore experimental features and enabled feature flags',
            url: '/labs',
          },
        },
      },
    });

    expect(await screen.findByText('Feature flags')).toBeInTheDocument();
    expect(screen.getByText('nestedFolders')).toBeInTheDocument();
    expect(screen.getByText('publicDashboards')).toBeInTheDocument();
    expect(screen.queryByText('someDisabledFlag')).not.toBeInTheDocument();
  });

  it('filters feature flags by search query', async () => {
    config.featureToggles = {
      publicDashboards: true,
      nestedFolders: true,
    };

    const { user } = render(<LabsPage />, {
      preloadedState: {
        navIndex: {
          labs: {
            id: 'labs',
            text: 'Labs',
            subTitle: 'Explore experimental features and enabled feature flags',
            url: '/labs',
          },
        },
      },
    });

    await user.type(await screen.findByPlaceholderText(/search feature flags/i), 'nested');

    expect(screen.getByText('nestedFolders')).toBeInTheDocument();
    expect(screen.queryByText('publicDashboards')).not.toBeInTheDocument();
  });
});
