# Adding the `staging` CNAME in Cloudflare

This points `staging.open-h.org` at GitHub Pages so a release can be previewed
on a real hostname before going live. It is the only DNS change the preview
needs. No existing record changes.

The page uses root-absolute links (`/assets/...`, `/styles...css`), so it must
be served from the root of a hostname. The default Pages URL
(`open-h.github.io/open-h-dot-org/`) adds a path prefix and renders without
styles or images.

## Record to add

| Field | Value |
|---|---|
| Type | `CNAME` |
| Name | `staging` |
| Target | `open-h.github.io` |
| Proxy status | **DNS only** (grey cloud) |
| TTL | Auto |

The target is the organization's Pages host. Do not include the repo name or a
path.

## Steps in the Cloudflare dashboard

1. Sign in at dash.cloudflare.com and select the **open-h.org** zone.
2. Go to **DNS > Records**.
3. Click **Add record**.
4. Set **Type** to `CNAME`, **Name** to `staging`, **Target** to `open-h.github.io`.
5. Set **Proxy status** to **DNS only** (grey cloud, not orange). With the proxy
   on, GitHub cannot verify the domain or issue the certificate.
6. Click **Save**.

## Check that it resolves

```bash
dig +short staging.open-h.org CNAME
```

Expected output: `open-h.github.io.` Propagation usually takes a minute or two.

## Turn on HTTPS

Once DNS resolves, GitHub issues a certificate automatically (up to about 15
minutes). Then in the repo go to **Settings > Pages** and tick **Enforce HTTPS**.

## Publish the preview

The page does not appear until the workflow has been run and approved:

1. **Actions > Deploy site to GitHub Pages > Run workflow**, on `main`.
2. Keep the default release (`20261019-hospital-release`) or enter another
   folder name under `website-releases/`.
3. When the deploy job pauses, approve it in the `github-pages` environment.

Until then, `staging.open-h.org` returns a GitHub 404. That is expected.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Settings > Pages reports the DNS check failed | Record not saved, proxy is on, or DNS has not propagated. Fix it, then use **Check again**. |
| Browser certificate warning | Certificate not issued yet. Wait a few minutes. |
| `dig` shows an IP address, not `open-h.github.io.` | The proxy is on. Switch the record to DNS only. |
| GitHub 404 page after DNS works | The workflow has not been run and approved yet. |
| Page loads without styles or images | Not served at a hostname root. Open `staging.open-h.org`, not the `github.io` URL. |

## Removing the preview

Delete the `staging` record in Cloudflare and clear the custom domain in
**Settings > Pages**.
