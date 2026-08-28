import fs from 'fs';
import path from 'path';

import { NewThemeOptionsSchema } from './createTheme';
import { getBuiltInThemes, getThemeById } from './registry';

const themeIdentitySchema = NewThemeOptionsSchema.pick({ id: true, name: true });
const themeDefinitionsDirectory = path.join(__dirname, 'themeDefinitions');
const themeDefinitions = fs
  .readdirSync(themeDefinitionsDirectory)
  .filter((fileName) => fileName.endsWith('.json'))
  .sort()
  .map((fileName) => {
    const definition = fs.readFileSync(path.join(themeDefinitionsDirectory, fileName), 'utf8');
    return themeIdentitySchema.parse(JSON.parse(definition));
  });

describe('theme registry', () => {
  it.each(themeDefinitions)('registers and builds $id', ({ id, name }) => {
    const registeredTheme = getBuiltInThemes([id]).find((theme) => theme.id === id);

    expect(registeredTheme).toMatchObject({ id, name, isExtra: true });
    expect(getThemeById(id).name).toBe(name);
  });

  it('registers SpaceX AI as an extra dark theme', () => {
    const registeredTheme = getBuiltInThemes(['spacexai']).find((theme) => theme.id === 'spacexai');
    const builtTheme = getThemeById('spacexai');

    expect(registeredTheme).toMatchObject({ id: 'spacexai', name: 'SpaceX AI', isExtra: true });
    expect(builtTheme.name).toBe('SpaceX AI');
    expect(builtTheme.isDark).toBe(true);
  });

  it('filters SpaceX AI with the extra theme allowlist', () => {
    expect(getBuiltInThemes(['spacexai']).map((theme) => theme.id)).toContain('spacexai');
    expect(getBuiltInThemes([]).map((theme) => theme.id)).not.toContain('spacexai');
  });
});
