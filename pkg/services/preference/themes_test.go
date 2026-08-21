package pref

import "testing"

func TestIsValidThemeID_SpaceXAI(t *testing.T) {
	if !IsValidThemeID("spacexai") {
		t.Fatal("expected spacexai to be a valid theme ID")
	}

	theme := GetThemeByID("spacexai")
	if theme == nil {
		t.Fatal("expected spacexai theme DTO")
	}
	if theme.ID != "spacexai" || theme.Type != "dark" || !theme.IsExtra {
		t.Fatalf("unexpected theme DTO: %+v", theme)
	}
}
