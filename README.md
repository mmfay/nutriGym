# NutriGym

## Build & Deploy to DockerHub
```bash
docker buildx build --platform linux/amd64 -t mmfay3/nutrigym-app:latest --push .
```

## Pull & Deploy on Server
```bash
docker compose pull
docker compose up -d
```