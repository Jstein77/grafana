import { render, screen } from 'test/test-utils';

import { PluginErrorCode } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';

import { getCatalogPluginMock } from '../mocks/mockHelpers';

import { PluginDetailsDisabledError } from './PluginDetailsDisabledError';

describe('PluginDetailsDisabledError', () => {
  it('does not render when the plugin is not disabled', () => {
    render(<PluginDetailsDisabledError plugin={getCatalogPluginMock({ isDisabled: false })} />);

    expect(screen.queryByTestId(selectors.pages.PluginPage.disabledInfo)).not.toBeInTheDocument();
  });

  it('renders the unknown-error copy with the correct spelling when no error code is set', () => {
    render(<PluginDetailsDisabledError plugin={getCatalogPluginMock({ isDisabled: true, error: undefined })} />);

    expect(screen.getByTestId(selectors.pages.PluginPage.disabledInfo)).toBeInTheDocument();
    expect(screen.getByText(/due to an unknown reason/i)).toBeInTheDocument();
    expect(screen.queryByText(/unkown/i)).not.toBeInTheDocument();
  });

  it('renders the unknown-error copy for an unrecognized error code', () => {
    render(
      <PluginDetailsDisabledError
        plugin={getCatalogPluginMock({ isDisabled: true, error: 'notARealError' as PluginErrorCode })}
      />
    );

    expect(screen.getByText(/due to an unknown reason/i)).toBeInTheDocument();
  });
});
