import type { Location } from 'history';
import { Navigate } from 'react-router-dom-v5-compat';
import { act, render, screen } from 'test/test-utils';

import { FormPrompt } from './FormPrompt';
import { Prompt } from './Prompt';

jest.mock('./Prompt', () => ({
  Prompt: jest.fn(() => null),
}));

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  Navigate: jest.fn(() => null),
}));

const promptMock = Prompt as jest.MockedFunction<typeof Prompt>;
const navigateMock = Navigate as jest.Mock;

function attemptNavigation(pathname: string) {
  const message = promptMock.mock.calls.at(-1)?.[0].message;
  if (typeof message !== 'function') {
    throw new Error('Expected FormPrompt to provide a message callback');
  }

  const location = { pathname, search: '', hash: '', state: undefined, key: 'next' } as Location;
  let navigationAllowed: string | boolean | undefined;
  act(() => {
    navigationAllowed = message(location);
  });

  return navigationAllowed;
}

describe('FormPrompt', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/form');
  });

  afterEach(() => {
    jest.clearAllMocks();
    window.history.replaceState({}, '', '/');
  });

  it('allows navigation when there are no changes to confirm', () => {
    render(<FormPrompt confirmRedirect={false} onDiscard={jest.fn()} />);

    expect(attemptNavigation('/other')).toBe(true);
    expect(screen.queryByText('Leave page?')).not.toBeInTheDocument();
  });

  it('blocks navigation and opens the modal when the form has unsaved changes', () => {
    render(<FormPrompt confirmRedirect onDiscard={jest.fn()} />);

    expect(attemptNavigation('/other')).toBe(false);
    expect(screen.getByText('Leave page?')).toBeInTheDocument();
  });

  it('keeps the user on the form when they continue editing', async () => {
    const onDiscard = jest.fn();
    const { user } = render(<FormPrompt confirmRedirect onDiscard={onDiscard} />);

    attemptNavigation('/other');
    await user.click(screen.getByRole('button', { name: 'Continue editing' }));

    expect(screen.queryByText('Leave page?')).not.toBeInTheDocument();
    expect(onDiscard).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('discards changes and navigates to the blocked location', async () => {
    const onDiscard = jest.fn();
    const { user } = render(<FormPrompt confirmRedirect onDiscard={onDiscard} />);

    attemptNavigation('/other');
    await user.click(screen.getByRole('button', { name: 'Discard unsaved changes' }));

    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        replace: true,
        to: expect.objectContaining({ pathname: '/other' }),
      }),
      expect.any(Object)
    );
  });

  it('does not prompt when only the URL parameters change', () => {
    render(<FormPrompt confirmRedirect onDiscard={jest.fn()} />);

    expect(attemptNavigation('/form')).toBe(true);
    expect(screen.queryByText('Leave page?')).not.toBeInTheDocument();
  });

  it('lets onLocationChange allow a specific destination', () => {
    const onDiscard = jest.fn();
    const onLocationChange = jest.fn().mockReturnValue(false);
    render(
      <FormPrompt confirmRedirect onDiscard={onDiscard} onLocationChange={onLocationChange} />
    );

    expect(attemptNavigation('/other')).toBe(true);
    expect(onLocationChange).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/other' }));
    expect(onDiscard).not.toHaveBeenCalled();
  });
});
