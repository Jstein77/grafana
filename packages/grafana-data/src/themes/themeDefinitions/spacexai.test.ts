import { NewThemeOptionsSchema } from '../createTheme';
import { getThemeById } from '../registry';

import spacexai from './spacexai.json';

describe('spacexai theme', () => {
  it('matches the theme options schema', () => {
    const result = NewThemeOptionsSchema.safeParse(spacexai);
    expect(result.success).toBe(true);
  });

  it('is registered and builds SpaceXAI tokens', () => {
    const theme = getThemeById('spacexai');

    expect(theme.name).toBe('SpaceXAI');
    expect(theme.isDark).toBe(true);
    expect(theme.colors.primary.main).toBe('#f54e00');
    expect(theme.colors.accent.main).toBe('#f54e00');
    expect(theme.colors.background.canvas).toBe('#14120b');
    expect(theme.colors.background.primary).toBe('#1d1b15');
    expect(theme.colors.background.elevated).toBe('#26241e');
    expect(theme.colors.text.primary).toBe('#edecec');
    expect(theme.colors.text.link).toBe('#f54e00');
    expect(theme.colors.action.selectedBorder).toBe('#f54e00');
    expect(theme.colors.action.hover).toBe('rgba(245, 78, 0, 0.12)');
    expect(theme.typography.fontFamily).toContain('Inter');
    expect(theme.typography.fontWeightBold).toBe(600);
    expect(theme.shape.radius.md).toBe('8px');
    expect(theme.components.panel.background).toBe('#1d1b15');
    expect(theme.components.input.borderHover).toBe('#f54e00');
  });
});
