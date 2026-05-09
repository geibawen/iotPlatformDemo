import React, { useState } from 'react';
import { Tabs, Card, Empty, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PluginList from './PluginList';

const PluginManage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('device');

  const tabItems = [
    {
      key: 'device',
      label: '设备插件管理',
      children: <PluginList />,
    },
    {
      key: 'functional',
      label: '功能插件管理',
      children: (
        <Card>
          <div style={{ textAlign: 'center', paddingTop: 60, paddingBottom: 60 }}>
            <Typography.Title level={4}>功能插件管理</Typography.Title>
            <Empty
              description="功能插件管理功能敬请期待"
              style={{ marginTop: 16 }}
            >
              <Button type="primary" icon={<PlusOutlined />} disabled>
                新建功能插件
              </Button>
            </Empty>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>插件管理</Typography.Title>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />
    </div>
  );
};

export default PluginManage;
