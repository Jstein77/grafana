import type * as H from 'history';
import { type ComponentProps } from 'react';
import { unstable_HistoryRouter } from 'react-router-dom-v5-compat';

type RouterHistory = ComponentProps<typeof unstable_HistoryRouter>['history'];
type RouterLocation = RouterHistory['location'];

function toRouterLocation(location: H.Location): RouterLocation {
  return {
    ...location,
    key: location.key ?? 'default',
  };
}

export function createHistoryRouterAdapter(history: H.History): RouterHistory {
  return {
    get action() {
      return history.action as RouterHistory['action'];
    },
    get location() {
      return toRouterLocation(history.location);
    },
    createHref(to) {
      return history.createHref(typeof to === 'string' ? H.parsePath(to) : to);
    },
    push(to, state) {
      history.push(to, state);
    },
    replace(to, state) {
      history.replace(to, state);
    },
    go(delta) {
      history.go(delta);
    },
    back() {
      history.goBack();
    },
    forward() {
      history.goForward();
    },
    listen(listener) {
      return history.listen((location, action) => {
        listener({
          action: action as RouterHistory['action'],
          location: toRouterLocation(location),
        });
      });
    },
    block() {
      throw new Error('Navigation blocking must use React Router useBlocker');
    },
  };
}
