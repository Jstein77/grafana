import { getSelectableThemes } from './getSelectableThemes';

describe('getSelectableThemes', () => {
  it('includes the SpaceX AI extra theme', () => {
    const themes = getSelectableThemes();
    const spacexai = themes.find((theme) => theme.id === 'spacexai');

    expect(spacexai).toBeDefined();
    expect(spacexai?.name).toBe('SpaceX AI');
    expect(spacexai?.isExtra).toBe(true);

    const built = spacexai?.build();
    expect(built?.isDark).toBe(true);
    expect(built?.colors.mode).toBe('dark');
    expect(built?.colors.primary.main).toBe('#F54E00');
    expect(built?.colors.accent.main).toBe('#F54E00');
    expect(built?.colors.background.canvas).toBe('#050505');
  });

  it('still includes existing extras', () => {
    const ids = getSelectableThemes().map((theme) => theme.id);

    expect(ids).toContain('tron');
    expect(ids).toContain('gloom');
  });
});
