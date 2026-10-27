import { getSelectableThemes } from './getSelectableThemes';

describe('getSelectableThemes', () => {
  it('includes the SpaceX AI theme as a selectable extra', () => {
    const themes = getSelectableThemes();
    const spacexai = themes.find((theme) => theme.id === 'spacexai');

    expect(spacexai).toMatchObject({ id: 'spacexai', name: 'SpaceX AI', isExtra: true });
  });
});
