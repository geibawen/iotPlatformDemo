import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import TesterLayout from './layouts/TesterLayout';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import AdminLayout from './layouts/AdminLayout';
import ProductList from './pages/product/ProductList';
import ProductDetail from './pages/product/ProductDetail';
import PluginList from './pages/plugin/PluginList';
import FunctionalPluginList from './pages/plugin/FunctionalPluginList';
import PluginDetail from './pages/plugin/PluginDetail';
import PushRules from './pages/push/PushRules';
import PushChannels from './pages/push/PushChannels';
import MessageTemplates from './pages/push/MessageTemplates';
import PushLogs from './pages/push/PushLogs';
import FirmwareList from './pages/firmware/FirmwareList';
import OtaTaskList from './pages/firmware/OtaTaskList';
import DeviceList from './pages/device/DeviceList';
import AppPushMessages from './pages/appPush/AppPushMessages';
import AppPushStats from './pages/appPush/AppPushStats';
import TesterPluginList from './pages/tester/TesterPluginList';
import WhitelistManage from './pages/tester/WhitelistManage';
import { useProductStore } from './stores/productStore';
import { usePluginStore } from './stores/pluginStore';
import { usePushStore } from './stores/pushStore';
import { useDeviceStore } from './stores/deviceStore';
import { useFirmwareStore } from './stores/firmwareStore';
import ProductCategoryManage from './pages/admin/ProductCategoryManage';
import { useProductCategoryStore } from './stores/productCategoryStore';

function AppInit() {
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const fetchPlugins = usePluginStore((s) => s.fetchPlugins);
  const fetchAll = usePushStore((s) => s.fetchAll);
  const fetchDevices = useDeviceStore((s) => s.fetchDevices);
  const fetchFirmwares = useFirmwareStore((s) => s.fetchFirmwares);
  const fetchCategories = useProductCategoryStore((s) => s.fetchCategories);

  useEffect(() => {
    fetchProducts();
    fetchPlugins();
    fetchAll();
    fetchDevices();
    fetchFirmwares();
    fetchCategories();
  }, [fetchProducts, fetchPlugins, fetchAll, fetchDevices, fetchFirmwares, fetchCategories]);

  return null;
}

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <AppInit />
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="roadmap" element={<Roadmap />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="devices" element={<DeviceList />} />
              <Route path="plugins" element={<Navigate to="/plugins/device" replace />} />
              <Route path="plugins/device" element={<PluginList />} />
              <Route path="plugins/functional" element={<FunctionalPluginList />} />
              <Route path="plugins/:id" element={<PluginDetail />} />
              <Route path="firmware" element={<FirmwareList />} />
              <Route path="ota-tasks" element={<OtaTaskList />} />
              <Route path="push/rules" element={<PushRules />} />
              <Route path="push/channels" element={<PushChannels />} />
              <Route path="push/templates" element={<MessageTemplates />} />
              <Route path="push/logs" element={<PushLogs />} />
              <Route path="app-push/messages" element={<AppPushMessages />} />
              <Route path="app-push/statistics" element={<AppPushStats />} />
            </Route>
            <Route path="/tester" element={<TesterLayout />}>
              <Route index element={<Navigate to="/tester/plugins" replace />} />
              <Route path="plugins" element={<TesterPluginList />} />
              <Route path="whitelist" element={<WhitelistManage />} />
            </Route>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/product-categories" replace />} />
              <Route path="product-categories" element={<ProductCategoryManage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
