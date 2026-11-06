import { getBuiltInThemes, getThemeById } from './registry';

describe('theme registry', () => {
  it('includes spacexai when allowed', () => {
    const ids = getBuiltInThemes(['spacexai']).map((t) => t.id);
    expect(ids).toContain('spacexai');
  });

  it('excludes spacexai when not allowed', () => {
    const ids = getBuiltInThemes([]).map((t) => t.id);
    expect(ids).not.toContain('spacexai');
  });

  it('builds the spacexai theme', () => {
    const theme = getThemeById('spacexai');
    expect(theme.name).toBe('SpaceX AI');
    expect(theme.isDark).toBe(true);
    expect(theme.colors.primary.main).toBe('#FF5A1F');
    expect(theme.colors.background.canvas).toBe('#000000');
  });
});
