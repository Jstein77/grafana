import { type GrafanaLocation } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { render } from 'test/test-utils';

import { Prompt } from './Prompt';

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  locationService: {
    getLocation: jest.fn(),
    block: jest.fn(),
  },
}));

describe('Prompt component with React Router', () => {
  const unblock = jest.fn();

  beforeEach(() => {
    (locationService.getLocation as jest.Mock).mockReturnValue({ pathname: '/current' } as GrafanaLocation);
    (locationService.block as jest.Mock).mockReturnValue(unblock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call block when `when` is true', () => {
    const { unmount } = render(<Prompt when={true} message="Are you sure you want to leave?" />);

    expect(locationService.block).toHaveBeenCalled();
    unmount();
    expect(unblock).toHaveBeenCalled();
  });

  it('should not call block when `when` is false', () => {
    const { unmount } = render(<Prompt when={false} message="Are you sure you want to leave?" />);

    unmount();
    expect(locationService.block).not.toHaveBeenCalled();
  });

  it('should use the message function if provided', () => {
    const messageFn = jest.fn().mockReturnValue('Custom message');
    render(<Prompt when={true} message={messageFn} />);

    const callback = (locationService.block as jest.Mock).mock.calls[0][0];
    callback({ pathname: '/new-path' } as GrafanaLocation);

    expect(messageFn).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/new-path' }));
  });
});
