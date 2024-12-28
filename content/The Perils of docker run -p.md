Or why you should never use default logins for internet facing services.

So you found a new application to run over docker, maybe an application with a database that you run on your homeserver or even worse... a cloud VM.
you run `docker run -p 3000:3000 some-shiny-new-app`. It's a container so it should be safe right? Well before we begin let's talk about

## IPTables

Let's say you got a shiny new Ubuntu distro setup. You followed some tutorial and used `ufw` to get a sane default firewall setup.

Let's say you wanted to allow everything going out, deny everything coming in.
You did something like

```sh
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

Let's see what `ufw` says

```sh
$ ufw status verbose
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip
```

and `iptables`

```sh
$ sudo iptables -L
Chain INPUT (policy ACCEPT)
target     prot opt source               destination
ufw-before-logging-input  all  --  anywhere             anywhere
ufw-before-input  all  --  anywhere             anywhere
ufw-after-input  all  --  anywhere             anywhere
ufw-after-logging-input  all  --  anywhere             anywhere
ufw-reject-input  all  --  anywhere             anywhere
ufw-track-input  all  --  anywhere             anywhere
<snip>
```

Looks good.

Now say you installed docker following their [tutorials](https://docs.docker.com/engine/install/ubuntu/)

Check your iptables again...

If you know what you are looking for, you'll realize that docker installed its own chains before ufw! This is well documented

https://docs.docker.com/network/packet-filtering-firewalls/

> Docker installs two custom iptables chains named `DOCKER-USER` and `DOCKER`, and it ensures that incoming packets are always checked by these two chains first. These chains are part of the `FORWARD` chain.

This means that if you are not behind a router that blocks incoming traffic by default, your docker containers are completely visible to the open internet!

This problem is even worse if you have a dedicated ipv4 address. Bots nowadays can scan the entire ipv4 range in a matter of hours. It really doesn't take much to go through each ip, each port and try common exploits.
I imagine it is something like:

```python
for ip in 0.0.0.0/0:
	for port in 20..65535:
		try_ssh()
		try_ftp()
		try_php_my_admin()
		try_django_admin()
		try_log4j()
		try_postgres()
		try_msql()
		...
```

If you are running a postgres container with default port `5432` and some default password? Consider yourself [hacked](https://news.sophos.com/en-us/2020/07/02/mongodb-ransom-threats-step-up-from-blackmail-to-full-on-wiping/).
![[pg-hacked.png]]
Seriously, this is far more common than you think. Try spinning up a cloud vm without a firewall and run a Postgres database with some dummy data in it and watch yourself get hacked.

> [!Note]- What if I only allow access from a certain host?
> Assuming you don't have an allocated ipv4 address or you have an ipv6 address (Nice!) or you simply block requests that don't have a `host` header in the HTTP request. You might be wondering if you're relatively safe? Let's say your django admin instance runs behind a `{completely_random_string}.example.com`. You are still in danger if you use https! The [Certificate Transparency List](https://certificate.transparency.dev/) is a public, append-only ledger that logs every single https certificate issued! People have used these to attack brand new instances of databases, admin panels and apps by simply scraping the list and checking for default credentials. No one is safe!

## What Can You Do?

- Bind your docker containers to `127.0.0.1` or if you use [Tailscale](https://tailscale.com), you can just bind them to the Tailscale IP!
- Use [ufw-docker](https://github.com/chaifeng/ufw-docker). This is designed to fix the aforementioned issues.
- Do not expose anything outside your docker networks and only use docker networks to communicate between containers.
- [[Running Docker Apps Over Unix Sockets|Run your docker apps over UNIX sockets]].
- Never ever ever ever ever leave public facing services with default logins!

