# Local Deployment Log: OpenHV2 CVAT

Date: 2026-06-30
Host repo: `/mnt/ssd2/cvat`
Model root: `/mnt/big_drive/models/openhv2`

## Source Update

Private source branch pulled from:

```bash
git remote add lead https://github.com/finalelement/openhv2_cvat.git
git fetch lead v1_phases_1_to_9
GIT_LFS_SKIP_SMUDGE=1 git switch --force -C deploy/v1_phases_1_to_9 lead/v1_phases_1_to_9
```

Local safety branch kept before switching:

```bash
git branch backup/pre-lead-v1-20260630 289fbe43d
```

Current local deployment branch:

```text
deploy/v1_phases_1_to_9
```

Local deployment commit:

```text
e66ea179a Adapt private v1 deployment to local model paths
```

The branch is intentionally ahead of `lead/v1_phases_1_to_9` by local deployment configuration.

## 2026-07-01 Lead Sync

Latest lead branch pulled from `finalelement/openhv2_cvat`:

```text
lead/v1_phases_1_to_9 @ 648967b71
```

Notable upstream changes reviewed from `docs/OPERATOR_SETUP.md`:

```text
- Source is intended to be self-contained under components/; model weights and datasets stay external.
- Checkpoint bundle layout is sam3/checkpoints, tapis/fold1, and temporal.
- Parakeet still downloads nvidia/parakeet-tdt-1.1b on first run unless the HF cache is pre-seeded.
- TAPIS startup still installs small Python packages at container start.
- Dataset roots are optional for the new off-domain temporal path.
- The common gesture model declares trained_procedures=["Prostatectomy"].
- Procedures without trained temporal models show availability messaging and can use "Run anyway (off-domain)".
```

Local conflict policy for this merge:

```text
- Kept the lead engineer's off-domain "Run anyway" UI and frame-upload temporal path.
- Kept local strict temporal availability checks so unrelated procedure models are not shown as normal trained models.
- Kept local enhanced predictor HTTP errors for both /predict and /predict_upload.
- Kept universal manual phase labels available in the Phase lane even when no phase model is selected.
```

## Git LFS Repair

The private branch referenced several Git LFS assets that could not be downloaded from GitHub LFS on this machine. Checkout was completed with smudge disabled, then the needed assets were restored from the local backup branch so the UI build could succeed:

```text
cvat-ui/plugins/sam/assets/decoder.onnx
cvat-ui/src/assets/opencv_4.8.0.js
site/content/en/images/brushing_tools_polygon.gif
site/content/en/images/cvat-readme-gif.gif
```

This is a local repair. The private upstream should have its LFS objects fixed for clean clones on other machines.

## Model Inventory

Canonical local model files:

```text
/mnt/big_drive/models/openhv2/sam3/checkpoints/Altas_Sam3.pt
/mnt/big_drive/models/openhv2/sam3/checkpoints/checkpoint_6.pt
/mnt/big_drive/models/openhv2/sam3/checkpoints/gb_expert.pt
/mnt/big_drive/models/openhv2/tapis/fold1/PHASES.pyth
/mnt/big_drive/models/openhv2/temporal/asformer_best.pt
/mnt/big_drive/models/openhv2/temporal/asformer_config.yaml
/mnt/big_drive/models/openhv2/temporal/vjepa2_1_vitl_dist_vitG_384.pt
/mnt/big_drive/models/openhv2/cache/hf
```

Model/checkpoint material is ignored by Git via `.gitignore`.

## Phase Model Status

We are not missing the TAPIS phase model that this branch expects. The active trained phase model is:

```text
Host file:      /mnt/big_drive/models/openhv2/tapis/fold1/PHASES.pyth
Container file: /opt/models/fold1/PHASES.pyth
Server row:     TAPIS_RARP_Phase
Model type:     phase_classifier
Procedure:      Prostatectomy
Endpoint:       http://tapis_phase_predictor:8602
```

Important limitation: this branch only ships/configures a trained prostatectomy/RARP TAPIS phase model. Other procedures get universal phase tag labels for manual annotation, but they do not have trained automatic phase classifiers unless additional procedure-specific checkpoints are added and registered.

The operator docs state the intended behavior:

```text
Phase models stay per-procedure.
Procedures without a trained phase model rely on manual phase labels.
No trained universal-phase model exists in this bundle.
```

If we want more automatic phase models, we need additional checkpoint files, for example other GraSP/TAPIS folds or a new procedure-specific phase checkpoint, and a matching `SurgeryModel` registry row.

## Local Compose Adaptation

Production compose was adapted in `docker-compose.surgery.yml`:

