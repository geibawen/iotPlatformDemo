# 数据模型文档

## 概述

所有数据模型定义在 `shared/src/` 包（`@iot-platform/shared`）中，前后端共享类型。后端通过 `JsonStore<T>` 将数据持久化为 JSON 文件（`backend/data/*.json`），所有实体的 `id` 由后端使用 UUID v4 自动生成，`createdAt` / `updatedAt` 由后端自动管理。

---

## 产品（Product）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 产品唯一标识 |
| name | string | 产品名称 |
| image | string | 产品图片 URL |
| description | string | 产品描述 |
| category | ProductCategory | 产品分类 |
| connectionType | ConnectionType | 连接方式 |
| status | ProductStatus | 状态：draft / published |
| createdAt | string | 创建时间 |
| updatedAt | string | 更新时间 |

### 产品分类（ProductCategory）

`ProductCategory` 为 `string`，具体可选项由“产品分类字典”动态维护（系统管理员可配置）。

### 产品分类字典（ProductCategoryItem）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 分类唯一标识 |
| key | string | 分类编码（用于产品 `category` 字段） |
| name | string | 分类名称（用于展示） |
| createdAt | string | 创建时间 |
| updatedAt | string | 更新时间 |

默认种子分类如下：

| 值 | 显示名 |
|----|--------|
| light | 灯具 |
| switch | 开关 |
| sensor | 传感器 |
| gateway | 网关 |
| camera | 摄像头 |
| appliance | 家电 |
| other | 其他 |

### 连接方式（ConnectionType）

WiFi / BLE / Zigbee / Z-Wave / Cellular / Ethernet

---

## 物模型（Thing Model）

物模型是 IoT 设备能力的标准化描述，分为三种类型：

### 属性（Property）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 属性唯一标识 |
| productId | string | 所属产品 ID |
| identifier | string | 属性标识符（英文，如 `brightness`） |
| name | string | 属性名称（中文） |
| dataType | DataType | 数据类型 |
| accessMode | AccessMode | 读写模式：r / rw / w |
| required | boolean | 是否必填 |
| description | string | 属性描述 |
| specs | DataSpecs | 数据规格（动态字段） |

#### 数据类型（DataType）

| 类型 | 说明 | specs 字段 |
|------|------|-----------|
| int | 整数 | min, max, step, unit |
| float | 浮点数 | min, max, step, unit |
| bool | 布尔值 | trueLabel, falseLabel |
| string | 字符串 | maxLength |
| enum | 枚举 | enumValues: { value, label }[] |
| struct | 结构体 | structFields: { identifier, name, dataType }[] |
| array | 数组 | arrayItemType |

### 动作（Action）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 动作唯一标识 |
| productId | string | 所属产品 ID |
| identifier | string | 动作标识符 |
| name | string | 动作名称 |
| description | string | 动作描述 |
| inputParams | ActionParam[] | 输入参数列表 |
| outputParams | ActionParam[] | 输出参数列表 |

#### ActionParam

| 字段 | 类型 | 说明 |
|------|------|------|
| identifier | string | 参数标识符 |
| name | string | 参数名称 |
| dataType | DataType | 数据类型 |

### 服务（Service）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 服务唯一标识 |
| productId | string | 所属产品 ID |
| identifier | string | 服务标识符 |
| name | string | 服务名称 |
| description | string | 服务描述 |
| propertyIds | string[] | 关联属性 ID 列表 |
| actionIds | string[] | 关联动作 ID 列表 |

---

## 插件（Plugin）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 插件唯一标识 |
| name | string | 插件名称 |
| description | string | 插件描述 |
| platform | PluginPlatform | 目标平台：iOS / Android / both |
| productIds | string[] | 关联产品 ID 列表（多对多） |
| status | PluginStatus | 状态：active / inactive |
| createdAt | string | 创建时间 |
| updatedAt | string | 更新时间 |

### 插件版本（PluginVersion）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 版本唯一标识 |
| pluginId | string | 所属插件 ID |
| version | string | 版本号（如 1.0.0） |
| releaseNotes | string | 发布说明 |
| fileName | string | 包文件名 |
| fileSize | number | 包大小（bytes） |
| status | VersionStatus | 状态流转：draft → testing → released |
| createdAt | string | 创建时间 |

> **真实文件上传**：创建版本时通过 `multipart/form-data` 上传文件，multer 将文件保存到 `backend/data/uploads/`（UUID 文件名），最大 50MB。

---

## 推送配置（Push）

### 推送通道（PushChannel）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 通道唯一标识 |
| name | string | 通道名称 |
| type | ChannelType | 通道类型 |
| config | ChannelConfig | 通道配置（按类型不同） |
| enabled | boolean | 是否启用 |
| createdAt / updatedAt | string | 时间戳 |

#### 通道类型及配置

| 类型 | 配置字段 |
|------|---------|
| http_callback | url, method, headers, secret |
| mqtt | broker, port, topic, username, password |
| kafka | brokers, topic, groupId |
| mns | endpoint, accessKeyId, accessKeySecret, topic |

### 消息模板（MessageTemplate）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 模板唯一标识 |
| name | string | 模板名称 |
| description | string | 模板描述 |
| format | 'JSON' / 'TEXT' | 格式 |
| content | string | 模板内容，支持变量占位符 |
| variables | string[] | 可用变量列表 |
| createdAt / updatedAt | string | 时间戳 |

#### 模板变量

支持的变量占位符：`${deviceName}`, `${productName}`, `${timestamp}`, `${propertyName}`, `${propertyValue}`, `${alertLevel}`

### 推送规则（PushRule）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 规则唯一标识 |
| name | string | 规则名称 |
| productId | string | 关联产品 |
| triggerType | TriggerType | 触发类型 |
| conditions | RuleCondition[] | 触发条件列表 |
| channelId | string | 推送通道 |
| templateId | string | 消息模板 |
| enabled | boolean | 是否启用 |

#### 触发类型（TriggerType）

| 值 | 说明 |
|----|------|
| property_change | 属性变更 |
| device_online | 设备上线 |
| device_offline | 设备离线 |
| event_report | 事件上报 |

### 推送日志（PushLog）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 日志唯一标识 |
| ruleId | string | 关联规则 |
| channelId | string | 推送通道 |
| deviceName | string | 设备名称 |
| status | 'success' / 'failed' | 推送结果 |
| requestBody | string | 请求体 |
| responseBody | string | 响应体 |
| errorMessage | string | 错误信息（失败时） |
| createdAt | string | 推送时间 |
