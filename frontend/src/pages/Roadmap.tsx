import React from 'react';
import { Card, Typography } from 'antd';

const Roadmap: React.FC = () => {
  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 16 }}>
        网站功能 Roadmap · 拓扑图
      </Typography.Title>

      <Card style={{ borderRadius: 16, borderColor: '#eadfcf', background: '#fffaf1' }} bodyStyle={{ padding: 12 }}>
        <svg
          viewBox="0 0 1420 900"
          width="100%"
          height="auto"
          role="img"
          aria-label="IoT Platform Demo 功能拓扑图"
        >
          <defs>
            <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff8ec" />
              <stop offset="100%" stopColor="#fff3e0" />
            </linearGradient>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#7b8794" />
            </marker>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#b8a88f" floodOpacity="0.28" />
            </filter>
          </defs>

          <rect x="0" y="0" width="1420" height="900" rx="24" fill="url(#bgGrad)" />

          <text x="710" y="52" textAnchor="middle" fontSize="28" fontWeight="700" fill="#5a4632">
            IoT Platform Demo · 整体功能拓扑
          </text>
          <text x="710" y="84" textAnchor="middle" fontSize="15" fill="#866f57">
            开发者工作台 / 测试工作台 / 系统管理台 · 前后端与数据层协同
          </text>

          <rect x="40" y="120" width="1340" height="250" rx="18" fill="#fffef9" stroke="#e4d8c4" strokeWidth="1.5" />
          <text x="62" y="152" fontSize="19" fontWeight="700" fill="#5a4632">用户视角与业务入口</text>

          <rect x="80" y="180" width="400" height="160" rx="14" fill="#eaf4ff" stroke="#9abde6" filter="url(#shadow)" />
          <text x="280" y="212" textAnchor="middle" fontSize="18" fontWeight="700" fill="#294968">开发者视角</text>
          <text x="120" y="240" fontSize="14" fill="#375c80">• 产品管理（分类、发布、上下线）</text>
          <text x="120" y="264" fontSize="14" fill="#375c80">• 设备管理（在线状态、激活、归属）</text>
          <text x="120" y="288" fontSize="14" fill="#375c80">• 插件管理（设备插件、功能插件占位）</text>
          <text x="120" y="312" fontSize="14" fill="#375c80">• OTA / 推送配置 / App 推送</text>

          <rect x="510" y="180" width="400" height="160" rx="14" fill="#edf7ea" stroke="#a8cd9c" filter="url(#shadow)" />
          <text x="710" y="212" textAnchor="middle" fontSize="18" fontWeight="700" fill="#355d2f">测试人员视角</text>
          <text x="550" y="240" fontSize="14" fill="#466e3f">• 插件测试清单（版本状态推进）</text>
          <text x="550" y="264" fontSize="14" fill="#466e3f">• 白名单管理（审核、启停）</text>
          <text x="550" y="288" fontSize="14" fill="#466e3f">• 测试反馈闭环（待测→测试中→通过/拒绝）</text>

          <rect x="940" y="180" width="400" height="160" rx="14" fill="#fff1eb" stroke="#e6b39a" filter="url(#shadow)" />
          <text x="1140" y="212" textAnchor="middle" fontSize="18" fontWeight="700" fill="#7a3f2a">系统管理员视角</text>
          <text x="980" y="240" fontSize="14" fill="#8b5139">• 产品分类字典（增删改查）</text>
          <text x="980" y="264" fontSize="14" fill="#8b5139">• 分类与产品映射一致性维护</text>
          <text x="980" y="288" fontSize="14" fill="#8b5139">• 全局角色切换与治理</text>

          <rect x="40" y="400" width="1340" height="250" rx="18" fill="#fffef9" stroke="#e4d8c4" strokeWidth="1.5" />
          <text x="62" y="432" fontSize="19" fontWeight="700" fill="#5a4632">前端能力层（React + Zustand + Ant Design）</text>

          <rect x="80" y="462" width="280" height="150" rx="12" fill="#fff" stroke="#c9d9ea" filter="url(#shadow)" />
          <text x="220" y="490" textAnchor="middle" fontSize="16" fontWeight="700" fill="#294968">领域页面</text>
          <text x="102" y="515" fontSize="13" fill="#3a5f83">产品 / 设备 / 插件 / OTA</text>
          <text x="102" y="536" fontSize="13" fill="#3a5f83">推送规则 / 模板 / 日志</text>
          <text x="102" y="557" fontSize="13" fill="#3a5f83">Roadmap 拓扑可视化</text>

          <rect x="390" y="462" width="280" height="150" rx="12" fill="#fff" stroke="#c9d9ea" filter="url(#shadow)" />
          <text x="530" y="490" textAnchor="middle" fontSize="16" fontWeight="700" fill="#294968">状态管理</text>
          <text x="412" y="515" fontSize="13" fill="#3a5f83">productStore / deviceStore</text>
          <text x="412" y="536" fontSize="13" fill="#3a5f83">pluginStore / pushStore</text>
          <text x="412" y="557" fontSize="13" fill="#3a5f83">thingModelStore / firmwareStore</text>

          <rect x="700" y="462" width="320" height="150" rx="12" fill="#fff" stroke="#c9d9ea" filter="url(#shadow)" />
          <text x="860" y="490" textAnchor="middle" fontSize="16" fontWeight="700" fill="#294968">插件关键链路</text>
          <text x="722" y="515" fontSize="13" fill="#3a5f83">设备插件平台多选（iOS/安卓/鸿蒙）</text>
          <text x="722" y="536" fontSize="13" fill="#3a5f83">版本按平台多文件上传</text>
          <text x="722" y="557" fontSize="13" fill="#3a5f83">测试状态流转 + 上下线管理</text>

          <rect x="1050" y="462" width="290" height="150" rx="12" fill="#fff" stroke="#c9d9ea" filter="url(#shadow)" />
          <text x="1195" y="490" textAnchor="middle" fontSize="16" fontWeight="700" fill="#294968">角色与布局</text>
          <text x="1072" y="515" fontSize="13" fill="#3a5f83">MainLayout / TesterLayout</text>
          <text x="1072" y="536" fontSize="13" fill="#3a5f83">AdminLayout</text>
          <text x="1072" y="557" fontSize="13" fill="#3a5f83">右上角角色切换</text>

          <rect x="40" y="680" width="1340" height="180" rx="18" fill="#fffef9" stroke="#e4d8c4" strokeWidth="1.5" />
          <text x="62" y="712" fontSize="19" fontWeight="700" fill="#5a4632">后端与数据层（Express + JSON Store）</text>

          <rect x="100" y="738" width="400" height="96" rx="12" fill="#fff" stroke="#dfc9b3" filter="url(#shadow)" />
          <text x="300" y="764" textAnchor="middle" fontSize="16" fontWeight="700" fill="#6d4b35">后端路由聚合</text>
          <text x="130" y="787" fontSize="13" fill="#7a5a41">products / devices / plugins / firmware</text>
          <text x="130" y="808" fontSize="13" fill="#7a5a41">push / app-push / product-categories</text>

          <rect x="540" y="738" width="360" height="96" rx="12" fill="#fff" stroke="#dfc9b3" filter="url(#shadow)" />
          <text x="720" y="764" textAnchor="middle" fontSize="16" fontWeight="700" fill="#6d4b35">共享类型层</text>
          <text x="570" y="787" fontSize="13" fill="#7a5a41">@iot-platform/shared</text>
          <text x="570" y="808" fontSize="13" fill="#7a5a41">统一前后端数据契约</text>

          <rect x="940" y="738" width="360" height="96" rx="12" fill="#fff" stroke="#dfc9b3" filter="url(#shadow)" />
          <text x="1120" y="764" textAnchor="middle" fontSize="16" fontWeight="700" fill="#6d4b35">JSON 数据存储</text>
          <text x="970" y="787" fontSize="13" fill="#7a5a41">products.json / plugins.json / versions.json</text>
          <text x="970" y="808" fontSize="13" fill="#7a5a41">push-*.json / whitelist.json / uploads</text>

          <line x1="280" y1="340" x2="220" y2="462" stroke="#7b8794" strokeWidth="1.8" markerEnd="url(#arrow)" />
          <line x1="710" y1="340" x2="530" y2="462" stroke="#7b8794" strokeWidth="1.8" markerEnd="url(#arrow)" />
          <line x1="1140" y1="340" x2="1195" y2="462" stroke="#7b8794" strokeWidth="1.8" markerEnd="url(#arrow)" />

          <line x1="220" y1="612" x2="300" y2="738" stroke="#7b8794" strokeWidth="1.8" markerEnd="url(#arrow)" />
          <line x1="530" y1="612" x2="720" y2="738" stroke="#7b8794" strokeWidth="1.8" markerEnd="url(#arrow)" />
          <line x1="860" y1="612" x2="1120" y2="738" stroke="#7b8794" strokeWidth="1.8" markerEnd="url(#arrow)" />

          <line x1="300" y1="785" x2="540" y2="785" stroke="#9ba9b6" strokeWidth="1.5" strokeDasharray="6 5" markerEnd="url(#arrow)" />
          <line x1="900" y1="785" x2="940" y2="785" stroke="#9ba9b6" strokeWidth="1.5" strokeDasharray="6 5" markerEnd="url(#arrow)" />

          <text x="420" y="772" fontSize="12" fill="#8c7a65">类型约束</text>
          <text x="914" y="772" fontSize="12" fill="#8c7a65">落盘</text>
        </svg>
      </Card>
    </div>
  );
};

export default Roadmap;
