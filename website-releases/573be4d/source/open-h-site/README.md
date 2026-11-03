# Open-H public site

Static public project hub for `www.open-h.org`. It runs as an isolated nginx
container behind the CVAT deployment's existing Traefik proxy.

## Local preview

```bash
docker build -f open-h-site/Dockerfile -t open-h/site:dev .
docker run --rm -p 18080:8080 open-h/site:dev
```

Open `http://localhost:18080`.

## Deployment

The production service and Traefik labels are defined in
`docker-compose.website.yml`. Include it alongside the standard CVAT HTTPS
compose files.

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.surgery.yml \
  -f docker-compose.https.yml \
  -f docker-compose.website.yml \
  up -d --build open_h_site
```

The repository's `deploy-surgery.sh` includes this override for subsequent
full-platform deployments.

## Asset provenance

- `assets/open-h-header.jpg` comes from the public
  `open-h/open-h-embodiment` repository.
- `assets/openh-rf-header.jpg` comes from the public `open-h/OpenH-RF`
  repository.
- `assets/endoluminal-robot.jpg` is Figure 2 from Morino et al., "Initial
  clinical experience with a novel flexible endoscopic robot for transanal
  surgery," licensed under CC BY 4.0. The site includes visible source and
  license attribution.
- `assets/open-h-logo.jpg` is copied at build time from the existing Open-H
  branding under `cvat/apps/engine/static/`.
