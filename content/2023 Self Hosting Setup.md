---
title: My 2023 Self Hosting Setup
---

It's almost 2024 and I'm trying out a new blogging setup. Instead of making a blog post about my custom made blog engine (and never blogging again), I've decided to go with [Quartz](https://quartz.jzhao.xyz/) & [Obsidian](https://obsidian.md) for my setup instead. So I'll test things out by talking about my self hosting setup.

Now, I won't really talk much about _why_ you should self-host, there are [tons](https://www.reddit.com/r/selfhosted/comments/tnjeb7/why_would_i_want_to_self_host_most_stuff/) [of](https://www.reddit.com/r/selfhosted/comments/18981vz/why_do_you_selfhost/) [answers](https://www.reddit.com/r/selfhosted/search/?q=why+selfhost&sort=top) to this question from various perspectives.

> [!Note]- However...
> Ok I lied, I will be talking about why **I** self-host. YMMV
>
> -   **To learn**: I promise you, you will learn something new about firewalls, docker, containers, nix (if you go that route), security, etc etc
> -   **It's Fun**: Maybe not true for everyone.
> -   **No Cloud Tax**: Ok this is not _entirely_ true for me but, you will save money by using open source alternatives and not paying subscriptions and on cloud storage.
> -   **Privacy**: Perhaps the most important for homelabs, you will own everything. [Hard to beat that nowadays](https://www.playstation.com/en-us/legal/psvideocontent/)

## My Setup

### The hardware

- Asus G14 (2021) (Some distro, I hop).
- A minisforum mini pc with Ryzen 7 (Ubuntu Server)
- A cuddy wired router since my university has a firewall which means my devices cannot form a p2p connection over tailscale. A router solves that and I avoid [DERP](https://tailscale.com/kb/1232/derp-servers)

### The Software

- [Tailscale](https://tailscale.com): Pretty much a must-have for me. I have heard good things about [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/) too but I stuck with TS. I _could_ figure out WireGuard myself but I didn't want to deal with firewalls, NAT, University WiFi and securing it. Tailscale just works.
- [Caddy](https://caddyserver.com): One reverse proxy for each service, running on `https://{service}.example.com` (Yes, https with tailscale (not ts.net), [[Tailscale and Caddy|here's how, and why I did that]])
- [Docker](https://www.docker.com/), [nix](https://nixos.org/): Most of my services are simple docker containers of open source projects, my own apps usually are minimal docker images built with nix. I also create my own images with docker as I serve everything on a Unix Domain Socket. (More on that below)

I want to confess that this is not a 100% self hosted solution 😔. I also run a VPS on Oracle's generous free tier for some redundancy. I use [Backblaze](https://www.backblaze.com/) for important backups (encrypted with [duplicati](https://www.duplicati.com/)). I try to minimize this however.

## The Services

- [AdGuardHome](https://adguard.com/en/adguard-home/overview.html): I run 2 instances of this and sync them using [AdGuardHome-sync](https://github.com/bakito/adguardhome-sync). Both the machines have a Tailscale IP which I use as my DNS servers on my Tailscale console.
- [Immich](https://immich.app): Might be a must have for future self host setups, the project moves fast and it's got an amazing team. (Consider [sponsoring](https://github.com/sponsors/immich-app) them!). I also back these up using Duplicati.
- [NTOP](https://www.ntop.org/): Network monitoring, making sure the traffic doesn't look too crazy.
- [Picoshare](https://github.com/mtlynch/picoshare): Tailscale file exists, but sometimes you want a url.
- [Tailscale Golink](https://github.com/tailscale/golink): neat URL shortner.
- [Tailscale Tclip](https://github.com/tailscale-dev/tclip): Private pastebin. A little slow IME, maybe I'm holding it wrong?
- [Journo](https://github.com/Hydrophobefireman/journo): An end to end encrypted journaling app I made in the past, Self hosted it because..why not.
- [Piped](https://github.com/TeamPiped/Piped): A private YouTube front-end. Another great community project. I built a custom image for it to use a single container. (I don't really care for scalability for 2 - 3 users as this instance is private to my tailnet)
- [Transmission-openvpn](https://github.com/haugene/docker-transmission-openvpn): A torrent client for Linux ISOs only. (Running on the cloud machine, not locally)
- [Jellyfin](https://jellyfin.org/): Browsing my Linux ISO collection.
- CouchDB for [Obsidian Self-hosted LiveSync](https://github.com/vrtmrz/obsidian-livesync/blob/main/docs/setup_own_server.md): Free Obsidian Sync alternative.
- [S3FS Fuse](https://github.com/s3fs-fuse/s3fs-fuse): Fuse FS, a caddy server and a backblaze bucket that let's me use it as a remote file system. On my phone the files get synced using [foldersync](https://foldersync.io/). Convenient for documents.
- [Glances](https://github.com/nicolargo/glances): HTOP over the web.
- [Ollama Web UI](https://github.com/ollama-webui/ollama-webui): Running popular llms locally for fun.
- [Reader](https://github.com/Hydrophobefireman/reader): A dead simple project of mine that let's you open `read/https://some-news-article` and shows it in a clean reader node interface.
- [Gitea](https://github.com/go-gitea/gitea): self hosted GitHub alternative. Currently using it as a mirror but slowly moving projects over completely.
- [Sterling PDF](https://github.com/Frooodle/Stirling-PDF): PDF manipulation.
- [Metube](https://github.com/alexta69/metube): youtube-dl client

### Why I build my Custom Images

For most of the projects above, I create a docker image on top of them that makes them serve content over a unix domain socket over a docker volume. My main caddy server would then reverse proxy `service.example.com` to that unix socket.

I do this because Docker actually modifies your iptables to let any service with a port mapping of say 3000:3000 be available on ALL interfaces (0.0.0.0). This is not a problem over a firewalled network but if I'm not under a firewall, all these services are available over the Internet. Read on: [[The Perils of docker run -p]]

You could specify the interface yourself: ( `127.0.0.1:3000:3000` OR `{tailscale-ip}:3000:3000` ) or you could update UFW rules to cover docker as well. I simply avoid the issue of forgetting to do this by serving things over UDS. The Caddy server, which sits behind UFW (deny everything coming IN, allow everything going OUT) then serves all this and Tailscale handles the rest. [[Running Docker Apps Over Unix Sockets|Here's a how-to for an image I converted recently.]]

My goal for 2024 is to self host more, add newer services and harden security even more. Let's see how 2024s setup will look like.
