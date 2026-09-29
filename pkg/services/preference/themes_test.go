package pref

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestIsValidThemeID_SpaceXAI(t *testing.T) {
	require.True(t, IsValidThemeID("spacexai"))

	theme := GetThemeByID("spacexai")
	require.NotNil(t, theme)
	require.Equal(t, "dark", theme.Type)
	require.True(t, theme.IsExtra)
}
