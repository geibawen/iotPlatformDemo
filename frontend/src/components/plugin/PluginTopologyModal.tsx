import React, { useMemo } from 'react';
import { Modal, Space, Tag, Typography } from 'antd';
import type { Plugin } from '../../types/plugin';
import type { Product } from '../../types/product';

interface PluginTopologyModalProps {
  open: boolean;
  plugins: Plugin[];
  products: Product[];
  onCancel: () => void;
}

const PLUGIN_NODE_WIDTH = 260;
const PRODUCT_NODE_WIDTH = 260;
const NODE_HEIGHT = 56;
const START_Y = 56;
const GAP_Y = 26;
const SVG_WIDTH = 1120;
const PLUGIN_X = 120;
const PRODUCT_X = 740;

const PluginTopologyModal: React.FC<PluginTopologyModalProps> = ({ open, plugins, products, onCancel }) => {
  const devicePlugins = useMemo(
    () => plugins.filter((plugin) => plugin.type === 'device'),
    [plugins]
  );

  const relatedProductIds = useMemo(() => {
    const ids = new Set<string>();
    devicePlugins.forEach((plugin) => {
      const safeProductIds = Array.isArray(plugin.productIds) ? plugin.productIds : [];
      safeProductIds.forEach((id) => ids.add(id));
    });
    return ids;
  }, [devicePlugins]);

  const relatedProducts = useMemo(() => {
    const selected = products.filter((product) => relatedProductIds.has(product.id));
    const unlinked = products.filter((product) => !relatedProductIds.has(product.id));
    return [...selected, ...unlinked];
  }, [products, relatedProductIds]);

  const pluginYMap = useMemo(() => {
    const map = new Map<string, number>();
    devicePlugins.forEach((plugin, idx) => {
      map.set(plugin.id, START_Y + idx * (NODE_HEIGHT + GAP_Y));
    });
    return map;
  }, [devicePlugins]);

  const productYMap = useMemo(() => {
    const map = new Map<string, number>();
    relatedProducts.forEach((product, idx) => {
      map.set(product.id, START_Y + idx * (NODE_HEIGHT + GAP_Y));
    });
    return map;
  }, [relatedProducts]);

  const connections = useMemo(() => {
    const lines: Array<{
      key: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      isOnline: boolean;
    }> = [];

    devicePlugins.forEach((plugin) => {
      const pluginY = pluginYMap.get(plugin.id);
      if (pluginY === undefined) return;

      const safeProductIds = Array.isArray(plugin.productIds) ? plugin.productIds : [];
      safeProductIds.forEach((productId) => {
        const productY = productYMap.get(productId);
        if (productY === undefined) return;

        lines.push({
          key: `${plugin.id}-${productId}`,
          x1: PLUGIN_X + PLUGIN_NODE_WIDTH,
          y1: pluginY + NODE_HEIGHT / 2,
          x2: PRODUCT_X,
          y2: productY + NODE_HEIGHT / 2,
          isOnline: plugin.status === 'active',
        });
      });
    });

    return lines;
  }, [devicePlugins, pluginYMap, productYMap]);

  const svgHeight = Math.max(
    START_Y * 2 + 120,
    START_Y + Math.max(devicePlugins.length, relatedProducts.length) * (NODE_HEIGHT + GAP_Y)
  );

  const onlineCount = devicePlugins.filter((plugin) => plugin.status === 'active').length;
  const offlineCount = devicePlugins.length - onlineCount;

  return (
    <Modal
      title="插件拓扑图"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1180}
      destroyOnHidden
    >
      <Space style={{ marginBottom: 12 }} wrap>
        <Tag color="green">上线插件 {onlineCount}</Tag>
        <Tag color="default">未上线插件 {offlineCount}</Tag>
        <Tag color="blue">关联关系 {connections.length}</Tag>
      </Space>

      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        左侧为设备插件，右侧为产品；连线表示关联关系，绿色连线表示插件已上线，灰色连线表示未上线。
      </Typography.Paragraph>

      <div style={{
        border: '1px solid #f0f0f0',
        borderRadius: 10,
        background: 'linear-gradient(135deg, #fcfcfc 0%, #f7fbff 100%)',
        overflow: 'auto',
        maxHeight: 620,
      }}>
        <svg width="100%" viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`} role="img" aria-label="插件和产品拓扑关系图">
          <text x={PLUGIN_X} y={30} fill="#1f2937" fontSize="16" fontWeight={700}>设备插件</text>
          <text x={PRODUCT_X} y={30} fill="#1f2937" fontSize="16" fontWeight={700}>产品</text>

          {connections.map((line) => (
            <line
              key={line.key}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.isOnline ? '#16a34a' : '#94a3b8'}
              strokeWidth={1.8}
              strokeOpacity={0.9}
            />
          ))}

          {devicePlugins.map((plugin) => {
            const y = pluginYMap.get(plugin.id) || START_Y;
            const isOnline = plugin.status === 'active';
            return (
              <g key={plugin.id}>
                <rect
                  x={PLUGIN_X}
                  y={y}
                  rx={10}
                  ry={10}
                  width={PLUGIN_NODE_WIDTH}
                  height={NODE_HEIGHT}
                  fill={isOnline ? '#ecfdf3' : '#f8fafc'}
                  stroke={isOnline ? '#16a34a' : '#94a3b8'}
                />
                <text x={PLUGIN_X + 14} y={y + 24} fill="#111827" fontSize="13" fontWeight={700}>
                  {plugin.name}
                </text>
                <text x={PLUGIN_X + 14} y={y + 42} fill={isOnline ? '#15803d' : '#64748b'} fontSize="12">
                  {isOnline ? '上线' : '未上线'}
                </text>
              </g>
            );
          })}

          {relatedProducts.map((product) => {
            const y = productYMap.get(product.id) || START_Y;
            const hasRelation = relatedProductIds.has(product.id);
            return (
              <g key={product.id}>
                <rect
                  x={PRODUCT_X}
                  y={y}
                  rx={10}
                  ry={10}
                  width={PRODUCT_NODE_WIDTH}
                  height={NODE_HEIGHT}
                  fill={hasRelation ? '#eff6ff' : '#f8fafc'}
                  stroke={hasRelation ? '#3b82f6' : '#cbd5e1'}
                />
                <text x={PRODUCT_X + 14} y={y + 24} fill="#111827" fontSize="13" fontWeight={700}>
                  {product.name}
                </text>
                <text x={PRODUCT_X + 14} y={y + 42} fill={hasRelation ? '#2563eb' : '#64748b'} fontSize="12">
                  {hasRelation ? '已被关联' : '暂未关联'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Modal>
  );
};

export default PluginTopologyModal;