```text
SAM3 uses vendored SAM 3.1 source:
  ./components/vendor/repo_sam3.1 -> /opt/sam3

SAM3 checkpoints:
  /mnt/big_drive/models/openhv2/sam3/checkpoints -> /opt/checkpoints

Temporal predictor:
  components/temporal_predictor -> /opt/temporal
  components/vendor/vjepa2 -> /opt/vendor/vjepa2
  components/vendor/asformer_model -> /opt/vendor/asformer_model
  components/inference_guides -> /opt/infer_guides
  /mnt/big_drive/models/openhv2/temporal -> /opt/weights

TAPIS phase predictor:
  components/tapis_phase_predictor -> /opt/tapis
  /mnt/ssd2/GraSP/TAPIS -> /opt/tapis_code
  /mnt/big_drive/models/openhv2/tapis -> /opt/models

Parakeet ASR:
  components/parakeet_asr Dockerfile image
  components/surgnarr_src -> /opt/surgnarr/src
  /mnt/big_drive/models/openhv2/cache/hf -> /opt/hf
```

The private branch did not include the full GraSP/TAPIS source under `components/tapis_phase/GraSP/TAPIS`, so this host uses the existing local source tree:

```text
/mnt/ssd2/GraSP/TAPIS
```

Local dev compose defaults were also changed in `docker-compose.surgery.local.yml` from the lead engineer's workstation paths to this host's `/mnt/big_drive` paths.

## Local `.env` Settings

Non-secret local path defaults were added to `.env` on this machine:

```text
OPENHV2_SAM3_CKPT_DIR=/mnt/big_drive/models/openhv2/sam3/checkpoints
OPENHV2_TAPIS_CODE=/mnt/ssd2/GraSP/TAPIS
OPENHV2_TAPIS_MODELS=/mnt/big_drive/models/openhv2/tapis
OPENHV2_TEMPORAL_WEIGHTS=/mnt/big_drive/models/openhv2/temporal
OPENHV2_HF_CACHE=/mnt/big_drive/models/openhv2/cache/hf
OPENHV2_PARAKEET_HF=/mnt/big_drive/models/openhv2/cache/hf
OPENHV2_DATASET_PROST=/mnt/big_drive/datasets/prostatectomy
OPENHV2_DATASET_PROST_SUTURE=/mnt/big_drive/datasets/prostatectomy_suture_knot_focused
SAM3_MAX_RESIDENT_MODELS=2
SAM3_WARMUP_ON_STARTUP=0
TRANSCRIPTION_LLM_ENABLED=0
```

Do not commit `.env`; it also contains host-specific and secret values.

## Runtime Fixes Needed Here

1. Disabled SAM3 startup warmup:

   ```text
   SAM3_WARMUP_ON_STARTUP=0
   ```

   The branch's warmup path can hold the SAM3 model-manager lock long enough that `/health` times out. With startup warmup disabled, SAM3 health stays responsive and the first real inference lazily loads `Altas_Sam3`.

2. Completed Parakeet model cache:

   ```bash
   docker stop surgery_parakeet
   docker run --rm --gpus all \
     -e HF_HOME=/opt/hf \
     -v /mnt/big_drive/models/openhv2/cache/hf:/opt/hf \
     cvat-parakeet:latest \
     huggingface-cli download nvidia/parakeet-tdt-1.1b
   docker compose -f docker-compose.yml -f docker-compose.surgery.yml -f docker-compose.https.yml up -d parakeet
   ```

   Before this, Parakeet had only a partial Hugging Face cache and never completed FastAPI startup.

3. Seeded existing database rows. Pulling the branch does not automatically add `SurgeryModel` rows to an existing database.

   ```bash
   docker exec cvat_server python manage.py seed_common_tool_model
   docker exec cvat_server python manage.py seed_common_gesture_model
   docker exec cvat_server python manage.py seed_surgery_label_schema
   ```

   TAPIS phase was registered with the shell snippet from `docs/OPERATOR_SETUP.md`, using `TAPIS_RARP_Phase`.

