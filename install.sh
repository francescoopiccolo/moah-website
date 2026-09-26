#!/bin/sh
set -eu

command -v node >/dev/null 2>&1 || { echo 'Node.js >=22.19 is required. Install Node.js LTS from https://nodejs.org and retry.' >&2; exit 1; }
node -e 'const [major,minor] = process.versions.node.split(".").map(Number); process.exit(major > 22 || (major === 22 && minor >= 19) ? 0 : 1)' || { echo 'Update Node.js to >=22.19 and retry.' >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo 'npm is required. Install Node.js LTS with npm from https://nodejs.org.' >&2; exit 1; }

install_dir=${MOAH_INSTALL_DIR:-"$HOME/.local/share/moah"}
case "$install_dir" in /*) ;; *) echo 'MOAH_INSTALL_DIR must be an absolute path.' >&2; exit 1 ;; esac
printf 'Installing MoAH from npm into %s...\n' "$install_dir"
npm install --global --prefix "$install_dir" --no-audit --no-fund moah-ai@latest
"$install_dir/bin/moah" about

if [ "${MOAH_NO_PATH_UPDATE:-0}" != 1 ]; then
    # Quote the path as a shell literal, including spaces and single quotes.
    quoted_dir=$(printf '%s' "$install_dir/bin" | sed "s/'/'\\\\''/g")
    path_line="export PATH='$quoted_dir':\$PATH"
    add_path() {
        if ! grep -Fqx "$path_line" "$1" 2>/dev/null; then
            printf '\n# MoAH CLI\n%s\n' "$path_line" >> "$1"
        fi
    }
    add_path "$HOME/.profile"
    case "${SHELL:-}" in
        */bash) add_path "$HOME/.bashrc" ;;
        */zsh) add_path "${ZDOTDIR:-$HOME}/.zshrc" ;;
        */fish) echo "For fish, run: fish_add_path '$install_dir/bin'" ;;
    esac
fi
echo 'MoAH is ready. Open a new terminal, enter your project, and run moah.'
