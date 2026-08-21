import { getSelectableThemes } from './getSelectableThemes';

describe('getSelectableThemes', () => {
  it('includes the spacexai extra theme', () => {
    const spacexai = getSelectableThemes().find((theme) => theme.id === 'spacexai');

    expect(spacexai).toBeDefined();
    expect(spacexai?.isExtra).toBe(true);
    expect(spacexai?.name).toBe('SpaceXAI');
  });
});
