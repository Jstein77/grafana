import { act, screen } from '@testing-library/react';
import { Link, useLocation } from 'react-router-dom-v5-compat';
import { render } from 'test/test-utils';

import { type NavigationBlocker, Prompt } from './Prompt';

describe('Prompt component with React Router', () => {
  function TestPage({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    return (
      <>
        {children}
        <Link to="/next">Next</Link>
        <span>{location.pathname}</span>
      </>
    );
  }

  it('blocks navigation when the message function returns false', async () => {
    const message = jest.fn(() => false);
    const onBlocked = jest.fn();
    const { user } = render(
      <TestPage>
        <Prompt message={message} onBlocked={onBlocked} />
      </TestPage>,
      { historyOptions: { initialEntries: ['/current'] } }
    );

    await user.click(screen.getByRole('link', { name: 'Next' }));

    expect(message).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/next' }));
    expect(onBlocked).toHaveBeenCalledWith({
      proceed: expect.any(Function),
      reset: expect.any(Function),
    });
    expect(screen.getByText('/current')).toBeInTheDocument();
  });

  it('allows navigation when blocking is disabled', async () => {
    const message = jest.fn(() => false);
    const { user } = render(
      <TestPage>
        <Prompt when={false} message={message} />
      </TestPage>,
      { historyOptions: { initialEntries: ['/current'] } }
    );

    await user.click(screen.getByRole('link', { name: 'Next' }));

    expect(message).not.toHaveBeenCalled();
    expect(await screen.findByText('/next')).toBeInTheDocument();
  });

  it('continues a blocked navigation when requested', async () => {
    let blocker: NavigationBlocker | undefined;
    const { user } = render(
      <TestPage>
        <Prompt message={() => false} onBlocked={(nextBlocker) => (blocker = nextBlocker)} />
      </TestPage>,
      { historyOptions: { initialEntries: ['/current'] } }
    );

    await user.click(screen.getByRole('link', { name: 'Next' }));
    await act(async () => blocker?.proceed());

    expect(await screen.findByText('/next')).toBeInTheDocument();
  });

  it('uses window confirmation for string messages', async () => {
    const confirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const { user } = render(
      <TestPage>
        <Prompt message="Are you sure you want to leave?" />
      </TestPage>,
      { historyOptions: { initialEntries: ['/current'] } }
    );

    await user.click(screen.getByRole('link', { name: 'Next' }));

    expect(confirm).toHaveBeenCalledWith('Are you sure you want to leave?');
    expect(await screen.findByText('/next')).toBeInTheDocument();
    confirm.mockRestore();
  });
});
