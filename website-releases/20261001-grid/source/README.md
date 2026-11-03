# Open-H public website

Standalone static source for https://www.open-h.org/. Four initiatives:
Open-H-Embodiment, Open-H-Endoluminal, OpenH-RF and Open-H-4D.
No application checkout, credentials or model is required to build this site.

## Preview and checks

From this directory: `python3 -m http.server 18080 --bind 127.0.0.1`, then open
http://localhost:18080. Stop with Ctrl-C. Container build, with the pinned base
already available: `docker build --pull=false --network=none -t open-h/site:dev .`.
Preview: `docker run --rm -p 127.0.0.1:18080:8080 open-h/site:dev`.

The initiatives use a static three-column desktop grid. The first row contains
Embodiment, Endoluminal and RF; the second contains Open-H-4D and two cards branded
only Open-H. The placeholders have no initiative name, status, number or link.
The grid becomes two columns on tablets and one on phones. Navigation and the
footer year are the only JavaScript behaviors; all cards are available without JS.

## Brev deployment

Host: `cvat-data-plane-16tb`; organization: `holoscan_workflows`.
The Cloudflare named tunnel maps www.open-h.org to `http://open_h_site:8080`.
No Cloudflare account change is needed for content updates.

- Operating controls: `/home/ubuntu/open-h-website/deployment/`.
- Compose project: `open-h-site`; service/container: `open_h_site`.
- Release: `/home/ubuntu/open-h-website/releases/20261001-grid/`.
- New image: `open-h/site:20261001-grid`.
- Previous image, retained for rollback: `open-h/site:20261001-four-initiatives`.

Before every remote resource-changing command, verify `brev ls orgs --json`
reports holoscan_workflows active. Stage a new versioned source release, verify
its manifest and build its unique image offline. Run an nginx configuration
check and Compose dry-run before changing the image entry. Back up the existing
deployment `.env` privately on the host; change only `OPEN_H_SITE_IMAGE`.
Recreate only the website with:

```bash
docker compose --env-file /home/ubuntu/open-h-website/deployment/.env -p open-h-site -f /home/ubuntu/open-h-website/deployment/docker-compose.yml up -d --no-deps --pull never open_h_site
```

Keep existing limits, network, security settings and tunnel routes. Verify health,
public/origin asset hashes and browser acceptance. Compare all other container
identities to preflight. Do not use full application deployment scripts.

Rollback: after the organization check, restore only the previous image entry
from the saved release receipt and rerun the targeted Compose command. Verify
the previous homepage hash. No database restore or tunnel restart is needed.
Retain both releases and local source/image archives.

## Asset provenance

- `assets/open-h-4d-header.png`: original image from https://github.com/open-h/open-h-4d
  at commit `86f8ae85236ef987544aa4897e1117a92f6077e8`; SHA256
  `9a1799913aa67ac3b6943692e1f4f46182f5c859c36a152cd9b74eb8074b4bf9`.
  Blurb summarizes that README without schedule or availability claims.
- `assets/open-h-header.jpg`: public open-h/open-h-embodiment repository.
- `assets/openh-rf-header.jpg`: public open-h/OpenH-RF repository.
- `assets/endoluminal-robot.jpg`: Figure 2 from Morino et al., “Initial clinical
  experience with a novel flexible endoscopic robot for transanal surgery,”
  CC BY 4.0. Visible source/license attribution remains on the card.
- `assets/open-h-logo.jpg`: existing Open-H brand asset from the preserved
  website snapshot, copied into this independent build context.

Original three-initiative source remains in the immutable 573be4d source
snapshot. Manifests, browser screenshots and deployment receipts are under
`artifacts/open-h-site-grid-20261001/` in the operations workspace.
