import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { JsonStore } from '../storage/jsonStore.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import type { Plugin, PluginVersion, Platform } from '@iot-platform/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../../data/uploads');

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuid()}${ext}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const pluginStore = new JsonStore<Plugin>('plugins.json');
const versionStore = new JsonStore<PluginVersion>('versions.json');

export const pluginRoutes = Router();

// --- Plugins ---
pluginRoutes.get('/', async (_req, res) => {
  res.json(await pluginStore.readAll());
});

pluginRoutes.get('/:id', async (req, res, next) => {
  const item = await pluginStore.findById(req.params.id);
  if (!item) return next(new NotFoundError('插件', req.params.id));
  res.json(item);
});

pluginRoutes.post('/', async (req, res) => {
  const now = new Date().toISOString();
  const plugin: Plugin = { ...req.body, id: uuid(), createdAt: now, updatedAt: now };
  await pluginStore.create(plugin);
  res.status(201).json(plugin);
});

pluginRoutes.put('/:id', async (req, res, next) => {
  const updated = await pluginStore.update(req.params.id, req.body);
  if (!updated) return next(new NotFoundError('插件', req.params.id));
  res.json(updated);
});

pluginRoutes.delete('/:id', async (req, res, next) => {
  const ok = await pluginStore.delete(req.params.id);
  if (!ok) return next(new NotFoundError('插件', req.params.id));
  await versionStore.deleteByField('pluginId', req.params.id);
  res.status(204).end();
});

// --- Versions ---
pluginRoutes.get('/:pid/versions', async (req, res) => {
  const all = await versionStore.readAll();
  res.json(all.filter((v) => v.pluginId === req.params.pid));
});

pluginRoutes.post('/:pid/versions', upload.array('files'), async (req, res) => {
  const now = new Date().toISOString();
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: '请上传至少一个插件包文件' });
  }

  // 声明 platforms 字段，必须包含 iOS 和 Android
  const platformsStr = req.body.platforms;
  let platforms: string[] = [];
  if (platformsStr) {
    try {
      platforms = typeof platformsStr === 'string' ? JSON.parse(platformsStr) : platformsStr;
    } catch {
      platforms = [];
    }
  }

  // 验证平台信息与文件数量匹配
  if (platforms.length !== files.length) {
    return res.status(400).json({ error: '平台数量与文件数量不匹配' });
  }

  // 验证平台是否包含必选的 iOS 和 Android
  if (!platforms.includes('iOS') || !platforms.includes('Android')) {
    return res.status(400).json({ error: '必须包含 iOS 和 Android 平台' });
  }

  const versionFiles = files.map((file, index) => ({
    platform: platforms[index] as Platform,
    fileName: file.originalname,
    fileSize: file.size,
    filePath: file.path,
  }));

  const version: PluginVersion = {
    id: uuid(),
    pluginId: req.params.pid as string,
    version: req.body.version,
    releaseNotes: req.body.releaseNotes || '',
    files: versionFiles,
    status: 'draft',
    createdAt: now,
  };
  await versionStore.create(version);
  res.status(201).json(version);
});

pluginRoutes.put('/versions/:id', async (req, res, next) => {
  const updated = await versionStore.update(req.params.id, req.body);
  if (!updated) return next(new NotFoundError('版本', req.params.id));
  res.json(updated);
});

pluginRoutes.delete('/versions/:id', async (req, res, next) => {
  const ok = await versionStore.delete(req.params.id);
  if (!ok) return next(new NotFoundError('版本', req.params.id));
  res.status(204).end();
});
