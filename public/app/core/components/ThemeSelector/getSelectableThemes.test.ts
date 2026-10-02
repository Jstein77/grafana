import { getThemeById } from '@grafana/data';

import { getSelectableThemes } from './getSelectableThemes';

describe('getSelectableThemes', () => {
  it('includes SpaceX AI as a selectable dark theme', () => {
    const themes = getSelectableThemes();

    expect(themes.find((theme) => theme.id === 'spacexai')).toMatchObject({
      id: 'spacexai',
      name: 'SpaceX AI',
      isExtra: true,
    });

    const theme = getThemeById('spacexai');
    expect(theme.name).toBe('SpaceX AI');
    expect(theme.isDark).toBe(true);
    expect(theme.colors.mode).toBe('dark');
    expect(theme.colors.background.canvas).toBe('#050607');
    expect(theme.colors.text.primary).toBe('#F2F5F8');
    expect(theme.colors.primary.main).toBe('#7EC8FF');
  });
});
