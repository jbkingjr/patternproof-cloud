#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="$(gcloud config get-value project 2>/dev/null)"
REGION="us-central1"
REPOSITORY="cloud-run-source-deploy"
SA_NAME="patternproof-runtime"

if [[ -z "$PROJECT_ID" || "$PROJECT_ID" == "(unset)" ]]; then
  echo "ERROR: No active Google Cloud project."
  exit 1
fi

SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
BUCKET="patternproof-${PROJECT_ID}-samples"

echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Repository: $REPOSITORY"
echo "Service account: $SA_EMAIL"
echo "Bucket: gs://$BUCKET"
echo

echo "This setup may create billable Google Cloud resources."
read -r -p "Type $PROJECT_ID to confirm: " CONFIRM

if [[ "$CONFIRM" != "$PROJECT_ID" ]]; then
  echo "Cancelled. No changes made."
  exit 1
fi

echo "=== Enabling required APIs ==="

gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com \
  storage.googleapis.com \
  --project="$PROJECT_ID"

echo "=== Checking Artifact Registry ==="

if gcloud artifacts repositories describe "$REPOSITORY" \
  --location="$REGION" \
  --project="$PROJECT_ID" >/dev/null 2>&1; then
  FORMAT=$(gcloud artifacts repositories describe "$REPOSITORY" \
    --location="$REGION" --project="$PROJECT_ID" \
    --format="value(format)")

  if [[ "$FORMAT" != "DOCKER" ]]; then
    echo "ERROR: Existing repository is not Docker format."
    exit 1
  fi
  echo "Docker repository already exists."
else
  gcloud artifacts repositories create "$REPOSITORY" \
    --repository-format=docker \
    --location="$REGION" \
    --project="$PROJECT_ID"
fi

echo "=== Checking runtime service account ==="

if gcloud iam service-accounts describe "$SA_EMAIL" \
  --project="$PROJECT_ID" >/dev/null 2>&1; then
  echo "Service account already exists."
else
  gcloud iam service-accounts create "$SA_NAME" \
    --display-name="PatternProof Runtime" \
    --project="$PROJECT_ID"
fi

echo "=== Checking private storage bucket ==="

if gcloud storage buckets describe "gs://$BUCKET" \
  >/dev/null 2>&1; then
  echo "Bucket exists. Ensuring private access controls."
  gcloud storage buckets update "gs://$BUCKET" \
    --uniform-bucket-level-access \
    --public-access-prevention
else
  gcloud storage buckets create "gs://$BUCKET" \
    --location="$REGION" \
    --project="$PROJECT_ID" \
    --uniform-bucket-level-access \
    --public-access-prevention
fi

echo "=== Configuring least-privilege IAM ==="

gcloud storage buckets add-iam-policy-binding \
  "gs://$BUCKET" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.objectCreator" \
  --quiet >/dev/null

echo "=== BOOTSTRAP COMPLETED SUCCESSFULLY ==="
