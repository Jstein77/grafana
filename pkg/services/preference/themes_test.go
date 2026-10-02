package pref

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestIsValidThemeID(t *testing.T) {
	require.True(t, IsValidThemeID("spacexai"))
	require.True(t, IsValidThemeID("dark"))
	require.False(t, IsValidThemeID("not-a-real-theme"))

	theme := GetThemeByID("spacexai")
	require.NotNil(t, theme)
	require.Equal(t, "dark", theme.Type)
	require.True(t, theme.IsExtra)
}
