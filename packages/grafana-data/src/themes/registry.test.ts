import { getBuiltInThemes, getThemeById } from './registry';

describe('getBuiltInThemes', () => {
  it('excludes extra themes not in the allow-list', () => {
    const themes = getBuiltInThemes([]);
    expect(themes.find((theme) => theme.id === 'spacexai')).toBeUndefined();
  });

  it('includes an extra theme once it is allow-listed', () => {
    const themes = getBuiltInThemes(['spacexai']);
    const spacexai = themes.find((theme) => theme.id === 'spacexai');

    expect(spacexai).toMatchObject({ id: 'spacexai', name: 'SpaceX AI', isExtra: true });
  });
});

describe('getThemeById', () => {
  it('builds a dark, high-contrast theme for the SpaceX AI extra theme', () => {
    const theme = getThemeById('spacexai');

    expect(theme.isDark).toBe(true);
    expect(theme.colors.primary.main).toBe('#FF3D12');
  });

  it('falls back to the default dark theme for an unknown id', () => {
    const theme = getThemeById('not-a-real-theme');
    expect(theme.isDark).toBe(true);
  });
});
