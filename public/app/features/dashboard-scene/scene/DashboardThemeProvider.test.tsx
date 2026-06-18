import React from 'react';
import { render, screen } from '@testing-library/react';

import { createTheme, ThemeContext } from '@grafana/data';

import { DashboardThemeProvider } from './DashboardThemeProvider';

function ThemeConsumer() {
  const theme = React.useContext(ThemeContext);
  return <div data-testid="theme-mode">{theme.isDark ? 'dark' : 'light'}</div>;
}

describe('DashboardThemeProvider', () => {
  const globalTheme = createTheme({ colors: { mode: 'dark' } });

  function renderWithGlobalTheme(style?: string) {
    return render(
      <ThemeContext.Provider value={globalTheme}>
        <DashboardThemeProvider style={style}>
          <ThemeConsumer />
        </DashboardThemeProvider>
      </ThemeContext.Provider>
    );
  }

  it('uses the global theme when no dashboard style is set', () => {
    renderWithGlobalTheme();
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
  });

  it('overrides the global theme when a dashboard style is set', () => {
    renderWithGlobalTheme('light');
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
  });
});
