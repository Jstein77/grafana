import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from 'app/store/configureStore';

import { QueriesDrawerContextProvider, useQueriesDrawerContext } from './QueriesDrawerContext';

function DrawerConsumer() {
  const { drawerOpened, setDrawerOpened } = useQueriesDrawerContext();
  return (
    <button type="button" onClick={() => setDrawerOpened(true)}>
      {drawerOpened ? 'open' : 'closed'}
    </button>
  );
}

describe('QueriesDrawerContextProvider scoping', () => {
  it('provides drawer state to Explore consumers', async () => {
    const store = configureStore();
    render(
      <Provider store={store}>
        <QueriesDrawerContextProvider>
          <DrawerConsumer />
        </QueriesDrawerContextProvider>
      </Provider>
    );

    expect(screen.getByRole('button', { name: 'closed' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'closed' }));
    expect(await screen.findByRole('button', { name: 'open' })).toBeInTheDocument();
  });
});
