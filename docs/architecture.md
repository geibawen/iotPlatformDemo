# 系统架构文档

## 概述

IoT 开发者平台 Demo 是一个全栈 Monorepo 项目，模拟小米 IoT 开发者后台的核心功能。采用 npm workspaces 组织代码，前端 React + 后端 Express，数据持久化在服务端 JSON 文件中。

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 6.x | 类型安全 |
| Ant Design | 5.x | UI 组件库 |
| @ant-design/icons | 5.x | 图标库 |
| React Router | 7.x | 客户端路由 |
| Zustand | 5.x | 状态管理 |
| Vite | 8.x | 构建工具 + 开发代理 |
| dayjs | 1.x | 时间格式化（antd 内置） |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Express | 4.x | HTTP 服务框架 |
| TypeScript | 5.6 | 类型安全 |
| multer | 1.x | 文件上传中间件 |
| uuid | 11.x | 唯一 ID 生成 |
| cors | 2.x | 跨域支持 |
| tsx | latest | 开发运行器（替代 ts-node） |

### 工程化

| 技术 | 用途 |
|------|------|
| npm workspaces | Monorepo 包管理 |
| concurrently | 并行启动前后端 |
| @iot-platform/shared | 前后端共享类型定义 |

## 项目结构

```
IoTPlatformDemo/
├── package.json                       # 根 package（npm workspaces + scripts）
├── docs/                              # 技术文档
│   ├── architecture.md                # 架构文档（本文件）
│   ├── data-model.md                  # 数据模型定义
│   ├── api.md                         # REST API 接口文档
│   └── pages.md                       # 页面功能说明
├── shared/                            # 共享类型定义包
│   ├── package.json                   # @iot-platform/shared
│   └── src/
│       ├── index.ts                   # 统一导出
│       ├── product.ts                 # 产品类型 + 常量
│       ├── thingModel.ts              # 物模型类型 + 常量
│       ├── plugin.ts                  # 插件类型 + 常量
│       └── push.ts                    # 推送类型 + 常量
├── backend/                           # Express 后端
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts                   # 服务入口（Express 配置、路由挂载、种子数据初始化）
│   │   ├── middleware/
│   │   │   └── errorHandler.ts        # 全局错误处理（AppError / NotFoundError）
│   │   ├── routes/
│   │   │   ├── products.ts            # 产品 CRUD API
│   │   │   ├── thingModel.ts          # 物模型 API（属性/动作/服务 + 批量删除）
│   │   │   ├── plugins.ts             # 插件 + 版本 API（含 multer 文件上传）
│   │   │   └── push.ts               # 推送 API（规则/通道/模板/日志）
│   │   └── storage/
│   │       ├── jsonStore.ts           # 通用 JSON 文件存储引擎（原子写入）
│   │       └── seed.ts               # 种子数据初始化
│   └── data/                          # 运行时数据目录（.gitignore）
│       ├── *.json                     # 各资源的 JSON 数据文件
│       └── uploads/                   # 插件包上传的真实文件
└── frontend/                          # React 前端
    ├── package.json
    ├── vite.config.ts                 # Vite 配置（含 /api → localhost:3001 代理）
    ├── tsconfig*.json
    ├── index.html
    └── src/
        ├── api/
        │   └── client.ts             # HTTP 请求封装（get/post/put/del/upload）
        ├── types/                     # TypeScript 类型（同 shared）
        ├── stores/                    # Zustand 状态管理（异步 API 调用）
        │   ├── productStore.ts        # 产品 Store
        │   ├── thingModelStore.ts     # 物模型 Store
        │   ├── pluginStore.ts         # 插件 Store
        │   └── pushStore.ts           # 推送 Store
        ├── mock/
        │   └── seedData.ts           # 原种子数据（已弃用，由后端管理）
        ├── layouts/
        │   └── MainLayout.tsx         # 主布局（侧边栏 + 顶栏）
        ├── pages/                     # 页面组件
        ├── components/                # 可复用组件
        ├── App.tsx                    # 路由配置 + 初始化
        └── main.tsx                   # 入口文件
```

## 架构设计

### 整体架构

```
                   ┌─────────────────────────────────┐
                   │           Browser                │
                   │  React + Zustand + Ant Design    │
                   └──────────┬──────────────────────┘
                              │ fetch (async)
                              ▼
                   ┌──────────────────────────────────┐
                   │     Vite Dev Proxy (/api →:3001)  │
                   └──────────┬───────────────────────┘
                              │
                              ▼
                   ┌──────────────────────────────────┐
                   │      Express Backend (:3001)      │
                   │  Routes → Storage → JSON Files    │
                   └──────────┬───────────────────────┘
                              │
                   ┌──────────▼───────────────────────┐
                   │     backend/data/                 │
                   │  *.json (数据) + uploads/ (文件)   │
                   └──────────────────────────────────┘
```

### 数据流

