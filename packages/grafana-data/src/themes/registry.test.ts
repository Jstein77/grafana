import { getBuiltInThemes, getThemeById } from './registry';

describe('theme registry', () => {
  it('builds the SpaceX AI theme with its custom tokens', () => {
    const theme = getThemeById('spacexai');

    expect(theme.name).toBe('SpaceX AI');
    expect(theme.isDark).toBe(true);
    expect(theme.colors).toMatchObject({
      primary: { main: '#4DA8FF', contrastText: '#02050A' },
      background: { canvas: '#02050A', primary: '#080E17', elevated: '#121F2C' },
      action: { hover: 'rgba(77, 168, 255, 0.12)', selectedBorder: '#4DA8FF' },
    });
    expect(theme.typography).toMatchObject({
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontWeightMedium: 600,
      fontWeightBold: 700,
    });
    expect(theme.shape.radius).toMatchObject({ sm: '2px', default: '4px', lg: '8px' });
    expect(theme.shadows.z2).toContain('rgba(77, 168, 255, 0.08)');
    expect(theme.components).toMatchObject({
      input: { background: '#050A11', borderHover: '#4DA8FF' },
      panel: { background: '#080E17', borderColor: '#152536' },
      table: {
        rowHoverBackground: 'rgba(77, 168, 255, 0.1)',
        rowSelected: 'rgba(77, 168, 255, 0.18)',
      },
    });
    expect(theme.visualization.palette).toEqual(
      expect.arrayContaining(['#4DA8FF', '#8E7CFF', '#48D597', '#FFC857', '#FF5C72'])
    );
  });

  it('returns the SpaceX AI theme when it is allowed as an extra theme', () => {
    expect(getBuiltInThemes(['spacexai'])).toEqual(
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
