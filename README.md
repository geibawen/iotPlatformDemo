# IoT 开发者平台 Demo

模拟小米 IoT 开发者后台的展示项目，涵盖产品管理、物模型编辑、插件管理、推送配置等核心功能。

全栈 Monorepo 架构，前端 React + 后端 Express，数据持久化在服务端 JSON 文件中。

## 功能模块

- **概览**：平台统计数据、产品列表、最近推送日志
- **产品管理**：产品 CRUD，支持分类、连接方式等配置
- **物模型编辑**：属性（Property）、动作（Action）、服务（Service）的完整 CRUD，支持 int/float/bool/string/enum/struct/array 等数据类型
- **插件管理**：RN 插件的 CRUD、产品关联（穿梭框）、版本管理（真实文件上传、状态流转：草稿 → 测试 → 发布）
- **推送配置**：推送规则、推送通道（HTTP/MQTT/Kafka/MNS）、消息模板（变量插入）、推送日志
- **角色模拟**：支持开发者、测试人员、系统管理员三种视角切换
- **系统管理员**：产品分类字典管理（增删改查）

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 · TypeScript · Ant Design 5 · Vite 8 · Zustand 5 · React Router 7 |
| 后端 | Express 4 · TypeScript · multer（文件上传）· uuid |
| 共享 | @iot-platform/shared（类型定义包） |
| 工程化 | npm workspaces · concurrently · tsx |
| 存储 | JSON 文件持久化（backend/data/*.json） |

## 快速启动

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装和运行

```bash
# 在项目根目录安装所有依赖（npm workspaces 自动处理三个包）
npm install

# 同时启动前后端开发服务器
npm run dev
```

- 前端：http://localhost:5173
- 后端 API：http://localhost:3001

首次启动后端时会自动写入种子数据（4 个产品、物模型、插件、推送配置等）。

### 单独启动

```bash
npm run dev:backend    # 仅启动后端（端口 3001）
npm run dev:frontend   # 仅启动前端（端口 5173）
```

### 构建

```bash
# 前端生产构建
npm run build -w frontend
```

产物输出到 `frontend/dist/`。

## 项目结构

```
IoTPlatformDemo/
├── package.json               ← 根 package（npm workspaces + concurrently）
├── README.md                  ← 本文件
├── docs/                      ← 技术文档
│   ├── architecture.md        ← 系统架构、数据流、路由
│   ├── data-model.md          ← 数据模型定义
│   ├── api.md                 ← REST API 接口文档
│   └── pages.md               ← 页面功能说明
├── shared/                    ← 共享类型定义包
│   └── src/
│       ├── index.ts           ← 统一导出
│       ├── product.ts         ← 产品类型 + 常量
│       ├── thingModel.ts      ← 物模型类型 + 常量
│       ├── plugin.ts          ← 插件类型 + 常量
│       └── push.ts            ← 推送类型 + 常量
├── backend/                   ← Express 后端
│   ├── src/
│   │   ├── index.ts           ← 服务入口（Express 配置、路由挂载）
│   │   ├── middleware/
│   │   │   └── errorHandler.ts← 全局错误处理
│   │   ├── routes/
│   │   │   ├── products.ts    ← 产品 API
│   │   │   ├── thingModel.ts  ← 物模型 API（属性/动作/服务）
│   │   │   ├── plugins.ts     ← 插件 + 版本 API（含文件上传）
│   │   │   └── push.ts        ← 推送 API（规则/通道/模板/日志）
│   │   └── storage/
│   │       ├── jsonStore.ts   ← 通用 JSON 文件存储引擎
│   │       └── seed.ts        ← 种子数据初始化
│   ├── data/                  ← 运行时数据目录（.gitignore）
│   │   ├── *.json             ← 各资源的 JSON 数据文件
│   │   └── uploads/           ← 插件包上传文件
│   ├── package.json
│   └── tsconfig.json
└── frontend/                  ← React 前端
    ├── src/
    │   ├── api/
    │   │   └── client.ts      ← HTTP 请求封装（get/post/put/del/upload）
    │   ├── types/             ← TypeScript 类型定义（同 shared）
    │   ├── stores/            ← Zustand 状态管理（异步 API 调用）
    │   ├── layouts/           ← 页面布局
    │   ├── pages/             ← 页面组件
    │   ├── components/        ← 可复用组件
    │   ├── mock/              ← 种子数据（已弃用，由后端管理）
    │   ├── App.tsx            ← 路由 + 初始化
    │   └── main.tsx           ← 入口文件
    ├── package.json
    └── vite.config.ts         ← Vite 配置（含 /api 代理）
```

## 文档

| 文档 | 内容 |
|------|------|
| [architecture.md](docs/architecture.md) | 系统架构、数据流、前后端交互 |
| [data-model.md](docs/data-model.md) | 数据模型和字段定义 |
| [api.md](docs/api.md) | REST API 接口文档 |
| [pages.md](docs/pages.md) | 页面功能说明 |

- [系统架构](docs/architecture.md) — 技术栈、路由结构、状态管理、存储方案
- [数据模型](docs/data-model.md) — 产品、物模型、插件、推送的完整字段定义
- [页面功能](docs/pages.md) — 每个页面的详细功能和交互说明

## 开发约定

- 每次新增/调整需求，必须同步更新 `docs/` 下对应文档。
- 若涉及后端 API 变更（新增、删除、参数变化、返回变化），必须同步更新 `docs/api.md`。
