import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { config } from '@grafana/runtime';

import { ENVIRONMENT_BANNER_DISMISSED_KEY, EnvironmentBanner, shouldShowEnvironmentBanner } from './EnvironmentBanner';

describe('shouldShowEnvironmentBanner', () => {
  it('shows the banner on development when it has not been dismissed', () => {
    expect(shouldShowEnvironmentBanner('development', false)).toBe(true);
  });

  it('hides the banner in production', () => {
    expect(shouldShowEnvironmentBanner('production', false)).toBe(false);
  });

  it('hides the banner after dismiss', () => {
    expect(shouldShowEnvironmentBanner('development', true)).toBe(false);
  });
});

describe('EnvironmentBanner', () => {
  const originalEnv = config.buildInfo.env;

  beforeEach(() => {
    window.localStorage.clear();
    config.buildInfo.env = 'development';
  });

  afterEach(() => {
    config.buildInfo.env = originalEnv;
    window.localStorage.clear();
  });

  it('renders a status banner in development', () => {
    render(<EnvironmentBanner />);

    expect(screen.getByRole('status', { name: /non-production environment/i })).toBeInTheDocument();
    expect(screen.getByText(/do not use this instance for production changes/i)).toBeInTheDocument();
  });

  it('does not render in production', () => {
    config.buildInfo.env = 'production';
    render(<EnvironmentBanner />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('hides after dismiss and stays hidden after remount', async () => {
    const { unmount } = render(<EnvironmentBanner />);

    await userEvent.click(screen.getByRole('button', { name: /close alert/i }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(ENVIRONMENT_BANNER_DISMISSED_KEY)).toBe('true');

    unmount();
    render(<EnvironmentBanner />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
