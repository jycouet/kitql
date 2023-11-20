#!/usr/bin/env bash
set -euo pipefail
declare SCRIPT_DIR
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
if [ "${1-x}" == "--fix" ]; then
	eslint --fix --ignore-path ../../.prettierignore "*"
	prettier --ignore-path ../../.prettierignore --write .
else
	eslint --ignore-path ../../.prettierignore "*"
	prettier --ignore-path ../../.prettierignore --check .
fi
