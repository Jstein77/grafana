import { render, screen } from 'test/test-utils';

import { selectors } from '@grafana/e2e-selectors';

import { wellFormedDashboard, wellFormedFolder } from '../fixtures/dashboardsTreeItem.fixture';
import { type DashboardsTreeItem } from '../types';

import { StarCell } from './StarCell';

jest.mock('app/features/stars/StarToolbarButton', () => ({
  StarToolbarButton: ({ title, id }: { title: string; id: string }) => (
    <button aria-label={`Mark "${title}" as favorite`} data-testid={selectors.components.NavToolbar.markAsFavorite}>
      star-{id}
    </button>
  ),
}));

function renderCell(item: DashboardsTreeItem) {
  return render(
    <StarCell
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      row={{ original: item } as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cell={{} as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      column={{} as any}
      value={undefined}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      table={{} as any}
    />
  );
}

describe('StarCell', () => {
  it('renders a star control for dashboards', () => {
    const dashboard = wellFormedDashboard();
    renderCell(dashboard);

    expect(screen.getByRole('button', { name: `Mark "${dashboard.item.title}" as favorite` })).toBeInTheDocument();
  });

  it('does not render a star control for folders', () => {
    renderCell(wellFormedFolder());

    expect(screen.queryByTestId(selectors.components.NavToolbar.markAsFavorite)).not.toBeInTheDocument();
  });
});
