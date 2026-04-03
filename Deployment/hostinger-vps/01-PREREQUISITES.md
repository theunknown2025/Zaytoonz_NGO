# Step 1 — Prerequisites (Hostinger VPS + Docker)

Complete this checklist before touching the server.

## VPS

- **Hostinger KVM VPS** (or equivalent) with a supported Linux (Ubuntu 22.04 LTS is a common choice).
- **Resources:** At minimum 2 vCPU and 4 GB RAM recommended if you run Next.js + scraper + NLWeb + Nginx on one host; more if traffic is high.
- **SSH access:** Root or sudo user with SSH key authentication (disable password login after setup).

## Domain and DNS

- A **domain** pointed to the VPS **public IPv4** (and IPv6 if you use it):
  - `A` record: `@` → VPS IP
  - `A` or `CNAME` for `www` if needed
- DNS propagation can take up to 48 hours; verify with `dig` or `nslookup` before TLS issuance.

## Local machine

- **Git** to clone the repository.
- **SSH client** (OpenSSH on Windows/macOS/Linux).

## Secrets and accounts (gather before deploy)

- **Supabase:** Project URL + anon key (and service role key only if your app needs it server-side — keep secret).
- **OpenAI:** API key for server (`OPENAI_API_KEY`) and any `NEXT_PUBLIC_*` keys your build uses.
- **Repository access:** SSH deploy key or HTTPS token if the repo is private.

## What you will install on the server (later steps)

- Docker Engine + Docker Compose plugin
- Optional: `certbot` (often via Compose image, as in this project’s compose files)

## Next step

Continue to [02-SERVER-BASELINE.md](02-SERVER-BASELINE.md).
