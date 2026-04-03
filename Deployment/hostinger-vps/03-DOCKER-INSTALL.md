# Step 3 — Install Docker Engine and Compose (Ubuntu/Debian)

Official instructions change over time; verify against [Docker’s docs](https://docs.docker.com/engine/install/ubuntu/) if something fails.

## Install Docker Engine (common Ubuntu method)

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## Verify

```bash
sudo docker run --rm hello-world
docker compose version
```

## Run Docker as non-root (optional)

```bash
sudo usermod -aG docker deploy
```

Log out and back in as `deploy` so group membership applies.

## Next step

Continue to [04-CLONE-AND-ENV.md](04-CLONE-AND-ENV.md).
