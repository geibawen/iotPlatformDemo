import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { JsonStore } from '../storage/jsonStore.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import type { Firmware, OtaTask } from '@iot-platform/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../data/uploads');

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    cb(null, `${uuid()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

const firmwareStore = new JsonStore<Firmware>('firmwares.json');
const otaTaskStore = new JsonStore<OtaTask>('ota-tasks.json');

export const firmwareRoutes = Router();

// --- Firmware CRUD ---

firmwareRoutes.get('/', async (req, res) => {
  const all = await firmwareStore.readAll();
  const productId = req.query.productId as string | undefined;
  const result = productId ? all.filter((f) => f.productId === productId) : all;
  res.json(result);
});

firmwareRoutes.get('/:id', async (req, res, next) => {
  const item = await firmwareStore.findById(req.params.id);
  if (!item) return next(new NotFoundError('固件', req.params.id));
  res.json(item);
});

firmwareRoutes.post('/', upload.single('file'), async (req, res) => {
  const now = new Date().toISOString();
  const firmware: Firmware = {
    id: uuid(),
    productId: req.body.productId,
    version: req.body.version,
    fileName: req.file ? req.file.originalname : req.body.fileName || '',
    fileSize: req.file ? req.file.size : Number(req.body.fileSize) || 0,
    releaseNotes: req.body.releaseNotes || '',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
  await firmwareStore.create(firmware);
  res.status(201).json(firmware);
});

firmwareRoutes.put('/:id', async (req, res, next) => {
  const updated = await firmwareStore.update(req.params.id, req.body);
  if (!updated) return next(new NotFoundError('固件', req.params.id));
  res.json(updated);
});

firmwareRoutes.delete('/:id', async (req, res, next) => {
  const ok = await firmwareStore.delete(req.params.id);
  if (!ok) return next(new NotFoundError('固件', req.params.id));
  res.status(204).end();
});

// --- OTA Tasks ---

firmwareRoutes.get('/ota-tasks/list', async (req, res) => {
  const all = await otaTaskStore.readAll();
  const productId = req.query.productId as string | undefined;
  const result = productId ? all.filter((t) => t.productId === productId) : all;
  res.json(result);
});

firmwareRoutes.get('/ota-tasks/:id', async (req, res, next) => {
  const item = await otaTaskStore.findById(req.params.id);
  if (!item) return next(new NotFoundError('OTA任务', req.params.id));
  res.json(item);
});

firmwareRoutes.post('/ota-tasks', async (req, res) => {
  const now = new Date().toISOString();
  const task: OtaTask = {
    id: uuid(),
    firmwareId: req.body.firmwareId,
    productId: req.body.productId,
    name: req.body.name,
    strategy: req.body.strategy || 'prompt',
    targetScope: req.body.targetScope || 'all',
    targetVersions: req.body.targetVersions || [],
    status: 'pending',
    totalDevices: req.body.totalDevices || 0,
    upgradedDevices: 0,
    failedDevices: 0,
    createdAt: now,
    updatedAt: now,
  };
  await otaTaskStore.create(task);
  res.status(201).json(task);
});

firmwareRoutes.put('/ota-tasks/:id', async (req, res, next) => {
  const updated = await otaTaskStore.update(req.params.id, req.body);
  if (!updated) return next(new NotFoundError('OTA任务', req.params.id));
  res.json(updated);
});

firmwareRoutes.post('/ota-tasks/:id/start', async (req, res, next) => {
  const updated = await otaTaskStore.update(req.params.id, { status: 'running' });
  if (!updated) return next(new NotFoundError('OTA任务', req.params.id));
  res.json(updated);
});

firmwareRoutes.post('/ota-tasks/:id/pause', async (req, res, next) => {
  const updated = await otaTaskStore.update(req.params.id, { status: 'paused' });
  if (!updated) return next(new NotFoundError('OTA任务', req.params.id));
  res.json(updated);
});

firmwareRoutes.delete('/ota-tasks/:id', async (req, res, next) => {
  const ok = await otaTaskStore.delete(req.params.id);
  if (!ok) return next(new NotFoundError('OTA任务', req.params.id));
  res.status(204).end();
});
