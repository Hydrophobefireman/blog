---
title: Running Services Over HTTPS With Tailscale and Caddy
---

> [!warning] Warning
> This article isn't done yet!

Tailscale already allows you to run services over https using their `machine.tailnet.ts.net` domains. However, you cannot have sub-subdomains (`git.machine.tailnet.ts.net`) and running everything over a port is not super convenient.

To bypass this you will need a domain that you own and a cloudflare account. I am not sure if other providers will support this as I've only tried CF.

- Open your Cloudflare console for the domain
- Add DNS records for the domain you want to point to your tailnet.
    - example: `A` record for `*.hpfm.dev` pointing to `100.0.0.1`
- Add the following snippet to your caddyfile

```
(cf)
tls {
	dns cloudflare {env.CF_API_TOKEN}
}
```

- create a rule for the service

```
service.domain.com {
import cf
reverse_proxy localhost:8000
}
```

> [!warn] Too many services?
> If you have too many services, considering creating a wildcard route first and individually matching services instead. Otherwise you will generate too many https certificates which is slow and doesn't exactly make you a good internet citizen.
> You could do something like:
>
> ```
> *.domain.com {
> @host git.domain.com
> handle @host { 
>     reverse_proxy...
>    }
> }
>
> ```
