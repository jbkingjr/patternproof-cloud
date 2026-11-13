#!/usr/bin/env bash
# Intended for authenticated Google Cloud Shell in the active Vocareum project.
# Prerequisites: APIs enabled, Artifact Registry repo created, suitable IAM roles.
set -euo pipefail
REGION="${REGION:-us-central1}"
REPOSITORY="${REPOSITORY:-patternproof-images}"
PROJECT_ID="$(gcloud config get-value project 2>/dev/null)"
if [[ -z "$PROJECT_ID" || "$PROJECT_ID" == '(unset)' ]]; then
  echo 'No active GCP project. Select the Vocareum project first.' >&2; exit 1
fi
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/patternproof:week3"
echo "Target project: ${PROJECT_ID}"
echo "Image: ${IMAGE}"
read -r -p 'Build/push/deploy to this billable project? Type DEPLOY: ' CONFIRM
[[ "$CONFIRM" == 'DEPLOY' ]] || { echo 'Cancelled.'; exit 0; }
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet
docker build -t "$IMAGE" .
docker push "$IMAGE"
gcloud run deploy patternproof-cloud --image "$IMAGE" --region "$REGION" --port 8080 --no-allow-unauthenticated
