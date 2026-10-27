package pref

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/require"
)

const preferencesThemeColumnLength = 20

func TestGeneratedThemesMatchThemeDefinitions(t *testing.T) {
	dir := filepath.Join("..", "..", "..", "packages", "grafana-data", "src", "themes", "themeDefinitions")
	files, err := filepath.Glob(filepath.Join(dir, "*.json"))
	require.NoError(t, err)
	require.NotEmpty(t, files)

	want := map[string]string{}
	for _, file := range files {
		raw, err := os.ReadFile(file)
		require.NoError(t, err)
		var def struct {
			ID     string `json:"id"`
			Colors struct {
				Mode string `json:"mode"`
			} `json:"colors"`
		}
		require.NoError(t, json.Unmarshal(raw, &def), file)
		require.LessOrEqual(t, len(def.ID), preferencesThemeColumnLength, "%s: id %q does not fit preferences.theme", file, def.ID)
		require.Contains(t, []string{"dark", "light"}, def.Colors.Mode, "%s: colors.mode must be dark or light", file)
		want[def.ID] = def.Colors.Mode
	}

	got := map[string]string{}
	for _, theme := range themes {
		if theme.IsExtra {
			got[theme.ID] = theme.Type
		}
	}
	require.Equal(t, want, got, "themes_generated.go is out of date. Run `make gen-themes`.")
}
