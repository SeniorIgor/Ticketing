#!/usr/bin/env bash

set -euo pipefail

BOLD=$(tput bold 2>/dev/null || true)
RESET=$(tput sgr0 2>/dev/null || true)
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[1;34m'

usage() {
  echo -e "${RED}Usage:${RESET} $0 -e <prod> [-b <patch|minor|major>] [-n]" 1>&2
  exit 1
}

environment=""
bump_type="patch"
skip_fetch=0

while getopts ":e:b:n" opt; do
  case "${opt}" in
    e)
      environment="${OPTARG}"
      ;;
    b)
      bump_type="${OPTARG}"
      ;;
    n)
      skip_fetch=1
      ;;
    *)
      usage
      ;;
  esac
done

shift $((OPTIND - 1))

if [[ "${environment}" != "prod" ]]; then
  echo -e "${RED}Only the 'prod' environment is wired to the production release workflow right now.${RESET}" 1>&2
  usage
fi

if [[ ! "${bump_type}" =~ ^(patch|minor|major)$ ]]; then
  usage
fi

tag_prefix="${environment}-v"

echo -e "${BOLD}${BLUE}🚀 Creating ${environment} release tag${RESET}\n"

if [[ ${skip_fetch} -eq 0 ]]; then
  echo -e "${YELLOW}- Fetching tags...${RESET}"
  git fetch --tags
  echo
else
  echo -e "${YELLOW}- Fetching tags skipped${RESET}\n"
fi

current_branch=$(git rev-parse --abbrev-ref HEAD)
current_commit=$(git rev-parse --short HEAD)

echo -e "${BOLD}- Current branch:${RESET} ${BLUE}${current_branch}${RESET}"
echo -e "${BOLD}- Current commit:${RESET} ${BLUE}${current_commit}${RESET}"

last_tag=$(git tag -l "${tag_prefix}*" --sort=-v:refname | head -n 1 || true)
last_version="${last_tag#${tag_prefix}}"

echo -e "${BOLD}- Last ${environment} tag:${RESET} ${GREEN}${last_tag:-<none>}${RESET}"

if [[ -z "${last_tag}" ]]; then
  major=1
  minor=0
  patch=0
else
  IFS='.' read -r major minor patch <<< "${last_version}"
  major=${major:-1}
  minor=${minor:-0}
  patch=${patch:-0}

  case "${bump_type}" in
    major)
      major=$((10#${major} + 1))
      minor=0
      patch=0
      ;;
    minor)
      minor=$((10#${minor} + 1))
      patch=0
      ;;
    patch)
      patch=$((10#${patch} + 1))
      ;;
  esac
fi

new_tag="${tag_prefix}${major}.${minor}.${patch}"

echo -e "\n${BOLD}${BLUE}- New tag:${RESET} ${BOLD}${new_tag}${RESET}"

git tag "${new_tag}"
echo -e "${GREEN}✅ Tag '${new_tag}' created successfully.${RESET}"

echo -e "${YELLOW}📡 Pushing tag to origin...${RESET}"
git push --progress origin "${new_tag}"
echo -e "${GREEN}✅ Tag '${new_tag}' successfully pushed to origin.${RESET}"
