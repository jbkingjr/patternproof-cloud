#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
REPOSITORY="cloud-run-source-deploy"
SERVICE="patternproof-cloud"
RUNTIME_SA="patternproof-runtime@${PROJECT_ID}.iam.gserviceaccount.com"
BUCKET="patternproof-${PROJECT_ID}-samples"
TAG=$(date -u +%Y%m%d-%H%M%S)

IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE}:${TAG}"

echo "Project: ${PROJECT_ID}"
echo "Image: ${IMAGE}"

echo "=== Stage 1: Build and Test ==="
echo "=== Stage 2: Push to Artifact Registry ==="

gcloud builds submit \
  --region="${REGION}" \
  --tag="${IMAGE}" \
  .

echo "=== Stage 3: Deploy to Cloud Run ==="

gcloud run deploy "${SERVICE}" \
  --image="${IMAGE}" \
  --region="${REGION}" \
  --port=8080 \
  --memory=512Mi \
  --min-instances=0 \
  --max-instances=1 \
  --service-account="${RUNTIME_SA}" \
  --update-env-vars="PATTERNPROOF_BUCKET=${BUCKET}" \
  --no-allow-unauthenticated \
  --quiet

echo "=== Stage 4: Verify Health ==="

SERVICE_URL=$(gcloud run services describe "${SERVICE}" \
  --region="${REGION}" \
  --format='value(status.url)')

curl --fail --show-error --silent \
  -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  "${SERVICE_URL}/api/health"

echo
echo "=== PIPELINE COMPLETED SUCCESSFULLY ==="
