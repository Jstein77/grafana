import { NewThemeOptionsSchema } from './createTheme';
import { getBuiltInThemes, getThemeById } from './registry';
import spacexai from './themeDefinitions/spacexai.json';

describe('theme registry', () => {
  describe('spacexai', () => {
    it('is a valid theme definition', () => {
      expect(NewThemeOptionsSchema.safeParse(spacexai).success).toBe(true);
    });

    it('builds a dark theme with the orange accent', () => {
      const theme = getThemeById('spacexai');
      expect(theme.name).toBe('SpaceX AI');
      expect(theme.isDark).toBe(true);
      expect(theme.colors.primary.main).toBe('#FF5A1F');
      expect(theme.colors.background.canvas).toBe('#050505');
    });

    it('is only listed when allowed as an extra theme', () => {
      expect(getBuiltInThemes([]).map((t) => t.id)).not.toContain('spacexai');
      expect(getBuiltInThemes(['spacexai']).map((t) => t.id)).toContain('spacexai');
    });
  });
});
