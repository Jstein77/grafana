import { getThemeById } from './registry';

describe('theme registry', () => {
  it('registers the SpaceX AI extra theme', () => {
    const theme = getThemeById('spacexai');

    expect(theme.name).toBe('SpaceX AI');
    expect(theme.isDark).toBe(true);
    expect(theme.colors.mode).toBe('dark');
    expect(theme.colors.primary.main).toBe('#FF4D1A');
    expect(theme.colors.background.canvas).toBe('#07080A');
  });
});
