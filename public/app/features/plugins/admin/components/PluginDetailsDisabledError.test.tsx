import { render, screen } from 'test/test-utils';

import { PluginErrorCode, PluginSignatureStatus, PluginSignatureType } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';

import { type CatalogPlugin } from '../types';

import { PluginDetailsDisabledError } from './PluginDetailsDisabledError';

describe('PluginDetailsDisabledError', () => {
  it('renders nothing when the plugin is not disabled', () => {
    const { container } = render(<PluginDetailsDisabledError plugin={createPluginStub()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the unknown-error copy with "unknown" spelled correctly', () => {
    render(<PluginDetailsDisabledError plugin={createPluginStub({ isDisabled: true })} />);

    expect(screen.getByTestId(selectors.pages.PluginPage.disabledInfo)).toBeInTheDocument();
    expect(screen.getByText(/due to an unknown reason/i)).toBeInTheDocument();
    expect(screen.queryByText(/unkown/i)).not.toBeInTheDocument();
  });

  it('does not use the unknown-error copy for a signature error', () => {
    render(
      <PluginDetailsDisabledError
        plugin={createPluginStub({ isDisabled: true, error: PluginErrorCode.modifiedSignature })}
      />
    );

    expect(screen.getByTestId(selectors.pages.PluginPage.disabledInfo)).toBeInTheDocument();
    expect(screen.queryByText(/due to an unknown reason/i)).not.toBeInTheDocument();
  });
});

function createPluginStub(overrides?: Partial<CatalogPlugin>): CatalogPlugin {
  return {
    managed: {
      enabled: false,
      strategy: undefined,
    },
    name: 'Test Plugin',
    id: 'test-plugin',
    description: 'Test plugin',
    isCore: false,
    isInstalled: true,
    isDisabled: false,
    isProvisioned: false,
    hasUpdate: false,
    signature: PluginSignatureStatus.valid,
    signatureType: PluginSignatureType.grafana,
    signatureOrg: 'grafana',
    info: {
      logos: { small: '', large: '' },
      keywords: [],
    },
    error: undefined,
    downloads: 0,
    popularity: 0,
    orgName: 'Test Org',
    publishedAt: '',
    updatedAt: '',
    isPublished: true,
    isDev: false,
    isEnterprise: false,
    isDeprecated: false,
    isPreinstalled: { found: false, withVersion: false },
    ...overrides,
  };
}
