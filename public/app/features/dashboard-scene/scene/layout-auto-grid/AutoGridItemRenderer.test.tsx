import { screen, waitFor } from '@testing-library/react';
import { render } from 'test/test-utils';

import { VariableHide } from '@grafana/data';
import { getPanelPlugin } from '@grafana/data/test';
import { setPluginImportUtils } from '@grafana/runtime';
import { ConstantVariable, SceneTimeRange, SceneVariableSet, VizPanel } from '@grafana/scenes';

import { ConditionalRenderingVariable } from '../../conditional-rendering/conditions/ConditionalRenderingVariable';
import { ConditionalRenderingGroup } from '../../conditional-rendering/group/ConditionalRenderingGroup';
import { SoloPanelContext, SoloPanelContextWithPathIdFilter } from '../../solo/SoloPanelContext';
import { activateFullSceneTree } from '../../utils/test-utils';
import { DashboardScene } from '../DashboardScene';

import { AutoGridItem } from './AutoGridItem';
import { AutoGridLayout } from './AutoGridLayout';
import { AutoGridLayoutManager } from './AutoGridLayoutManager';

const panelPlugin = getPanelPlugin({ id: 'text' }, () => <div>panel-body</div>);

setPluginImportUtils({
  importPanelPlugin: () => Promise.resolve(panelPlugin),
  getPanelPluginFromCache: () => panelPlugin,
});

function hideWhenEquals(variable: string, value: string) {
  return new ConditionalRenderingGroup({
    condition: 'and',
    visibility: 'hide',
    conditions: [
      new ConditionalRenderingVariable({
        variable,
        operator: '=',
        value,
        result: undefined,
      }),
    ],
    result: true,
    renderHidden: false,
  });
}

function setup({
  hideBase = 'true',
  isEditing = false,
}: {
  hideBase?: string;
  isEditing?: boolean;
} = {}) {
  const panel = new VizPanel({
    title: 'Hidden by rule',
    key: 'panel-1',
    pluginId: 'text',
  });

  const gridItem = new AutoGridItem({
    key: 'grid-item-1',
    body: panel,
    conditionalRendering: hideWhenEquals('hide_base', 'true'),
  });

  const dashboard = new DashboardScene({
    isEditing,
    $timeRange: new SceneTimeRange({ from: 'now-6h', to: 'now' }),
    $variables: new SceneVariableSet({
      variables: [
        new ConstantVariable({
          name: 'hide_base',
          value: hideBase,
          hide: VariableHide.hideVariable,
        }),
      ],
    }),
    body: new AutoGridLayoutManager({
      layout: new AutoGridLayout({ children: [gridItem] }),
    }),
  });

  activateFullSceneTree(dashboard);
  gridItem.state.conditionalRendering?.forceCheck();

  return { panel, gridItem, dashboard };
}

describe('AutoGridItemRenderer', () => {
  it('hides the panel in the dashboard layout when the show/hide rule matches', () => {
    const { gridItem } = setup({ hideBase: 'true' });
    expect(gridItem.state.conditionalRendering?.state.result).toBe(false);

    render(<gridItem.Component model={gridItem} />);

    expect(screen.queryByText('panel-body')).not.toBeInTheDocument();
  });

  it('shows the panel in the dashboard layout when the show/hide rule does not match', async () => {
    const { gridItem } = setup({ hideBase: 'false' });
    expect(gridItem.state.conditionalRendering?.state.result).toBe(true);

    render(<gridItem.Component model={gridItem} />);

    expect(await screen.findByText('panel-body')).toBeInTheDocument();
  });

  it('omits a hidden panel from solo / PDF-simple capture while still counting it as found', () => {
    const { gridItem } = setup({ hideBase: 'true' });
    const soloPanelContext = new SoloPanelContextWithPathIdFilter('1');

    render(
      <SoloPanelContext.Provider value={soloPanelContext}>
        <gridItem.Component model={gridItem} />
      </SoloPanelContext.Provider>
    );

    expect(soloPanelContext.matchFound).toBe(true);
    expect(screen.queryByText('panel-body')).not.toBeInTheDocument();
  });

  it('renders a visible panel in solo / PDF-simple capture', async () => {
    const { gridItem } = setup({ hideBase: 'false' });
    const soloPanelContext = new SoloPanelContextWithPathIdFilter('1');

    render(
      <SoloPanelContext.Provider value={soloPanelContext}>
        <gridItem.Component model={gridItem} />
      </SoloPanelContext.Provider>
    );

    expect(soloPanelContext.matchFound).toBe(true);
    expect(await screen.findByText('panel-body')).toBeInTheDocument();
  });

  it('still renders a hidden panel in edit mode during solo capture', async () => {
    const { gridItem } = setup({ hideBase: 'true', isEditing: true });
    const soloPanelContext = new SoloPanelContextWithPathIdFilter('1');

    render(
      <SoloPanelContext.Provider value={soloPanelContext}>
        <gridItem.Component model={gridItem} />
      </SoloPanelContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('panel-body')).toBeInTheDocument();
    });
  });
});
