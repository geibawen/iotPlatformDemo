# IoTPlatformDemo 项目 CentOS 7/8 VPS 部署教程

## 1. 环境准备

- 推荐 VPS 配置：10GB 磁盘，1GB+ 内存
- 系统建议：CentOS 7（glibc 2.17）或 CentOS 8/AlmaLinux 8（glibc 2.28+）

## 2. 安装 Node.js

### CentOS 7（glibc 2.17）
使用 Node.js 官方非正式 glibc-217 版本：

```bash
cd /usr/local
curl -O https://unofficial-builds.nodejs.org/download/release/v18.20.4/node-v18.20.4-linux-x64-glibc-217.tar.gz
# 或 Node 20（如需本地构建前端）
# curl -O https://unofficial-builds.nodejs.org/download/release/v20.19.0/node-v20.19.0-linux-x64-glibc-217.tar.gz

# 解压
 tar xzf node-v18.20.4-linux-x64-glibc-217.tar.gz
ln -sf /usr/local/node-v18.20.4-linux-x64-glibc-217/bin/node /usr/local/bin/node
ln -sf /usr/local/node-v18.20.4-linux-x64-glibc-217/bin/npm /usr/local/bin/npm
ln -sf /usr/local/node-v18.20.4-linux-x64-glibc-217/bin/npx /usr/local/bin/npx

node -v
npm -v
```

### CentOS 8/AlmaLinux 8
可直接用 NodeSource 官方源安装 Node.js 18/20。

## 3. 安装依赖工具

```bash
sudo yum install -y git nginx
npm install -g pm2

# 验证 pm2 是否可用（若报 command not found，见第 9 节）
pm2 -v
```

## 4. 上传项目代码

**推荐：本地 Mac 构建前端后上传**

```bash
# Mac 上操作
cd /Users/ninebot/project/test/IoTPlatformDemo
cd frontend && npx vite build && cd ..
tar czf ../iot-platform.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='frontend/src' \
  .

# 上传到服务器（注意 -P 指定搬瓦工端口）
scp -P <端口> ../iot-platform.tar.gz root@<VPS_IP>:/opt/
```

**服务器上解压**
```bash
cd /opt
mkdir -p iot-platform && cd iot-platform
tar xzf ../iot-platform.tar.gz
```

## 5. 安装依赖 & 构建后端

```bash
cd /opt/iot-platform
npm install --workspace=shared --workspace=backend
cd backend && npx tsc && cd ..
```

## 6. 配置 Nginx

```nginx
server {
    listen 80;
    server_name _;
    root /opt/iot-platform/frontend/dist;
    index index.html;
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /uploads/ {
        proxy_pass http://127.0.0.1:3001;
    }
    location / {
        try_files $uri $uri/ /index.html;
    }
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;
}
```

```bash
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

## 7. 启动后端服务（PM2）

```bash
cd /opt/iot-platform
npm install -g pm2  # 如未全局安装

# 先确认编译产物路径（不同环境可能不同）
ls -l backend/dist

# 常见入口路径 1
pm2 start backend/dist/index.js --name iot-backend || true

# 若上一步失败，尝试常见入口路径 2（本项目在部分服务器会输出到这个路径）
pm2 start backend/dist/backend/src/index.js --name iot-backend || true

# 查看是否启动成功
pm2 list
pm2 logs iot-backend --lines 100

pm2 save
pm2 startup
# 按输出提示再执行一次 sudo 环境变量命令
```

## 8. 检查服务

```bash
curl http://127.0.0.1:3001/api/health
curl http://127.0.0.1/api/products
curl http://127.0.0.1/  # 检查前端页面

# 公网验证（将 IP 替换为你的服务器地址）
curl -i http://<VPS_IP>/api/health
```

## 9. 常见问题

- **Node.js 版本不兼容**：用 glibc-217 版 Node.js。
- **Vite 构建报 Node 版本低**：本地构建前端，服务器只跑后端。
- **SSH 端口不是 22**：搬瓦工 VPS 需用 -P 指定端口。
- **Nginx 403/404**：检查 root 路径和 dist 目录。
- **`pm2: command not found`**：
  ```bash
  npm config get prefix
  # 假设输出 /usr/local/node-v18.20.4-linux-x64-glibc-217
  echo 'export PATH="/usr/local/node-v18.20.4-linux-x64-glibc-217/bin:$PATH"' >> ~/.bashrc
  source ~/.bashrc
  pm2 -v
  ```
- **`/api/*` 返回 502 Bad Gateway**（页面可打开但接口全失败）：
  1. `curl -i http://127.0.0.1:3001/api/health` 看后端是否存活  
  2. `pm2 list && pm2 logs iot-backend --lines 100` 看进程和错误日志  
  3. `nginx -t && systemctl reload nginx` 检查并重载 Nginx  
  4. `tail -n 100 /var/log/nginx/error.log` 看反向代理错误
- **`Script not found: backend/dist/index.js`**：先执行 `ls -l backend/dist`，通常改用 `backend/dist/backend/src/index.js` 启动。

---

如需重装系统，推荐 AlmaLinux 8/9，Node.js 20+ 直接支持。

---

本教程适用于 IoTPlatformDemo 及类似 Node.js + React/Vite 全栈项目。