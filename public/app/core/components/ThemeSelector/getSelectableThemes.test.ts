import { getSelectableThemes } from './getSelectableThemes';

describe('getSelectableThemes', () => {
  it('includes the matrix green theme among selectable extras', () => {
    const themes = getSelectableThemes();
    expect(themes.some((theme) => theme.id === 'matrix')).toBe(true);
  });
});
