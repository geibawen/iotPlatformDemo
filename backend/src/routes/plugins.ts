import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { JsonStore } from '../storage/jsonStore.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import type { Plugin, PluginVersion } from '@iot-platform/shared';

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

pluginRoutes.post('/:pid/versions', upload.single('file'), async (req, res) => {
  const now = new Date().toISOString();
  const file = req.file;
  const version: PluginVersion = {
    id: uuid(),
    pluginId: req.params.pid as string,
    version: req.body.version,
    releaseNotes: req.body.releaseNotes || '',
    fileName: file ? file.originalname : req.body.fileName || 'unknown.zip',
    fileSize: file ? file.size : Number(req.body.fileSize) || 0,
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

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['waiting_test'],
  waiting_test: ['testing'],
  testing: ['approved', 'rejected'],
  rejected: ['draft'],
  approved: ['online'],
  online: ['offline'],
  offline: ['online'],
};

pluginRoutes.put('/versions/:id/status', async (req, res, next) => {
  const version = await versionStore.findById(req.params.id);
  if (!version) return next(new NotFoundError('版本', req.params.id));
  const { status } = req.body;
  const allowed = VALID_TRANSITIONS[version.status] || [];
  if (!allowed.includes(status)) {
    res.status(400).json({ error: `不允许从 "${version.status}" 流转到 "${status}"` });
    return;
  }
  const updated = await versionStore.update(req.params.id, { status });
  res.json(updated);
});

pluginRoutes.delete('/versions/:id', async (req, res, next) => {
  const ok = await versionStore.delete(req.params.id);
  if (!ok) return next(new NotFoundError('版本', req.params.id));
  res.status(204).end();
});
