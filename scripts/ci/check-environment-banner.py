#!/usr/bin/env python3
"""PR contract for the environment status banner.

While the seed bug is still present (`buildInfo.env === 'prod'`), this is a
no-op so unrelated PRs stay green. Once a PR starts implementing the banner,
the contract requires Grafana e2e selectors and an accessible status role.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BANNER = ROOT / "public/app/core/components/AppChrome/EnvironmentBanner/EnvironmentBanner.tsx"
SELECTORS = ROOT / "packages/grafana-e2e-selectors/src/selectors/components.ts"


def main() -> int:
    if not BANNER.is_file():
        print(f"missing {BANNER.relative_to(ROOT)}", file=sys.stderr)
        return 1

    src = BANNER.read_text()
    if re.search(r"""env\s*===\s*['\"]prod['\"]""", src):
        print("Environment banner still on the seed baseline; contract skipped.")
        return 0

    errors: list[str] = []

    if not re.search(r"""role=["']status["']""", src):
        errors.append('EnvironmentBanner must set role="status" on the banner container.')

    if "@grafana/e2e-selectors" not in src:
        errors.append("EnvironmentBanner must import selectors from @grafana/e2e-selectors.")

    sel = SELECTORS.read_text() if SELECTORS.is_file() else ""
    if "EnvironmentBanner:" not in sel:
        errors.append(
            "Register selectors.components.EnvironmentBanner in "
            "packages/grafana-e2e-selectors/src/selectors/components.ts "
            "(container + dismissButton, versioned, data-testid prefixed)."
        )
    else:
        block = sel.split("EnvironmentBanner:", 1)[1][:800]
        if "container:" not in block:
            errors.append("EnvironmentBanner.container selector is missing.")
        if "dismissButton:" not in block:
            errors.append("EnvironmentBanner.dismissButton selector is missing.")

    if errors:
        print("Environment banner CI contract failed:")
        for item in errors:
            print(f"  - {item}")
        return 1

    print("Environment banner CI contract passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