4. Follow-up behavior for Phase-tab prediction on cholecystectomy jobs:

   The Phase tab calls the combined temporal prediction endpoint (`phase + gesture`). On cholecystectomy jobs, the router was showing the prostatectomy TAPIS phase model as a fallback and the backend allowed the wildcard common gesture model to enqueue a temporal prediction. That job then failed with:

   ```text
   404 Client Error: Not found for url: http://temporal_predictor:8091/predict
   ```

   Root cause: no cholecystectomy phase classifier is registered, and the temporal predictor cannot resolve `cholecystectomy/episode_...` videos under the mounted prostatectomy dataset roots.

   Local behavior after the 2026-07-01 lead sync:

   ```text
   cvat/apps/engine/orchestration.py
     - model-set now resolves phase/gesture roles strictly by procedure.
     - cholecystectomy jobs no longer show the prostatectomy TAPIS phase model.
     - temporal_available reports whether trained temporal models genuinely cover
       the job procedure.

   cvat/apps/engine/views.py
     - temporal/predict returns 422 immediately when no trained phase or gesture
       model exists for the job procedure, instead of enqueueing a failing RQ job.
     - the explicit allow_offdomain request still enqueues prediction.

   cvat/apps/engine/temporal.py
     - sidecar HTTP errors include predictor JSON detail for easier diagnosis.
     - off-domain prediction renders job frames to MP4 and calls /predict_upload,
       so it does not need a matching source video under TEMPORAL_DATASET_ROOTS.

   cvat-ui/src/components/annotation-page/surgery-workspace/phase-track-editor/phase-track-editor.tsx
     - normal Run prediction is disabled when trained temporal models do not cover
       the procedure.
     - the alert offers Run anyway (off-domain) when trained models exist for a
       different procedure.
   ```

   Current behavior for cholecystectomy jobs:

   ```text
   No trained phase or gesture model is registered for Cholecystectomy.
   Add Phase/Task intervals manually, register procedure-specific temporal models,
   or explicitly use Run anyway (off-domain) and review the results carefully.
   ```

## Active Server Registry

Current active rows after seeding:

```text
Altas_Sam3                         anatomy_segmenter      Cholecystectomy  http://sam3:8090
Surgical_Tools                     tool_segmenter         *                http://sam3:8090
Gallbladder_Specialist             specialist_segmenter   Cholecystectomy  http://sam3:8090
VJEPA2_ASFormer_Gesture_Common     gesture_classifier     *                http://temporal_predictor:8091
TAPIS_RARP_Phase                   phase_classifier       Prostatectomy    http://tapis_phase_predictor:8602
```

Inactive backup anatomy rows remain:

```text
sam3_cholec8k
sam3_dsad
```

## Build And Deploy Commands

Configuration validation:

```bash
docker compose -f docker-compose.yml -f docker-compose.surgery.yml -f docker-compose.https.yml config --quiet
docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.surgery.local.yml config --quiet
git diff --check
```

Build:

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  -f docker-compose.devbuild.yml \
  -f docker-compose.surgery.yml \
  -f docker-compose.https.yml \
  build cvat_server cvat_ui sam3 parakeet
```

Database backup before relaunch:

```text
/mnt/big_drive/cvat_backups/cvat_before_private_v1_20260630_105503.sql.gz
```

Deploy:

```bash
docker compose -f docker-compose.yml -f docker-compose.surgery.yml -f docker-compose.https.yml up -d
```

## Verification Performed

Public server endpoint:

```bash
curl -k -fsS -H 'Host: annotate.open-h.org' https://127.0.0.1/api/server/about
```

Django:

```bash
docker exec cvat_server python manage.py migrate --check
docker exec cvat_server python manage.py check
```

Sidecar health:

```text
sam3                  200 loaded Altas_Sam3 on cuda
temporal_predictor    200 loaded V-JEPA/ASFormer on cuda
tapis_phase_predictor 200 loaded /opt/models/fold1/PHASES.pyth on cuda
parakeet              200 loaded nvidia/parakeet-tdt-1.1b on cuda
```

SAM3 smoke test on latest job `9597`:

```text
Altas_Sam3 text mask: Liver -> 1 mask
Altas_Sam3 text mask: Tools -> 1 mask
Altas_Sam3 detection: Liver -> 2 boxes
Altas_Sam3 detection: Tools -> 1 box
```

`Gallbladder` returned no mask on that selected frame, which is a frame/model-result issue rather than a sidecar failure.

## 2026-07-01 Verification After Lead Sync

Latest local merge commit:

```text
9f5adcc34 Merge lead v1 phases 1 to 9 updates
```

Redeploy commands run:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.devbuild.yml -f docker-compose.surgery.yml -f docker-compose.https.yml build cvat_server cvat_ui

docker compose -f docker-compose.yml -f docker-compose.surgery.yml -f docker-compose.https.yml up -d --no-deps --force-recreate \
  cvat_server cvat_ui \
  cvat_worker_annotation cvat_worker_import cvat_worker_export cvat_worker_webhooks \
  cvat_worker_quality_reports cvat_worker_chunks cvat_worker_consensus cvat_worker_utils \
  temporal_predictor tapis_phase_predictor
```

Post-deploy checks:

