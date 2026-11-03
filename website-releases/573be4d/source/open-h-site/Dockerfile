FROM nginxinc/nginx-unprivileged:1.29.5-alpine3.23-slim

COPY open-h-site/nginx.conf /etc/nginx/conf.d/default.conf
COPY open-h-site/index.html /usr/share/nginx/html/index.html
COPY open-h-site/styles.css /usr/share/nginx/html/styles.20260717.css
COPY open-h-site/site.js /usr/share/nginx/html/site.20260717.js
COPY open-h-site/assets/ /usr/share/nginx/html/assets/
COPY cvat/apps/engine/static/open-h-logo.jpg /usr/share/nginx/html/assets/open-h-logo.jpg

EXPOSE 8080
