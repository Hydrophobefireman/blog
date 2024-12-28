I'm not sure how common this technique is. I described the _why_ I use unix sockets with my docker apps in my last post [[2023 Self Hosting Setup#Why I build my Custom Images]].

Let's talk about the _how_

I'll start with an easy example. Let's find an image that exposed a port. I'll go with [Glances](https://github.com/nicolargo/glances).

## Modifying the Configs

To expose your app over a socket instead you will need to use a reverse proxy inside the container.
Which means you will have 2 running processes, the proxy and in our case the glances app.
I use `s6-overlay` but you can use quite literally whatever you're comfortable with.
But this is what the Dockerfile would look like.

```Dockerfile
FROM nicolargo/glances:latest-full
ADD https://github.com/just-containers/s6-overlay/releases/download/v2.2.0.3/s6-overlay-amd64-installer /tmp/
RUN chmod +x /tmp/s6-overlay-amd64-installer

COPY --from=caddy:latest /usr/bin/caddy /usr/bin/caddy

RUN /tmp/s6-overlay-amd64-installer /
COPY etc/services.d /etc/services.d

COPY Caddyfile /Caddyfile
ENV S6_SYNC_DISKS=1
CMD ["/init"]
```

You could use something lighter than Caddy but we're not concerned with that here.

To actually run the services together we will follow the s6-overlay way of creating `etc/services.d/{service_name}/run` files for Caddy and Glances and then copying them to the container. (see Dockerfile above)

`{glances_path_on_my_host_machine}etc/services.d/caddy/run`

```sh
#!/usr/bin/with-contenv sh

caddy run --config=/Caddyfile
```

`{glances_path}/etc/services.d/glances/run`

```sh
#!/usr/bin/with-contenv sh

cd /app
/venv/bin/python3 -m glances -C /etc/glances.conf $GLANCES_OPT
```

Here's what my Caddyfile will look like
`{glances_path}/Caddyfile`

```Caddyfile
http:// {
	bind unix//sockets/glances.sock
	reverse_proxy localhost:61208
}
```

`61208` is what Glances runs at.
Now in my docker compose I would do something like:

```diff
version: '3'
services:
  glances:
- image: nicolargo/glances:latest-full
+    build:
+      context: .
+      dockerfile: Dockerfile
    restart: unless-stopped
- ports:
- - '127.0.0.1:61208-61209:61208-61209'
    environment:
      - TZ=${TZ}
      - GLANCES_OPT=-w
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /run/user/1000/podman/podman.sock:/run/user/1000/podman/podman.sock:ro
+      - ./sockets/:/sockets
    pid: host
```

Glances will run over a UDS stored in `{glances_path}/sockets/glances.sock` and our container doesn't expose any ports!

Now, the last thing we gotta do is to make sure my Tailnet can still access glances. So in my Caddyfile, I'll make the following changes.

```diff
glances.example.com {
-  reverse_proxy localhost:61208
+  reverse_proxy unix//{glances_path}/sockets/glances.sock
}
```

> [!Note] Note
> Caddy's syntax for UDS is `unix//` + `<path to .sock>`
