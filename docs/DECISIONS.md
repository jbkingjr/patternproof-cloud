# Week 3 decision log

- **Primary runtime: Cloud Run**, not GKE. Matches Weeks 1–2 scope; avoids managing a cluster for a single small service.
- **Production CI/CD: GitHub Actions**. Jenkins and Docker Hub are lab-demonstrated alternatives, not evidence PatternProof itself is deployed.
- **Container: Docker**, packaged with a Next.js standalone server listening on 8080.
- **Images: Artifact Registry**, one repository per active GCP lab project; avoid `latest` in deployment workflows.
- **Security:** Preview endpoint is deliberately sample-only. Cloud Run workflow deploys *private* by default; Firebase Authentication and private uploads are future work.
- **GKE/Helm:** Keep as evaluated orchestration option for later expansion, not part of current MVP runtime.
- **Rebuild:** Vocareum project IDs may change; deployment script reads active project; Terraform/IAM setup remains future work.
- **Validation scope:** Detect row gaps, duplicate row numbers, declared counts versus simple stitch token counts; unknown stitch tokens are not guessed.
