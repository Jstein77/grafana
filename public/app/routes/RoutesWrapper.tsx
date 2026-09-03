import { createContext, type ComponentType, type ReactNode, type JSX, useContext } from 'react';
import { RouterProvider } from 'react-router-dom';

import { config, locationService, LocationServiceProvider } from '@grafana/runtime';
import { ModalRoot, Stack } from '@grafana/ui';

import { AppChrome } from '../core/components/AppChrome/AppChrome';
import { AppChromeExtensionPoint } from '../core/components/AppChrome/AppChromeExtensionPoint';
import { AppNotificationList } from '../core/components/AppNotifications/AppNotificationList';
import { ModalsContextProvider } from '../core/context/ModalsContextProvider';
import { createDataRouter } from '../core/navigation/createDataRouter';
import { QueriesDrawerContextProvider } from '../features/explore/QueriesDrawer/QueriesDrawerContext';

function ExtraProviders(props: { children: ReactNode; providers: Array<ComponentType<{ children: ReactNode }>> }) {
  return props.providers.reduce((tree, Provider): ReactNode => {
    return <Provider>{tree}</Provider>;
  }, props.children);
}

type RouterWrapperProps = {
  routes?: JSX.Element | false;
  bodyRenderHooks: ComponentType[];
  pageBanners: ComponentType[];
  providers: Array<ComponentType<{ children: ReactNode }>>;
};

const RouterWrapperContext = createContext<RouterWrapperProps | undefined>(undefined);

function RouterContent() {
  const props = useContext(RouterWrapperContext);
  if (!props) {
    throw new Error('RouterContent must be used within RouterWrapper');
  }

  return (
    <QueriesDrawerContextProvider>
      <ExtraProviders providers={props.providers}>
        <ModalsContextProvider>
          <AppChrome>
            <AppNotificationList />
            <Stack gap={0} grow={1} direction="column">
              <AppChromeExtensionPoint />
              {props.pageBanners.map((Banner, index) => (
                <Banner key={index.toString()} />
              ))}
              {props.routes}
            </Stack>
            {props.bodyRenderHooks.map((Hook, index) => (
              <Hook key={index.toString()} />
            ))}
          </AppChrome>
          <ModalRoot />
        </ModalsContextProvider>
      </ExtraProviders>
    </QueriesDrawerContextProvider>
  );
}

const router = createDataRouter(locationService, <RouterContent />, {
  basename: config.appSubUrl || undefined,
});

export function RouterWrapper(props: RouterWrapperProps) {
  return (
    <RouterWrapperContext.Provider value={props}>
      <LocationServiceProvider service={locationService}>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </LocationServiceProvider>
    </RouterWrapperContext.Provider>
  );
}
