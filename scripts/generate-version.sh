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
echo "Setting git config"
git config --global user.name "github-actions[bot]"
git config --global user.email "github-actions[bot]@users.noreply.github.com"
if [[ "$BRANCH_NAME" == "develop" ]]
then
  echo "Create extra develop tag"
  git tag -a -f "develop" -m "latest develop"
  git push --force --tags
fi
if [[ "$BRANCH_NAME" == "next" ]]
then
  echo "Create extra next tag"
  git tag -a -f "next" -m "latest next"
  git push --force --tags
fi
if [[ "$BRANCH_NAME" == "main" ]]
then
  echo "Create extra release tags"
  git tag -a -f "latest" -m "latest"
  git tag -a -f "v1" -m "v1"
  git push --force --tags
fi
