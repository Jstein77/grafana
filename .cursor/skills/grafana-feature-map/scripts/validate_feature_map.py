#!/usr/bin/env python3

import re
import sys
from pathlib import Path


AREAS = {
    "explore.md": "Explore",
    "dashboards.md": "Dashboards",
    "alerting.md": "Alerting",
    "connections.md": "Connections",
    "administration.md": "Administration",
    "plugins.md": "Plugins",
}

REQUIRED_SECTIONS = [
    "User capabilities",
    "Entry points",
    "Source anchors",
    "Boundaries and change paths",
    "Verification anchors",
    "Gotchas",
]


def repository_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / ".git").exists():
            return candidate
    raise RuntimeError("could not locate repository root")


def section(text: str, heading: str) -> str:
    match = re.search(rf"^## {re.escape(heading)}\n(.*?)(?=^## |\Z)", text, re.MULTILINE | re.DOTALL)
    return match.group(1) if match else ""


def validate() -> list[str]:
    script = Path(__file__).resolve()
    skill_root = script.parents[1]
    feature_root = skill_root / "features"
    repo_root = repository_root(skill_root)
    errors: list[str] = []

    skill_text = (skill_root / "SKILL.md").read_text()
    frontmatter = re.match(r"^---\n(.*?)\n---\n", skill_text, re.DOTALL)
    if not frontmatter:
        errors.append("SKILL.md: missing YAML frontmatter")
    else:
        for key in ("name:", "description:"):
            if not re.search(rf"^{re.escape(key)}\s+\S", frontmatter.group(1), re.MULTILINE):
                errors.append(f"SKILL.md: missing {key[:-1]}")

    index_text = (feature_root / "README.md").read_text()
    actual_files = {path.name for path in feature_root.glob("*.md") if path.name != "README.md"}
    expected_files = set(AREAS)
    for missing in sorted(expected_files - actual_files):
        errors.append(f"features: missing {missing}")
    for extra in sorted(actual_files - expected_files):
        errors.append(f"features: unindexed file {extra}")

    for filename, title in AREAS.items():
        path = feature_root / filename
        if not path.exists():
            continue

        expected_link = f"[{title}]({filename})"
        if expected_link not in index_text:
            errors.append(f"features/README.md: missing {expected_link}")

        text = path.read_text()
        if not text.startswith(f"# {title}\n"):
            errors.append(f"features/{filename}: expected title '# {title}'")

        headings = re.findall(r"^## (.+)$", text, re.MULTILINE)
        if headings != REQUIRED_SECTIONS:
            errors.append(
                f"features/{filename}: sections must be {', '.join(REQUIRED_SECTIONS)} in order"
            )

        anchors = re.findall(r"^- `([^`]+)`", section(text, "Source anchors"), re.MULTILINE)
        if not anchors:
            errors.append(f"features/{filename}: no source anchors")
        for anchor in anchors:
            if not (repo_root / anchor).exists():
                errors.append(f"features/{filename}: missing source anchor {anchor}")

    return errors


def main() -> int:
    errors = validate()
    if errors:
        for error in errors:
            print(f"ERROR {error}")
        return 1

    print(f"grafana-feature-map valid: {len(AREAS)} areas, all source anchors present")
    return 0


if __name__ == "__main__":
    sys.exit(main())
