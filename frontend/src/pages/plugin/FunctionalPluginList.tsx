import React from 'react';
import { Card, Empty, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const FunctionalPluginList: React.FC = () => {
  return (
    <Card>
      <div style={{ textAlign: 'center', paddingTop: 60, paddingBottom: 60 }}>
        <Typography.Title level={4}>功能插件管理</Typography.Title>
        <Empty description="功能插件管理功能敬请期待" style={{ marginTop: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} disabled>
            新建功能插件
          </Button>
        </Empty>
      </div>
    </Card>
  );
};

export default FunctionalPluginList;
