import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { MessageOutlined, CheckCircleOutlined, EyeOutlined, SendOutlined } from '@ant-design/icons';
import { api } from '../../api/client';

interface Stats {
  totalMessages: number;
  sentMessages: number;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
}

export default function AppPushStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>('/app-push/statistics').then(setStats);
  }, []);

  if (!stats) return <Card loading />;

  const deliveryRate = stats.totalSent > 0 ? ((stats.totalDelivered / stats.totalSent) * 100).toFixed(1) : '0';
  const openRate = stats.totalDelivered > 0 ? ((stats.totalOpened / stats.totalDelivered) * 100).toFixed(1) : '0';

  return (
    <Card title="推送统计">
      <Row gutter={[24, 24]}>
        <Col span={6}>
          <Statistic title="消息总数" value={stats.totalMessages} prefix={<MessageOutlined />} />
        </Col>
        <Col span={6}>
          <Statistic title="已发送" value={stats.sentMessages} prefix={<SendOutlined />} />
        </Col>
        <Col span={6}>
          <Statistic title="总送达" value={stats.totalDelivered} prefix={<CheckCircleOutlined />} />
        </Col>
        <Col span={6}>
          <Statistic title="总打开" value={stats.totalOpened} prefix={<EyeOutlined />} />
        </Col>
        <Col span={6}>
          <Statistic title="送达率" value={deliveryRate} suffix="%" />
        </Col>
        <Col span={6}>
          <Statistic title="打开率" value={openRate} suffix="%" />
        </Col>
        <Col span={6}>
          <Statistic title="总发送量" value={stats.totalSent} />
        </Col>
      </Row>
    </Card>
  );
}
