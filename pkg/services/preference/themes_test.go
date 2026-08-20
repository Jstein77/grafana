package pref

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestSpaceXAITheme(t *testing.T) {
	theme := GetThemeByID("spacexai")

	require.NotNil(t, theme)
	require.Equal(t, "dark", theme.Type)
	require.True(t, theme.IsExtra)
	require.True(t, IsValidThemeID("spacexai"))
}
