#!/usr/bin/env bash
set -euo pipefail

self="$(readlink -f "${BASH_SOURCE[0]}")"; declare -r self
selfName="$(basename "$self")"; declare -r selfName

usage() (
printf 'usage: %s EXT_DIR EXT_FILE[, EXT_FILE, ...]
  Copies EXT_FILE[...] list into EXT_DIR, but tags manifest.json as it passes
  through
' "$selfName";
)

die() (
  local msg="$1"; shift
  printf -- 'error: '"$msg" "$*"
  exit 1
)

declare -r versFile=major.minor

[[ $# -ge 2 ]] ||
  die 'expected at least two arguments; see usage:\n%s\n' "$(usage)"
declare -r extDir="$(readlink -f "$1")"
shift

{ [[ -d "$extDir" ]] && [[ -w "$extDir" ]]; } ||
  die 'EXT_DIR not a writable directory\n'

vfPath="$(dirname "$self")"/"$versFile" ||
  die 'trouble finding version file, "%s"\n' "$versFile"
declare -r vfPath

semVer="$(< "$vfPath")"; declare -r semVer
[[ -n "$semVer" ]] || die 'expected sibling %s file is empty\n' "$versFile"

isGitDirty() ( [[ "$(git status --porcelain | wc -l)" -eq 0 ]]; )

buildSemVer() (
  local minorBumpedAt
  minorBumpedAt="$(git log --max-count=1 --format=%H "$vfPath")"

  local patchesSince # INCLUDING current dirty staging's commit
  patchesSince=$(git rev-list "$minorBumpedAt"..HEAD | wc -l)
  if isGitDirty;then patchesSince=$(( patchesSince + 1 )); fi

  printf '%s.%d' "$semVer" "$patchesSince"
)

tagManifest() (
  local manifest="$1"

  local gitRef; gitRef="$(git rev-parse HEAD | cut  -c 1-8)"
  ( set -x; sed -i 's|GITREF|'"$gitRef"'|g' "$manifest"; )

  local autoVerStr; autoVerStr="$(buildSemVer)"
  ( set -x; sed -i 's|VERSION_NUM|'"$autoVerStr"'|g' "$manifest"; )
)

for f in "$@";do
  cp "$f" "$extDir"

  b="$(basename "$f")"
  if [[ "$b" = manifest.json ]];then
    tagManifest "$extDir"/"$b"
  fi
done
