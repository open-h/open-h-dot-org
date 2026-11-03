# Dev update — Public website versioning

**Date:** 2026-08-20 14:57 America/Chicago (UTC-05:00)
**Status:** Done

## What changed
- Added the static `open-h-site/` implementation, nginx configuration, project imagery, and asset provenance documentation to version control.
- Added `docker-compose.website.yml` with the `open_h_site` service, health check, and Traefik routes for `www.open-h.org` and the canonical apex redirect.
- Included the website overlay in `deploy-surgery.sh` and added the HTTP-01 certificate resolver used by the Cloudflare-proxied `www` hostname.
- Recorded the original website deployment and routing checks in `docs/LOCAL_DEPLOYMENT_LOG_20260630.md`.

## Why
- The public website was running from untracked files on the office host and could not be recovered from Git after a machine loss or migrated reliably to another host.

## Verification
- `docker compose -p cvat -f docker-compose.yml -f docker-compose.surgery.yml -f docker-compose.https.yml -f docker-compose.website.yml config --quiet` — passed.
- `docker compose -p cvat -f docker-compose.yml -f docker-compose.surgery.yml -f docker-compose.https.yml -f docker-compose.website.yml build open_h_site` — passed.
- `docker run --rm open-h/site:dev nginx -t` — configuration syntax passed.
- `curl -fsSI --max-time 20 https://www.open-h.org/` — returned HTTP 200 with the configured security headers.
- `curl -sSI --max-time 20 https://open-h.org/` — returned HTTP 308 to `https://www.open-h.org/`.
- `git diff --cached --check` — passed.

## Follow-ups
- Move the website from the office host to a persistent managed host when the annotation platform migration is complete.
