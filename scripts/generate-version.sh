#!/usr/bin/env bash
PATH=~/.local/bin:$PATH

BRANCH_NAME=$1

set -e

echo "Running semantic versioning"
if ! npx semantic-release --debug; then
  exit 1;
fi

appVersion=$(cat ./package.json | jq -r '.version')
echo $appVersion
if [[ "$BRANCH_NAME" == "main" ]] || [[ "$BRANCH_NAME" == "next" ]] || [[ "$BRANCH_NAME" == "develop" ]]
then
  if  [ "$appVersion" = "0.0.0" ];
  then
    echo "Error: The current version generated is 0.0.0, we will stop here. Please investigate."
    exit 1;
  fi
fi
if [[ "$BRANCH_NAME" == "main" ]]
then
  echo "Create extra release tags"
  git tag -a -f "latest" -m "latest"
  git tag -a -f "v1" -m "v1"
  git push --force --tags
fi
if [[ "$BRANCH_NAME" == "next" ]]
then
  echo "Create extra next tag"
  git tag -a -f "next" -m "next"
  git push --force --tags
fi
