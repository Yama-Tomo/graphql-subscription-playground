# graphql subscription playground

## setup

### nodeをdocker上で動かす場合

1. .envを作成します(.env.sampleを参考にしてください)

|  name  |  value  |
  | ---- | ---- |
|NGINX_EXPOSE_PORT|アプリケーションのポートを指定します(default: 3100)|
|CONTAINER_USER_UID|ホストとコンテナのユーザのUIDを合わせるためにコンテナの実行ユーザのUIDを指定します (default: 1000)|
|CONTAINER_USER_GID|ホストとコンテナのユーザのGIDを合わせるためにコンテナの実行ユーザのGIDを指定します (default: 1000)|
|COMPOSE_PROFILES|apps (固定)|

2. packages/frontend/.env.localを作成します(packages/frontend/.env.sampleを参考にしてください)

3. 起動
```bash
$ docker-compose up -d 
$ open http://localhost:<NGINX_EXPOSE_PORTで指定したポート>/
```

### nodeをホストOS上で動かす場合

1. .env.sampleを作成します
   .env.sampleを参考に作成します

|  name  |  value  |
| ---- | ---- |
|NGINX_EXPOSE_PORT|アプリケーションのポートを指定します (default: 3100)|
|NEXT_URL|http://host.docker.internal:3000 (固定)|
|APOLLO_URL|http://host.docker.internal:4000 (固定)|

2. packages/frontend/.env.localを作成します(packages/frontend/.env.sampleを参考にしてください)

3. linux osを使っている場合は `host.docker.internal` を名前解決できるようにします
   docker-compose.override.yml を以下の内容で作成してください

```yml
  version: "3.9"
  services:
    nginx:
      extra_hosts:
        - "host.docker.internal:host-gateway"
  ```

4. 起動
```bash
$ pnpm i && pnpm dev
$ docker-compose up -d 
$ open http://localhost:<NGINX_EXPOSE_PORTで指定したポート>/
```
