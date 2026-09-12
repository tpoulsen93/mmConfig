#!/usr/bin/env bash

set -Eeuo pipefail

CONFIG_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
MAGICMIRROR_DIR="${MAGICMIRROR_DIR:-$(cd -- "$CONFIG_DIR/.." && pwd)}"
MODULES_DIR="$MAGICMIRROR_DIR/modules"
LOCAL_MODULES_DIR="$CONFIG_DIR/module-sources"
DRY_RUN=false

usage() {
	cat <<'EOF'
Usage: ./install-modules.sh [--dry-run]

Install the third-party and local MagicMirror modules enabled in config.js.

Options:
  --dry-run  Show what would be installed without changing anything.
  -h, --help Show this help message.

Set MAGICMIRROR_DIR to install into a MagicMirror checkout other than the
parent directory of this config repository.
EOF
}

while (( $# > 0 )); do
	case "$1" in
		--dry-run)
			DRY_RUN=true
			;;
		-h|--help)
			usage
			exit 0
			;;
		*)
			printf 'Unknown option: %s\n' "$1" >&2
			usage >&2
			exit 2
			;;
	esac
	shift
done

if [[ ! -d "$MODULES_DIR" ]]; then
	printf 'MagicMirror modules directory not found: %s\n' "$MODULES_DIR" >&2
	exit 1
fi

install_from_git() {
	local name="$1"
	local repository="$2"
	local install_dependencies="$3"
	local target="$MODULES_DIR/$name"

	if [[ -e "$target" ]]; then
		printf 'Already installed: %s\n' "$name"
		return
	fi

	printf 'Installing %s from %s\n' "$name" "$repository"
	if [[ "$DRY_RUN" == true ]]; then
		return
	fi

	git clone --depth 1 "$repository" "$target"
	if [[ "$install_dependencies" == true ]]; then
		(
			cd -- "$target"
			npm install --omit=dev
		)
	fi
}

install_local() {
	local name="$1"
	local source="$LOCAL_MODULES_DIR/$name"
	local target="$MODULES_DIR/$name"

	if [[ -e "$target" ]]; then
		printf 'Already installed: %s\n' "$name"
		return
	fi

	if [[ ! -d "$source" ]]; then
		printf 'Local module source not found: %s\n' "$source" >&2
		exit 1
	fi

	printf 'Installing local module: %s\n' "$name"
	if [[ "$DRY_RUN" == false ]]; then
		cp -R -- "$source" "$target"
	fi
}

command -v git >/dev/null || { printf 'git is required.\n' >&2; exit 1; }
command -v npm >/dev/null || { printf 'npm is required.\n' >&2; exit 1; }

install_from_git "MMM-Touch" "https://github.com/gfischershaw/MMM-Touch.git" false
install_from_git "MMM-pages" "https://github.com/edward-shen/MMM-pages.git" false
install_from_git "MMM-CalendarExt3" "https://github.com/MMRIZE/MMM-CalendarExt3.git" true
install_from_git "MMM-Chores" "https://github.com/PierreGode/MMM-Chores.git" true
install_local "MMM-TouchPages"
install_local "MMM-ThemeToggle"

printf 'Module installation complete.\n'
