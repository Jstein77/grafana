import { screen } from '@testing-library/react';
import { Link, useLocation } from 'react-router-dom';
import { render } from 'test/test-utils';

import { FormPrompt } from './FormPrompt';

function TestPage(props: React.ComponentProps<typeof FormPrompt>) {
  const location = useLocation();
  return (
    <>
      <FormPrompt {...props} />
      <Link to="/next">Next</Link>
      <Link to="?query=changed">Change query</Link>
      <span>
        {location.pathname}
        {location.search}
      </span>
    </>
  );
}

describe('FormPrompt', () => {
  it('keeps the user on the form when they continue editing', async () => {
    const { user } = render(<TestPage confirmRedirect onDiscard={jest.fn()} />, {
      historyOptions: { initialEntries: ['/form'] },
    });

    await user.click(screen.getByRole('link', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Continue editing' }));

    expect(screen.getByText('/form')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('continues navigation after changes are discarded', async () => {
    const onDiscard = jest.fn();
    const { user } = render(<TestPage confirmRedirect onDiscard={onDiscard} />, {
      historyOptions: { initialEntries: ['/form'] },
    });

    await user.click(screen.getByRole('link', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Discard unsaved changes' }));

    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('/next')).toBeInTheDocument();
  });

  it('allows navigation when the form is clean', async () => {
    const { user } = render(<TestPage confirmRedirect={false} onDiscard={jest.fn()} />, {
      historyOptions: { initialEntries: ['/form'] },
    });

    await user.click(screen.getByRole('link', { name: 'Next' }));

    expect(await screen.findByText('/next')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('allows query-only navigation when the form is dirty', async () => {
    const { user } = render(<TestPage confirmRedirect onDiscard={jest.fn()} />, {
      historyOptions: { initialEntries: ['/form?query=initial'] },
    });

    await user.click(screen.getByRole('link', { name: 'Change query' }));

    expect(screen.getByText('/form?query=changed')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