```text
docker exec cvat_server python manage.py seed_common_gesture_model
  -> Updated VJEPA2_ASFormer_Gesture_Common with trained_procedures=["Prostatectomy"]

docker exec cvat_server python manage.py migrate --check
  -> clean

docker exec cvat_server python manage.py check
  -> System check identified no issues

Public endpoint:
  -> https://annotate.open-h.org/api/server/about returned 200

Sidecar health:
  sam3                  200 loaded on cuda
  temporal_predictor    200 loaded V-JEPA/ASFormer on cuda
  tapis_phase_predictor 200 loaded /opt/models/fold1/PHASES.pyth on cuda
  parakeet              200 loaded nvidia/parakeet-tdt-1.1b on cuda

Upload-route smoke:
  temporal_predictor /predict_upload    400 Empty video upload
  tapis_phase_predictor /predict_upload 400 Empty video upload
```

Model-set/API check on latest job `9597`:

```text
Procedures: ['Cholecystectomy']
Temporal availability: phase=False, gesture=False
Trained temporal procedures advertised by the registry: Prostatectomy
Selected trained phase model: None
Manual phase labels still available: Idle, Exposure, Dissection, Transection, Reconstruction, Extraction

POST /api/jobs/9597/temporal/predict without allow_offdomain:
  422 No phase or gesture model is trained for Cholecystectomy.

The UI's normal Run prediction path should therefore fail fast with a clear message.
The explicit Run anyway (off-domain) path remains available and uses /predict_upload.
```

## 2026-07-16 V2 Phase 04 Deployment

Source branch and commit:

```text
lead/v2_phase_04 @ 1af7b54fc feat(surgery): complete Phase 04 scoped propagation
```

Local deployment branch and host adaptation commit:

```text
deploy/v2_phase_04
0bdf5909e Adapt private v1 deployment to local model paths
```

The host adaptation was replayed onto Phase 04 without application-code changes. It preserves:

```text
- External model and cache storage under /mnt/big_drive/models/openhv2
- Vendored SAM 3.1 source with Altas_Sam3.pt as the default checkpoint
- Temporal V-JEPA/ASFormer and TAPIS phase sidecars
- Local Parakeet image and Hugging Face cache
- Git ignores for checkpoint/model file extensions
```

Pre-migration PostgreSQL backup:

```text
/mnt/big_drive/cvat_backups/cvat_before_v2_phase_04_20260716_091259.sql.gz
gzip integrity check: passed
```

Built images:

```text
cvat/server:dev     580320bb1b80
cvat/ui:dev         5c9e1747e0d5
cvat-sam3:latest    8b445d6a5bf9
cvat-parakeet:latest eb492c3d614e
```

Database and application verification:

```text
engine migrations 0109 through 0121 applied successfully
python manage.py migrate --check -> clean
python manage.py check -> System check identified no issues
PropagationEngineRegistryTest -> 7/7 passed
```

Phase 04 propagation policy:

```text
Default and enabled engine: classical_optical_flow
Detection + association: disabled until Phase 11
Exact-mask video memory: disabled until Phase 11
Compare All: disabled until Phase 11
Configured Classical preview ceiling: 60 selected frames
```

Public and sidecar verification:

```text
https://annotate.open-h.org/                 200
https://annotate.open-h.org/api/server/about 200

sam3                  200 devices=[cuda,cpu], lazy model loading enabled
temporal_predictor    200 loaded V-JEPA/ASFormer on cuda
tapis_phase_predictor 200 loaded /opt/models/fold1/PHASES.pyth on cuda
parakeet              200 loaded nvidia/parakeet-tdt-1.1b on cuda

SAM3 checkpoints:
  /opt/checkpoints/Altas_Sam3.pt
  /opt/checkpoints/checkpoint_6.pt
  /opt/checkpoints/gb_expert.pt

temporal_predictor /predict_upload empty-file smoke -> 400
tapis_phase_predictor /predict_upload empty-file smoke -> 400
```

The Phase 04 migration preserved the expected model registry: `Altas_Sam3` is active for anatomy,
`Surgical_Tools` is active for tools, `Gallbladder_Specialist` is active for specialist
segmentation, `VJEPA2_ASFormer_Gesture_Common` points to the temporal sidecar, and
`TAPIS_RARP_Phase` points to the TAPIS sidecar.

Temporal and Parakeet startup took approximately seven minutes while their checkpoints were read
and expanded. Their containers were not considered ready until `/health` reported `loaded=true`.

## 2026-07-16 Direct-Mask Propagation Fix Redeploy

Incoming lead fix:

```text
bb424d079 V2 Phase 04 MIN-17: simplify label propagation seeds
```