```
用户操作 → 页面组件 → Zustand Store (async) → API Client (fetch)
                                                    │
                                                    ▼
                                         Express Route Handler
                                                    │
                                                    ▼
                                           JsonStore (原子读写)
                                                    │
                                                    ▼
                                         backend/data/*.json
```

- **前端 API Client**：统一的 fetch 封装（`api.get/post/put/del/upload`），所有请求发送到 `/api` 前缀
- **Vite 代理**：开发模式下将 `/api` 请求代理到 `http://localhost:3001`
- **Zustand Store**：异步 API 调用（`async/await`），每个业务域独立 Store
- **JsonStore 引擎**：通用泛型存储，原子写入（.tmp + rename），自动创建目录
- **种子数据**：后端首次启动时检测 `products.json` 是否为空，为空则写入预置数据

### 路由结构

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Dashboard | 概览统计 |
| `/products` | ProductList | 产品列表（CRUD） |
| `/products/:id` | ProductDetail | 产品详情 + 物模型编辑 |
| `/plugins` | PluginList | 插件列表（CRUD） |
| `/plugins/:id` | PluginDetail | 插件详情 + 版本管理 |
| `/push/rules` | PushRules | 推送规则配置 |
| `/push/channels` | PushChannels | 推送通道管理 |
| `/push/templates` | MessageTemplates | 消息模板管理 |
| `/push/logs` | PushLogs | 推送日志查询 |

### 布局

采用 Ant Design Layout 组件：
- **Sider**（固定左侧 240px）：Logo + 导航菜单，支持折叠
- **Header**（固定顶部）：折叠按钮 + 用户信息
- **Content**：页面主体内容区，使用 React Router Outlet 渲染

### 设计风格

参考小米 IoT 开发者平台：
- 主色调：蓝色 `#1677ff`
- 背景色：浅灰 `#f5f5f5`
- 卡片式布局，圆角 8px
- 中文界面，antd zhCN 国际化

## 前端状态管理

每个 Store 通过 API Client 异步调用后端接口：

```typescript
const useXxxStore = create<XxxState>((set, get) => ({
  items: [],
  loading: false,

  // 从后端获取数据
  fetchItems: async () => {
    set({ loading: true });
    const items = await api.get<T[]>('/xxx');
    set({ items, loading: false });
  },

  // 创建 → 调用 POST → 刷新列表
  add: async (data) => {
    await api.post('/xxx', data);
    await get().fetchItems();
  },

  // 更新 → 调用 PUT → 刷新列表
  update: async (id, data) => {
    await api.put(`/xxx/${id}`, data);
    await get().fetchItems();
  },

  // 删除 → 调用 DELETE → 刷新列表
  delete: async (id) => {
    await api.del(`/xxx/${id}`);
    await get().fetchItems();
  },
}));
```

## 后端存储引擎

`JsonStore<T>` 是一个通用的泛型 JSON 文件存储类：

- **原子写入**：先写 `.tmp` 临时文件，再 `rename` 覆盖，防止写入中断导致数据损坏
- **自动创建目录**：首次写入时自动 `mkdir -p data/`
- **方法**：`readAll` / `writeAll` / `findById` / `create` / `update` / `delete` / `deleteByField` / `isEmpty`
- **ID 生成**：所有实体使用 UUID v4
- **时间戳**：自动管理 `createdAt` / `updatedAt`（ISO 8601 格式）

### 数据文件

| 文件 | 内容 |
|------|------|
| `products.json` | 产品列表 |
| `properties.json` | 物模型属性 |
| `actions.json` | 物模型动作 |
| `services.json` | 物模型服务 |
| `plugins.json` | 插件列表 |
| `plugin-versions.json` | 插件版本 |
| `push-rules.json` | 推送规则 |
| `push-channels.json` | 推送通道 |
| `push-templates.json` | 消息模板 |
| `push-logs.json` | 推送日志 |
| `uploads/` | 插件包上传文件（multer 存储，UUID 文件名） |

## Monorepo 结构

项目使用 npm workspaces 组织为三个包：

| 包 | 路径 | 说明 |
|----|------|------|
| @iot-platform/shared | `shared/` | 前后端共享的 TypeScript 类型定义 |
| backend | `backend/` | Express API 服务 |
| frontend | `frontend/` | React 前端应用 |

根 `package.json` 配置了统一的脚本：
- `npm run dev`：通过 concurrently 同时启动前后端
- `npm run dev:backend`：仅启动后端
- `npm run dev:frontend`：仅启动前端

## 注意事项

- 插件包上传是真实文件上传（multer），文件保存在 `backend/data/uploads/` 目录
- `backend/data/` 目录已加入 `.gitignore`，不会提交到版本控制
- 删除 `backend/data/` 后重启后端会自动重新生成种子数据
- 开发模式依赖 Vite 代理转发 API 请求，生产部署需配置反向代理
