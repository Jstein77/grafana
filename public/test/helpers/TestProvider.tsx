import { OpenFeatureProvider } from '@openfeature/react-sdk';
import { type Store } from '@reduxjs/toolkit';
import * as React from 'react';
import { Provider } from 'react-redux';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom-v5-compat';
import { getGrafanaContextMock } from 'test/mocks/getGrafanaContextMock';

import { locationService, LocationServiceProvider } from '@grafana/runtime';
import { getTestFeatureFlagClient } from '@grafana/test-utils/unstable';
import { ModalRoot } from '@grafana/ui';
import { GrafanaContext, type GrafanaContextType } from 'app/core/context/GrafanaContext';
import { ModalsContextProvider } from 'app/core/context/ModalsContextProvider';
import { createHistoryRouterAdapter } from 'app/core/navigation/historyRouterAdapter';
import { configureStore } from 'app/store/configureStore';
import { type StoreState } from 'app/types/store';

export interface Props {
  storeState?: Partial<StoreState>;
  store?: Store<StoreState>;
  children: React.ReactNode;
  grafanaContext?: GrafanaContextType;
}

/**
 * Wrapps component in redux store provider, Router and GrafanaContext
 *
 * @deprecated Use `test/test-utils` `render` method instead
 */
export function TestProvider(props: Props) {
  const { store = configureStore(props.storeState), children } = props;
  const history = createHistoryRouterAdapter(locationService.getHistory());

  const context = {
    ...getGrafanaContextMock(),
    ...props.grafanaContext,
  };

  return (
    <Provider store={store}>
      <OpenFeatureProvider client={getTestFeatureFlagClient()}>
        <HistoryRouter history={history} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <LocationServiceProvider service={locationService}>
            <ModalsContextProvider>
              <GrafanaContext.Provider value={context}>{children}</GrafanaContext.Provider>
              <ModalRoot />
            </ModalsContextProvider>
          </LocationServiceProvider>
        </HistoryRouter>
      </OpenFeatureProvider>
    </Provider>
  );
}
