import { getSelectableThemes } from './getSelectableThemes';

describe('getSelectableThemes', () => {
  it('offers the SpaceX AI theme as an experimental extra', () => {
    const spacexai = getSelectableThemes().find((theme) => theme.id === 'spacexai');

    expect(spacexai).toMatchObject({ name: 'SpaceX AI', isExtra: true });
  });

  it('builds the SpaceX AI theme as a dark theme with an orange accent', () => {
    const spacexai = getSelectableThemes().find((theme) => theme.id === 'spacexai');
    const theme = spacexai!.build();

    expect(theme.isDark).toBe(true);
    expect(theme.colors.background.canvas).toBe('#000000');
    expect(theme.colors.primary.main).toBe('#FF5C1A');
  });
});
