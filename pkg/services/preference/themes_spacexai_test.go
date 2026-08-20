package pref

import "testing"

func TestIsValidThemeID_SpaceXAI(t *testing.T) {
	if !IsValidThemeID("spacexai") {
		t.Fatalf("expected spacexai to be a valid theme id")
	}

	theme := GetThemeByID("spacexai")
	if theme == nil {
		t.Fatal("expected GetThemeByID(spacexai) to return a theme")
	}
	if theme.Type != "dark" {
		t.Fatalf("expected spacexai type dark, got %s", theme.Type)
	}
	if !theme.IsExtra {
		t.Fatal("expected spacexai to be marked as an extra theme")
	}
}
