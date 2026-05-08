import React from 'react';
import { Card, Col, Row, Statistic, List, Tag, Typography, Empty, Button } from 'antd';
import {
  AppstoreOutlined,
  ApiOutlined,
  NotificationOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../stores/productStore';
import { usePluginStore } from '../stores/pluginStore';
import { usePushStore } from '../stores/pushStore';
import dayjs from 'dayjs';

const Dashboard: React.FC = () => {
  const products = useProductStore((s) => s.products);
  const plugins = usePluginStore((s) => s.plugins);
  const rules = usePushStore((s) => s.rules);
  const logs = usePushStore((s) => s.logs);
  const navigate = useNavigate();

  const publishedCount = products.filter((p) => p.status === 'published').length;
  const activePlugins = plugins.filter((p) => p.status === 'active').length;
  const enabledRules = rules.filter((r) => r.enabled).length;

  const recentLogs = logs.slice(0, 5);

  if (products.length === 0 && plugins.length === 0) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 120 }}>
        <Empty description="还没有任何数据，开始创建你的第一个产品吧！">
          <Button type="primary" onClick={() => navigate('/products')}>
            创建产品
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 24 }}>
        平台概览
      </Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/products')}>
            <Statistic
              title="产品总数"
              value={products.length}
              prefix={<AppstoreOutlined style={{ color: '#1677ff' }} />}
              suffix={
                <span style={{ fontSize: 14, color: '#999' }}>
                  / 已发布 {publishedCount}
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/plugins')}>
            <Statistic
              title="插件总数"
              value={plugins.length}
              prefix={<ApiOutlined style={{ color: '#52c41a' }} />}
              suffix={
                <span style={{ fontSize: 14, color: '#999' }}>
                  / 启用 {activePlugins}
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/push/rules')}>
            <Statistic
              title="推送规则"
              value={rules.length}
              prefix={<NotificationOutlined style={{ color: '#faad14' }} />}
              suffix={
                <span style={{ fontSize: 14, color: '#999' }}>
                  / 启用 {enabledRules}
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/push/logs')}>
            <Statistic
              title="推送日志"
              value={logs.length}
              prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
              suffix={
                <span style={{ fontSize: 14, color: '#999' }}>条</span>
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="产品列表" extra={<a onClick={() => navigate('/products')}>查看全部</a>}>
            <List
              dataSource={products.slice(0, 5)}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/products/${item.id}`)}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={item.description}
                  />
                  <Tag color={item.status === 'published' ? 'green' : 'default'}>
                    {item.status === 'published' ? '已发布' : '草稿'}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近推送日志" extra={<a onClick={() => navigate('/push/logs')}>查看全部</a>}>
            {recentLogs.length === 0 ? (
              <Empty description="暂无推送日志" />
            ) : (
              <List
                dataSource={recentLogs}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <span>
                          {item.ruleName}{' '}
                          <Tag
                            icon={item.status === 'success' ? <CheckCircleOutlined /> : undefined}
                            color={item.status === 'success' ? 'success' : 'error'}
                          >
                            {item.status === 'success' ? '成功' : '失败'}
                          </Tag>
                        </span>
                      }
                      description={`${item.deviceName} · ${dayjs(item.timestamp).format('MM-DD HH:mm:ss')}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
