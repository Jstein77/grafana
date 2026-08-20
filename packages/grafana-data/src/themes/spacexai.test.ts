import { createTheme, NewThemeOptionsSchema } from './createTheme';
import { getBuiltInThemes, getThemeById } from './registry';
import spacexai from './themeDefinitions/spacexai.json';

describe('spacexai theme', () => {
  it('passes the theme options schema', () => {
    const result = NewThemeOptionsSchema.safeParse(spacexai);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('spacexai');
      expect(result.data.name).toBe('SpaceX AI');
    }
  });

  it('builds via getThemeById with expected tokens', () => {
    const theme = getThemeById('spacexai');

    expect(theme.name).toBe('SpaceX AI');
    expect(theme.isDark).toBe(true);
    expect(theme.colors.mode).toBe('dark');
    expect(theme.colors.background.canvas).toBe('#000000');
    expect(theme.colors.background.page).toBe('#050505');
    expect(theme.colors.primary.main).toBe('#FFFFFF');
    expect(theme.colors.accent.main).toBe('#5EB1FF');
    expect(theme.colors.action.selectedBorder).toBe('#5EB1FF');
    expect(theme.typography.fontFamily).toContain('Helvetica Neue');
  });

  it('is included when allowlisted for the theme selector', () => {
    const themes = getBuiltInThemes(['spacexai']);
    expect(themes.some((theme) => theme.id === 'spacexai')).toBe(true);
  });

  it('can be constructed with createTheme from the definition', () => {
    const parsed = NewThemeOptionsSchema.parse(spacexai);
    const theme = createTheme(parsed);
    expect(theme.colors.text.link).toBe('#5EB1FF');
    expect(theme.shape.radius.default).toBeTruthy();
  });
});
