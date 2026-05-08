# REST API 接口文档

## 概述

后端基于 Express 4，所有接口以 `/api` 为前缀，返回 JSON 格式。开发模式下前端通过 Vite 代理将 `/api` 请求转发到 `http://localhost:3001`。

**通用规则**：
- 创建接口返回 `201`，删除接口返回 `204`（无响应体）
- `id`、`createdAt`、`updatedAt` 由后端自动生成/维护
- 错误返回 `{ message: string }` 格式

---

## 健康检查

| 方法 | 路径 | 响应 |
|------|------|------|
| GET | `/api/health` | `{ status: "ok", timestamp: string }` |

---

## 产品 `/api/products`

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/` | 产品列表 | `?search=keyword`（可选） | `Product[]` |
| GET | `/:id` | 产品详情 | — | `Product` |
| POST | `/` | 创建产品 | `Product`（不含 id/时间戳） | `Product`（201） |
| PUT | `/:id` | 更新产品 | `Partial<Product>` | `Product` |
| DELETE | `/:id` | 删除产品 | — | 204 |

---

## 产品分类 `/api/product-categories`

> 该资源用于系统管理员维护“产品分类字典”，产品的 `category` 字段使用分类 `key`。

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/` | 分类列表 | — | `ProductCategoryItem[]` |
| GET | `/:id` | 分类详情 | — | `ProductCategoryItem` |
| POST | `/` | 创建分类 | `{ key, name }` | `ProductCategoryItem`（201） |
| PUT | `/:id` | 更新分类 | `{ key?, name? }` | `ProductCategoryItem` |
| DELETE | `/:id` | 删除分类 | — | 204 |

`ProductCategoryItem` 结构：

```json
{
	"id": "cat-001",
	"key": "light",
	"name": "灯具",
	"createdAt": "2026-03-10T08:00:00.000Z",
	"updatedAt": "2026-03-10T08:00:00.000Z"
}
```

**业务约束**：
- `key` 唯一，冲突返回 `409`：`{ message: "分类 key 已存在" }`
- 删除时若分类被产品引用，返回 `409`：`{ message: "该分类正被 N 个产品使用，无法删除" }`
- 修改分类 `key` 时，会同步更新引用该分类的产品 `category` 字段

---

## 物模型 `/api/products/:pid/*`

### 属性

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/products/:pid/properties` | 产品属性列表 | — | `ThingModelProperty[]` |
| POST | `/products/:pid/properties` | 创建属性 | `Property`（不含 id/productId/时间戳） | `ThingModelProperty`（201） |
| PUT | `/properties/:id` | 更新属性 | `Partial<ThingModelProperty>` | `ThingModelProperty` |
| DELETE | `/properties/:id` | 删除属性 | — | 204 |

### 动作

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/products/:pid/actions` | 产品动作列表 | — | `ThingModelAction[]` |
| POST | `/products/:pid/actions` | 创建动作 | `Action`（不含 id/productId/时间戳） | `ThingModelAction`（201） |
| PUT | `/actions/:id` | 更新动作 | `Partial<ThingModelAction>` | `ThingModelAction` |
| DELETE | `/actions/:id` | 删除动作 | — | 204 |

### 服务

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/products/:pid/services` | 产品服务列表 | — | `ThingModelService[]` |
| POST | `/products/:pid/services` | 创建服务 | `Service`（不含 id/productId/时间戳） | `ThingModelService`（201） |
| PUT | `/services/:id` | 更新服务 | `Partial<ThingModelService>` | `ThingModelService` |
| DELETE | `/services/:id` | 删除服务 | — | 204 |

### 批量删除

| 方法 | 路径 | 说明 | 响应 |
|------|------|------|------|
| DELETE | `/products/:pid/thingmodel` | 删除该产品的所有属性、动作、服务 | 204 |

---

## 插件 `/api/plugins`

### 插件

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/` | 插件列表 | — | `Plugin[]` |
| GET | `/:id` | 插件详情 | — | `Plugin` |
| POST | `/` | 创建插件 | `Plugin`（不含 id/时间戳） | `Plugin`（201） |
| PUT | `/:id` | 更新插件 | `Partial<Plugin>` | `Plugin` |
| DELETE | `/:id` | 删除插件 | — | 204（同时删除关联版本） |

### 版本

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/:pid/versions` | 版本列表 | — | `PluginVersion[]` |
| POST | `/:pid/versions` | 创建版本 | `multipart/form-data`（见下方） | `PluginVersion`（201） |
| PUT | `/versions/:id` | 更新版本 | `Partial<PluginVersion>` | `PluginVersion` |
| DELETE | `/versions/:id` | 删除版本 | — | 204 |

**创建版本 `multipart/form-data` 字段**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 否 | 插件包文件（最大 50MB） |
| version | string | 是 | 版本号（如 `1.0.0`） |
| releaseNotes | string | 否 | 发布说明 |
| fileName | string | 否 | 自定义文件名（无 file 时用） |
| fileSize | number | 否 | 自定义文件大小（无 file 时用） |

上传的文件保存在 `backend/data/uploads/`，使用 UUID 作为磁盘文件名。

---

## 推送 `/api/push`

### 规则

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/rules` | 规则列表 | — | `PushRule[]` |
| POST | `/rules` | 创建规则 | `PushRule`（不含 id/时间戳） | `PushRule`（201） |
| PUT | `/rules/:id` | 更新规则 | `Partial<PushRule>` | `PushRule` |
| DELETE | `/rules/:id` | 删除规则 | — | 204 |

### 通道

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/channels` | 通道列表 | — | `PushChannel[]` |
| POST | `/channels` | 创建通道 | `PushChannel`（不含 id/时间戳） | `PushChannel`（201） |
| PUT | `/channels/:id` | 更新通道 | `Partial<PushChannel>` | `PushChannel` |
| DELETE | `/channels/:id` | 删除通道 | — | 204 |

### 模板

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/templates` | 模板列表 | — | `MessageTemplate[]` |
| POST | `/templates` | 创建模板 | `MessageTemplate`（不含 id/时间戳） | `MessageTemplate`（201） |
| PUT | `/templates/:id` | 更新模板 | `Partial<MessageTemplate>` | `MessageTemplate` |
| DELETE | `/templates/:id` | 删除模板 | — | 204 |

### 日志

| 方法 | 路径 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/logs` | 日志列表 | `?status=string`（可选筛选） | `PushLog[]` |
| POST | `/logs` | 创建日志 | `PushLog`（不含 id） | `PushLog`（201） |
| DELETE | `/logs` | 清空所有日志 | — | 204 |

> 日志最多保留最近 500 条，新建时自动插入到数组头部。
