# PatternProof Cloud — Week 3 starter

**Status:** Initial application files and automation definitions are included. The independent validation-unit tests were run locally in an offline Node.js environment. Next.js dependencies were not installed here, so no claim is made that the full Next.js build, Docker build, GitHub Actions run, or Cloud Run deployment has succeeded.

This is the planned limited crochet-pattern validation demo, not a finished commercial pattern validator. **Use synthetic samples only.** No sign-in, private storage, database, payments, or real customer uploads.

## What it contains

- Next.js / TypeScript App Router prototype with an editable JSON sample form.
- `POST /api/validate` and `GET /api/health` routes.
- Deterministic validator checking skipped/duplicate row numbers, supported stitch tokens, and declared-count mismatches.
- Unit tests, Dockerfile, CI workflow, manually triggered Cloud Run deployment workflow, and Cloud Shell fallback script.
- Design notes at `docs/DECISIONS.md`.

## Run on a workstation with Node.js 22+

```bash
npm install
npm run test
npm run dev
```

Open http://localhost:3000. The sample intentionally includes a missing row and a count mismatch.

```bash
npm run build
npm start
# Default production port 8080
```

## Build container (requires Docker and internet access for image/dependencies)

```bash
docker build -t patternproof-cloud:week3 .
docker run --rm -p 8080:8080 patternproof-cloud:week3
```

Browse http://localhost:8080. Use `GET /api/health` for a smoke test.

## CI/CD

- `.github/workflows/ci.yml` runs Node tests, Next.js build, and Docker image build on PRs and pushes to `main`. It **does not deploy** automatically.
- `.github/workflows/deploy-cloud-run.yml` is **manual only** (`workflow_dispatch`). It requires a configured Google Cloud project, Artifact Registry repository, Workload Identity Federation, permissions, and GitHub Actions settings. It builds/pushes a versioned image and deploys a **private** Cloud Run service.
- `scripts/deploy-cloud-shell.sh` is an interactive fallback in an authenticated Cloud Shell, and intentionally prompts before any billable deployment. Its Artifact Registry repository must already exist.

Variables: `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_ARTIFACT_REPOSITORY`.
Secrets: `GCP_WIF_PROVIDER`, `GCP_DEPLOY_SERVICE_ACCOUNT`.

## Before production use

- Generate and commit a dependency lockfile (`npm install` creates one); then change CI/Dockerfile to `npm ci`.
- Enable and configure relevant Google Cloud APIs, Artifact Registry, deployment identity, and minimum IAM roles. Confirm course spending limits.
- Add authentication, authorization, private storage, resource limits, rate limiting, more complete validation rules, and integration tests.
- Verify GCP deploy in the current Vocareum project. Each session may provide a new project ID.

## Evidence honesty

The Week 3 Jenkins/Docker Hub lab verified a separate NGINX demonstration image. It is evidence of learning the pipeline process, **not** evidence this PatternProof repository has been pushed to Docker Hub or deployed on Cloud Run.
