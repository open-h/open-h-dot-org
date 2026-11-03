FROM nginxinc/nginx-unprivileged:1.29.5-alpine3.23-slim@sha256:08c2bc93448bc00d2a2e86cd2f8f729220f1d48b56bbf7f211e117fcfe0c4cb6

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html styles.20261001.css site.20261001.js /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 8080
