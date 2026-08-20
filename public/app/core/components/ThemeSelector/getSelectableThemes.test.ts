import { getSelectableThemes } from './getSelectableThemes';

describe('getSelectableThemes', () => {
  it('includes SpaceX AI as an experimental theme', () => {
    expect(getSelectableThemes()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'spacexai',
          name: 'SpaceX AI',
          isExtra: true,
        }),
      ])
    );
  });
});
