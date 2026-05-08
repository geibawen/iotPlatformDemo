import { Layout, Menu, theme, Avatar, Dropdown, Space } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ExperimentOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = [
  {
    key: '/tester/plugins',
    icon: <ExperimentOutlined />,
    label: '插件测试',
  },
  {
    key: '/tester/whitelist',
    icon: <SafetyOutlined />,
    label: '白名单管理',
  },
];

const roleMenuItems: MenuProps['items'] = [
  { key: '/dashboard', label: '切换到开发者' },
  { key: '/tester/plugins', label: '切换到测试人员' },
  { key: '/admin/product-categories', label: '切换到系统管理员' },
];

export default function TesterLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} style={{ background: colorBgContainer }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 16 }}>
          测试人员工作台
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, color: '#999' }}>平台测试人员视角（无需登录）</span>
          <Dropdown menu={{ items: roleMenuItems, onClick: ({ key }) => navigate(String(key)) }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
              <span>Demo 用户 (测试人员)</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24 }}>
          <div style={{ padding: 24, background: colorBgContainer, borderRadius: borderRadiusLG, minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
