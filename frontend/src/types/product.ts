export type ProductCategory = string;

export type ConnectionType = 'WiFi' | 'BLE' | 'Zigbee' | 'ZWave' | 'Cellular' | 'Ethernet';

export type ProductStatus = 'draft' | 'published';

export interface Product {
  id: string;
  name: string;
  image: string; // base64 data URL
  description: string;
  category: ProductCategory;
  connectionType: ConnectionType;
  status: ProductStatus;
  inheritedFromProductId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload extends Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'status'> {
  status?: ProductStatus;
  baseProductId?: string;
}

export interface ProductCategoryItem {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  light: '灯具',
  switch: '开关',
  sensor: '传感器',
  gateway: '网关',
  camera: '摄像头',
  appliance: '家电',
  other: '其他',
};

export const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
  WiFi: 'Wi-Fi',
  BLE: '蓝牙 BLE',
  Zigbee: 'Zigbee',
  ZWave: 'Z-Wave',
  Cellular: '蜂窝网络',
  Ethernet: '以太网',
};
