import { getSelectableThemes } from './getSelectableThemes';

describe('getSelectableThemes', () => {
  it('includes the spacexai experimental theme', () => {
    const themes = getSelectableThemes();
    const spacexai = themes.find((theme) => theme.id === 'spacexai');

    expect(spacexai).toBeDefined();
    expect(spacexai?.name).toBe('SpaceX AI');
    expect(spacexai?.isExtra).toBe(true);
    expect(spacexai?.build().colors.mode).toBe('dark');
  });
});
