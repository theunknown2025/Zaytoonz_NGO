# Step 2 — Server baseline (security and updates)

Run these steps as root or with `sudo` on a fresh VPS.

## System updates

```bash
apt-get update && apt-get upgrade -y
```

(Reboot if the kernel was updated.)

## Non-root deploy user (recommended)

```bash
adduser deploy
usermod -aG sudo deploy
```

Copy your SSH public key to `/home/deploy/.ssh/authorized_keys`, then test login as `deploy`.

## Firewall (UFW example)

Allow SSH, HTTP, and HTTPS only:

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

Adjust if you use a non-standard SSH port **before** enabling `ufw`.

## Optional hardening

- Set `PermitRootLogin no` and `PasswordAuthentication no` in `/etc/ssh/sshd_config`, then `systemctl restart ssh`.
- Install `fail2ban` if your threat model warrants it.

## Time sync

Ensure `systemd-timesyncd` or `chrony` is active so TLS certificates and logs are correct.

## Next step

Continue to [03-DOCKER-INSTALL.md](03-DOCKER-INSTALL.md).
