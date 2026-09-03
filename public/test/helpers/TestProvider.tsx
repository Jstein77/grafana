import { OpenFeatureProvider } from '@openfeature/react-sdk';
import { type Store } from '@reduxjs/toolkit';
import * as React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { getGrafanaContextMock } from 'test/mocks/getGrafanaContextMock';

import { locationService, LocationServiceProvider } from '@grafana/runtime';
import { getTestFeatureFlagClient } from '@grafana/test-utils/unstable';
import { ModalRoot } from '@grafana/ui';
import { GrafanaContext, type GrafanaContextType } from 'app/core/context/GrafanaContext';
import { ModalsContextProvider } from 'app/core/context/ModalsContextProvider';
import { createDataRouter } from 'app/core/navigation/createDataRouter';
import { configureStore } from 'app/store/configureStore';
import { type StoreState } from 'app/types/store';

export interface Props {
  storeState?: Partial<StoreState>;
  store?: Store<StoreState>;
  children: React.ReactNode;
  grafanaContext?: GrafanaContextType;
}

const TestProviderContext = React.createContext<Pick<Props, 'children' | 'grafanaContext'> | undefined>(undefined);

function TestProviderContent() {
  const props = React.useContext(TestProviderContext);
  if (!props) {
    throw new Error('TestProviderContent must be used within TestProvider');
  }

  const context = {
    ...getGrafanaContextMock(),
    ...props.grafanaContext,
  };

  return (
    <ModalsContextProvider>
      <GrafanaContext.Provider value={context}>{props.children}</GrafanaContext.Provider>
      <ModalRoot />
    </ModalsContextProvider>
  );
}

/**
 * Wrapps component in redux store provider, Router and GrafanaContext
 *
 * @deprecated Use `test/test-utils` `render` method instead
 */
export function TestProvider(props: Props) {
  const { store = configureStore(props.storeState), children } = props;
  const router = React.useMemo(
    () =>
      createDataRouter(locationService, <TestProviderContent />, {
        initialEntries: [locationService.getLocation()],
      }),
    []
  );

  return (
    <Provider store={store}>
      <OpenFeatureProvider client={getTestFeatureFlagClient()}>
        <TestProviderContext.Provider value={{ children, grafanaContext: props.grafanaContext }}>
          <LocationServiceProvider service={locationService}>
            <RouterProvider router={router} future={{ v7_startTransition: true }} />
          </LocationServiceProvider>
        </TestProviderContext.Provider>
      </OpenFeatureProvider>
    </Provider>
  );
}
