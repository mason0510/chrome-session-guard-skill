#!/bin/zsh

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [[ $# -lt 2 ]]; then
  echo "用法：open-explicit-profile.sh '<PROFILE_KEY>' '<URL>'" >&2
  exit 2
fi
PROFILE_KEY="$1"
shift
node "$SCRIPT_DIR/chrome-session-guard.mjs" open "$1" --profile "$PROFILE_KEY"
