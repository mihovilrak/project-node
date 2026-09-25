# TLS and reverse proxy

The `web` container speaks plain HTTP on `127.0.0.1:3000`. Put a TLS-terminating reverse proxy on the same host in front of it. This page covers the requirements and gives Caddy and nginx examples.

## Requirements

1. Set `FE_URL` in `.env` to the public `https://` address, for example `https://pm.example.com`, and run `docker compose up -d`. This marks the session cookie `Secure` and allows that origin for CORS.
2. Proxy all paths to `http://127.0.0.1:3000`.
3. Pass the original `Host` header.
4. Send `X-Forwarded-Proto: https`. The API only issues the `Secure` session cookie on requests it sees as HTTPS, so sign-in fails without this header.
5. Allow request bodies up to 11 MB for file uploads (10 MB files plus overhead).
6. Send HSTS from the proxy. The `web` container sets the other security headers (CSP, `X-Frame-Options`, `Referrer-Policy` and so on) but leaves HSTS out, because it only ever sees HTTP.
7. Redirect HTTP to HTTPS.

## Caddy

Caddy obtains certificates, redirects HTTP and sets `X-Forwarded-Proto` on its own.

```txt
pm.example.com {
	header Strict-Transport-Security "max-age=31536000; includeSubDomains"
	reverse_proxy 127.0.0.1:3000
}
```

## nginx

```nginx
server {
    listen 80;
    server_name pm.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name pm.example.com;

    ssl_certificate     /etc/letsencrypt/live/pm.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pm.example.com/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    client_max_body_size 11m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

Get the certificate with certbot or your usual ACME client.

## Rate limits behind a proxy

The stack limits requests by client address:

- `web`: 20 requests per second per address on `/api`, with a burst of 40. Excess requests get `429`.
- API: 20 sign-in attempts per address per 15 minutes, plus a per-account lockout after repeated failures.

Behind your proxy, `web` sees the proxy's address, not the user's, and the API trusts only one proxy hop. Expect these per-address limits to count all users together. On a busy site, users may hit `429` responses that are really caused by other users. The per-account lockout is not affected.

## Check it

1. Open `https://pm.example.com` and sign in.
2. Confirm the response headers include `Strict-Transport-Security`:

   ```sh
   curl -sI https://pm.example.com | grep -i strict-transport
   ```

3. Confirm the API is reachable:

   ```sh
   curl -s https://pm.example.com/api/health
   ```

   Expected: `{"status":"healthy"}`.
