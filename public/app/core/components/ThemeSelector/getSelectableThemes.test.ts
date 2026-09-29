import { getThemeById } from '@grafana/data';

import { getSelectableThemes } from './getSelectableThemes';

describe('getSelectableThemes', () => {
  it('includes the SpaceX AI extra theme', () => {
    const spacexai = getSelectableThemes().find((theme) => theme.id === 'spacexai');

    expect(spacexai).toMatchObject({
      id: 'spacexai',
      name: 'SpaceX AI',
      isExtra: true,
    });
  });

  it('builds a dark launch-control theme with the orange accent', () => {
    const theme = getThemeById('spacexai');

    expect(theme.isDark).toBe(true);
    expect(theme.colors.mode).toBe('dark');
    expect(theme.colors.background.canvas).toBe('#050505');
    expect(theme.colors.text.primary).toBe('#F4F4F4');
    expect(theme.colors.text.maxContrast).toBe('#FFFFFF');
    expect(theme.colors.primary.main).toBe('#FF5A1F');
    expect(theme.colors.accent.main).toBe('#FF5A1F');
  });
});
