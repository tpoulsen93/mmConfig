# mmConfig

MagicMirror configuration repository.

This repository is intended to be the live `config/` directory inside a MagicMirror checkout.

## Layout

The repository root matches the contents of MagicMirror's `config/` directory directly.

## Local Secrets

Keep local secrets in `config.env`.

- `config.env` is ignored by Git.
- `config.env.example` is the publish-safe template.

## How It Is Wired

This directory is a nested Git repository inside a separate MagicMirror checkout.

- Parent repo: `/home/tp/MagicMirror`
- Config repo: `/home/tp/MagicMirror/config`
- Config remote: `https://github.com/tpoulsen93/mmConfig.git`

The parent MagicMirror repository ignores `config/`, so this repository keeps its own Git history, branches, remotes, and commits without affecting the upstream MagicMirror repo.

## Daily Workflow

You can work with the config repository in either of these ways.

From inside the config directory:

```bash
cd /home/tp/MagicMirror/config
git status
git pull --ff-only origin main
git push origin main
```

From the MagicMirror root:

```bash
cd /home/tp/MagicMirror
git -C config status
git -C config pull --ff-only origin main
git -C config push origin main
```

## Why This Layout

This avoids copying files between repositories.

- MagicMirror reads the live files directly from `config/`
- `mmConfig` keeps a separate repository identity
- You can push and pull config changes from the same working tree
- Secrets remain local through `config.env`

## Env Caveats

Two MagicMirror core behaviors matter when `hideConfigSecrets: true` is enabled and secrets are injected from `config.env`.

### Calendar URLs

For private calendar feeds, store the real fetchable URL in `config.env`.

- Use `https://...` for iCloud published calendar URLs.
- Do not rely on `webcal://...` inside a secret placeholder.

Why: the calendar module rewrites `webcal://` on the client side, but secret placeholders are only restored later in the node-helper socket path. If the config contains a secret-backed `webcal://` URL, the client-side rewrite is skipped.

### Weather Coordinates

For weather module configs, keep secret-backed coordinates as strings in `config.js`.

- Use `lat: "${SECRET_HOME_LAT}"`
- Use `lon: "${SECRET_HOME_LON}"`
- Do not wrap those placeholders in `Number(...)` for weather modules

Why: the browser receives the redacted config, and `Number("**SECRET_HOME_LAT**")` becomes `NaN`, which is serialized to `null` before the weather module sends `INIT_WEATHER` to its node helper. Keeping the values as strings allows the socket-side secret restoration to recover the real coordinates before the Open-Meteo provider builds its request.

This is a good upstream bug candidate to revisit later.

## MMM-CalendarExt3 Notes

There is also a local behavior fix in the `MMM-CalendarExt3` popup day view that is worth contributing upstream.

### Day Popover Overflow

When a day contains many events, the popup event list can be cut off at the bottom instead of scrolling.

Current local fix:

- Make `#CX3_POPOVER` a flex column container
- Make `.container` and `.content` participate in the available height
- Keep `.content` scrollable with `overflow-y: auto`

Why: the popover already had a max height, but the inner content area was not fully constrained as a flexed scroll region, so long event lists could overflow and get clipped.

### Day Popover Outside Clicks

Clicking outside the popup should dismiss it without triggering the calendar cell underneath.

Current local fix:

- Add capture-phase `pointerdown` and `click` listeners when preparing the popover
- If the popover is open and the click target is outside it, prevent default, stop propagation, and hide the popover

Why: without interception, the dismissal click falls through to the underlying day cell and immediately opens another day popup.

This is another good upstream bug candidate to revisit later.
