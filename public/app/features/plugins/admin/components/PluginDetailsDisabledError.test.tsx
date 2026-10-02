import { render, screen } from '@testing-library/react';

import { PluginErrorCode } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';

import { getCatalogPluginMock } from '../mocks/mockHelpers';

import { PluginDetailsDisabledError } from './PluginDetailsDisabledError';

describe('PluginDetailsDisabledError', () => {
  it('renders nothing when the plugin is not disabled', () => {
    const { container } = render(<PluginDetailsDisabledError plugin={getCatalogPluginMock()} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders the unknown-error copy when the disable reason is unclassified', () => {
    render(<PluginDetailsDisabledError plugin={getCatalogPluginMock({ isDisabled: true })} />);

    expect(screen.getByTestId(selectors.pages.PluginPage.disabledInfo)).toBeInTheDocument();
    expect(screen.getByText(/due to an unknown reason/i)).toBeInTheDocument();
    expect(screen.queryByText(/unkown/i)).not.toBeInTheDocument();
  });

  it('renders signature-error copy for a classified disable reason', () => {
    render(
      <PluginDetailsDisabledError
        plugin={getCatalogPluginMock({ isDisabled: true, error: PluginErrorCode.modifiedSignature })}
      />
    );

    expect(screen.getByText(/does not match its signature/i)).toBeInTheDocument();
    expect(screen.queryByText(/due to an unknown reason/i)).not.toBeInTheDocument();
  });
});
