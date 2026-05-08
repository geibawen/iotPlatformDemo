import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { productRoutes } from './routes/products.js';
import { thingModelRoutes } from './routes/thingModel.js';
import { pluginRoutes } from './routes/plugins.js';
import { pushRoutes } from './routes/push.js';
import { productCategoryRoutes } from './routes/productCategories.js';
import { deviceRoutes } from './routes/devices.js';
import { firmwareRoutes } from './routes/firmware.js';
import { appPushRoutes } from './routes/appPush.js';
import { whitelistRoutes } from './routes/whitelist.js';
import { errorHandler } from './middleware/errorHandler.js';
import { seedDataIfEmpty } from './storage/seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: [/localhost:\d+$/, /127\.0\.0\.1:\d+$/] }));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));

// Static files: plugin uploads
app.use('/uploads', express.static(path.join(__dirname, '../data/uploads')));

// API routes
app.use('/api/products', productRoutes);
app.use('/api/product-categories', productCategoryRoutes);
app.use('/api', thingModelRoutes);
app.use('/api/plugins', pluginRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/firmwares', firmwareRoutes);
app.use('/api/app-push', appPushRoutes);
app.use('/api/whitelist', whitelistRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use(errorHandler);

// Seed + start
seedDataIfEmpty().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Backend running at http://localhost:${PORT}`);
  });
});
