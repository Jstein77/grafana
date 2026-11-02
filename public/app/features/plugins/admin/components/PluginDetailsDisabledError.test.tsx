import { render, screen } from 'test/test-utils';

import { PluginErrorCode } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';

import { getCatalogPluginMock } from '../mocks/mockHelpers';

import { PluginDetailsDisabledError } from './PluginDetailsDisabledError';

describe('PluginDetailsDisabledError', () => {
  it('renders nothing when the plugin is not disabled', () => {
    const plugin = getCatalogPluginMock({ isDisabled: false });
    const { container } = render(<PluginDetailsDisabledError plugin={plugin} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the unknown-error fallback with "unknown" spelled correctly', () => {
    const plugin = getCatalogPluginMock({ isDisabled: true, error: undefined });

    render(<PluginDetailsDisabledError plugin={plugin} />);

    expect(screen.getByTestId(selectors.pages.PluginPage.disabledInfo)).toBeInTheDocument();
    expect(screen.getByText(/due to an unknown reason/i)).toBeInTheDocument();
    expect(screen.queryByText(/unkown/i)).not.toBeInTheDocument();
  });

  it('renders signature-specific copy for a modified signature', () => {
    const plugin = getCatalogPluginMock({ isDisabled: true, error: PluginErrorCode.modifiedSignature });

    render(<PluginDetailsDisabledError plugin={plugin} />);

    expect(screen.getByTestId(selectors.pages.PluginPage.disabledInfo)).toBeInTheDocument();
    expect(screen.getByText(/does not match its signature/i)).toBeInTheDocument();
    expect(screen.queryByText(/due to an unknown reason/i)).not.toBeInTheDocument();
  });
});
