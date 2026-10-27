import fs from 'fs';
import path from 'path';

import { NewThemeOptionsSchema } from './createTheme';
import { getBuiltInThemes } from './registry';

const definitionsDir = path.join(__dirname, 'themeDefinitions');
const definitions = fs
  .readdirSync(definitionsDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => ({ file, json: JSON.parse(fs.readFileSync(path.join(definitionsDir, file), 'utf8')) }));

describe('theme registry', () => {
  it.each(definitions)('registers $file as an extra theme under its JSON id', ({ file, json }) => {
    expect(NewThemeOptionsSchema.safeParse(json).success).toBe(true);
    expect(file).toBe(`${json.id}.json`);
    expect(getBuiltInThemes([json.id]).find((item) => item.id === json.id)).toMatchObject({
      id: json.id,
      name: json.name,
      isExtra: true,
    });
  });

  it('gives every theme a unique name, since the theme drawer matches the current theme by name', () => {
    const names = getBuiltInThemes(definitions.map(({ json }) => json.id)).map((item) => item.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
