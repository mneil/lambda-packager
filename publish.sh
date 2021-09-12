#!/bin/bash
# A shell script to publish because I'm not disabling 2fa on npmjs.org
# so I have to do this "manually"
#
# USAGE:
# - Checkout the main branch and pull updates
# - Create a new tag locally on the "main" branch like v1.0.0 (must prefix with v)
# - Login to npmjs.org
# - Run `./publish.sh`
#
# WHAT HAPPENS:
# - Check that we're on the MAIN_BRANCH
# - Check that the branch is up to date
# - Grab the latest tag
# - Update the package version to the latest tag
# - Install dependencies (npm ci)
# - Create a new build
# - Publish the package
# - Push the tag up
#
# WHAT TO DO AFTER:
# - Go create a release from the tag

# Make sure we're on a specific branch
MAIN_BRANCH=main
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "${BRANCH}" != "${MAIN_BRANCH}" ]; then
  echo "you must be on branch ${MAIN_BRANCH}"
  exit
fi
# Make sure the branch is up to date
DIFF=$(git diff origin/${MAIN_BRANCH})
if [ "${DIFF}" != "" ]; then
  echo "you need to pull updates from ${MAIN_BRANCH}"
  exit
fi
# Get the latest tag
LATEST_TAG=$(git describe --tags $(git rev-list --tags --max-count=1))
# Strip the v prefix
TAG="${LATEST_TAG:1}"
echo "creating package ${TAG}"
# Update the package version
npm version --no-git-tag-version ${TAG} > /dev/null
# Run npm ci to make sure the dependencies are good and package.lock is correct
npm ci
# Build the package
npm run build
# Publish the package
npm publish dist --access public
# Push the tag up
git push origin ${LATEST_TAG}