Merged into the local deployment branch as:

```text
5b9b785e6 Merge remote-tracking branch 'lead/v2_phase_04' into deploy/v2_phase_04
```

The fix removes the redundant propagation scope/seed filtering step. Anatomy and Tools propagation
now use valid masks already selected on the current frame, including manual, semi-automatic,
automatic, saved, and client-only masks. Client-only seeds can stage a preview, but must still be
saved and the preview regenerated before Apply.

No migrations, model files, dependency manifests, or compose files changed in this upstream
commit. The local `/mnt/big_drive` model paths, temporal/TAPIS services, Parakeet deployment,
`Altas_Sam3` default, and checkpoint ignores were preserved. No additional database backup was
needed because the schema was unchanged.

Verification:

```text
Focused serializer/direct-mask backend tests: 18/18 passed
Server image: cc6301703b16
UI image:     181087817749
Served bundle: assets/cvat-ui.4fb66e8be923a84e06ea.min.js

python manage.py migrate --check -> clean
python manage.py check -> System check identified no issues
https://annotate.open-h.org/ -> 200
https://annotate.open-h.org/api/server/about -> 200
Annotation RQ worker -> listening on annotation

sam3                  -> 200, cuda available
temporal_predictor    -> 200, loaded on cuda
tapis_phase_predictor -> 200, loaded on cuda
parakeet              -> 200, loaded on cuda
```

Only the CVAT server, UI, and backend workers were recreated. The unchanged GPU sidecars stayed
running and retained their loaded models.

## 2026-07-17 Open-H Public Website

Added and deployed a first-pass public project hub at `https://www.open-h.org/`. The site is an
isolated static nginx container and does not share application code, routes, or storage with CVAT.

Website implementation:

```text
open-h-site/                  static HTML, CSS, JavaScript, nginx config, and project imagery
docker-compose.website.yml   open_h_site service and Traefik routers
open-h/site:dev              locally built production image
```

The page presents Open-H-Embodiment, Open-H-Endoluminal, and OpenH-RF as separate initiatives.
Academic and industry data contributors are directed to the corresponding GitHub repositories.
Clinicians are directed to `https://annotate.open-h.org/auth/register`.

The Open-H-Endoluminal card uses Figure 2 from Morino et al., "Initial clinical experience with a
novel flexible endoscopic robot for transanal surgery" (2022), showing the flexible robotic
endoscope tip, needle-knife, and grasper. The image is licensed under CC BY 4.0; visible source and
license links are included on the card and provenance is documented in `open-h-site/README.md`.

Routing and TLS:

```text
http://open-h.org/      -> https://open-h.org/ -> https://www.open-h.org/
https://open-h.org/     -> https://www.open-h.org/
https://www.open-h.org/ -> open_h_site:8080
```

The apex DNS record is DNS-only and `www` is proxied by Cloudflare. The existing `lets-encrypt`
TLS-ALPN resolver remains in place for `annotate.open-h.org` and the apex. A separate
`lets-encrypt-http` HTTP-01 resolver was added for proxied `www.open-h.org`, with independent ACME
storage at `/letsencrypt/acme-http.json`.

Origin certificate verification:

```text
open-h.org     issuer=Let's Encrypt; valid through 2026-10-15
www.open-h.org issuer=Let's Encrypt; valid through 2026-10-15
```

Deployment and regression verification:

```text
open_h_site container -> running and healthy
https://www.open-h.org/ -> 200
https://open-h.org/ -> 308 to https://www.open-h.org/
https://annotate.open-h.org/ -> 200
https://annotate.open-h.org/api/server/about -> 200
Desktop viewport -> no horizontal overflow
390x844 mobile viewport -> no horizontal overflow; navigation open/close verified
```

`deploy-surgery.sh` now includes `docker-compose.website.yml` in full builds and deployments so the
public site is preserved during future platform relaunches.

## Remaining Caveats

- This machine has only one automatic phase checkpoint: `tapis/fold1/PHASES.pyth` for prostatectomy/RARP.
- Dataset roots for prostatectomy were created under `/mnt/big_drive/datasets/...`; prediction endpoints that resolve by `episode_NNNNNN` need real videos there.
- Phase 04's exact-mask video-memory engine remains intentionally disabled and needs its own compatible multiplex checkpoint before Phase 11 validation. `Altas_Sam3.pt` is not a substitute.
- Phase 04 still needs a user-driven browser check of direct-mask preview, Apply, save/reload, correction, rerun, merge, lifecycle, and export behavior on a real job.
- The private upstream should fix missing LFS objects for clean clones.
- This deployment has not been pushed upstream.
