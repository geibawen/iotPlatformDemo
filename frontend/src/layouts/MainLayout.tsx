import React, { useState } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ApiOutlined,
  NotificationOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CloudServerOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

const ROLE_LABELS: Record<string, string> = {
  developer: '开发者',
  tester: '测试人员',
  admin: '系统管理员',
};

function resolveRole(pathname: string): keyof typeof ROLE_LABELS {
  if (pathname.startsWith('/tester')) return 'tester';
  if (pathname.startsWith('/admin')) return 'admin';
  return 'developer';
}

const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '概览',
  },
  {
    key: '/roadmap',
    icon: <ApartmentOutlined />,
    label: 'Roadmap',
  },
  {
    key: '/products',
    icon: <AppstoreOutlined />,
    label: '产品管理',
  },
  {
    key: '/devices',
    icon: <CloudServerOutlined />,
    label: '设备管理',
  },
  {
    key: 'plugins',
    icon: <ApiOutlined />,
    label: '插件管理',
    children: [
      { key: '/plugins/device', label: '设备插件管理' },
      { key: '/plugins/functional', label: '功能插件管理' },
    ],
  },
  {
    key: 'firmware',
    icon: <CloudServerOutlined />,
    label: 'OTA 管理',
    children: [
      { key: '/firmware', label: '固件列表' },
      { key: '/ota-tasks', label: '升级任务' },
    ],
  },
  {
    key: 'push',
    icon: <NotificationOutlined />,
    label: '推送配置',
    children: [
      { key: '/push/rules', label: '推送规则' },
      { key: '/push/channels', label: '推送通道' },
      { key: '/push/templates', label: '消息模板' },
      { key: '/push/logs', label: '推送日志' },
    ],
  },
  {
    key: 'app-push',
    icon: <NotificationOutlined />,
    label: 'App 推送',
    children: [
      { key: '/app-push/messages', label: '消息管理' },
      { key: '/app-push/statistics', label: '推送统计' },
    ],
  },
];

const roleMenuItems: MenuProps['items'] = [
  { key: '/dashboard', label: '切换到开发者' },
  { key: '/tester/plugins', label: '切换到测试人员' },
  { key: '/admin/product-categories', label: '切换到系统管理员' },
];

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentRole = resolveRole(location.pathname);

  const selectedKey = location.pathname === '/plugins' || location.pathname.startsWith('/plugins/')
    ? (location.pathname === '/plugins/functional' ? '/plugins/functional' : '/plugins/device')
    : location.pathname;
  const openKeys = [
    ...(selectedKey.startsWith('/plugins') ? ['plugins'] : []),
    ...(selectedKey.startsWith('/push') ? ['push'] : []),
    ...(selectedKey.startsWith('/firmware') || selectedKey.startsWith('/ota-tasks') ? ['firmware'] : []),
    ...(selectedKey.startsWith('/app-push') ? ['app-push'] : []),
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 20px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <CloudServerOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          {!collapsed && (
            <Typography.Title
              level={5}
              style={{ margin: '0 0 0 10px', whiteSpace: 'nowrap', color: '#1677ff' }}
            >
              IoT 开发者平台
            </Typography.Title>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ cursor: 'pointer', fontSize: 18 }} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Dropdown menu={{ items: roleMenuItems, onClick: ({ key }) => navigate(String(key)) }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
              <span>{`Demo 用户 (${ROLE_LABELS[currentRole]})`}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 24,
            minHeight: 'calc(100vh - 64px - 48px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
