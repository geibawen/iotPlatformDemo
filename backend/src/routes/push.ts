import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { JsonStore } from '../storage/jsonStore.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import type { PushRule, PushChannel, MessageTemplate, PushLog } from '@iot-platform/shared';

const ruleStore = new JsonStore<PushRule>('push-rules.json');
const channelStore = new JsonStore<PushChannel>('push-channels.json');
const templateStore = new JsonStore<MessageTemplate>('push-templates.json');
const logStore = new JsonStore<PushLog>('push-logs.json');

export const pushRoutes = Router();

// --- Rules ---
pushRoutes.get('/rules', async (_req, res) => { res.json(await ruleStore.readAll()); });

pushRoutes.post('/rules', async (req, res) => {
  const now = new Date().toISOString();
  const rule: PushRule = { ...req.body, id: uuid(), createdAt: now, updatedAt: now };
  await ruleStore.create(rule);
  res.status(201).json(rule);
});

pushRoutes.put('/rules/:id', async (req, res, next) => {
  const updated = await ruleStore.update(req.params.id, req.body);
  if (!updated) return next(new NotFoundError('规则', req.params.id));
  res.json(updated);
});

pushRoutes.delete('/rules/:id', async (req, res, next) => {
  const ok = await ruleStore.delete(req.params.id);
  if (!ok) return next(new NotFoundError('规则', req.params.id));
  res.status(204).end();
});

// --- Channels ---
pushRoutes.get('/channels', async (_req, res) => { res.json(await channelStore.readAll()); });

pushRoutes.post('/channels', async (req, res) => {
  const now = new Date().toISOString();
  const channel: PushChannel = { ...req.body, id: uuid(), createdAt: now, updatedAt: now };
  await channelStore.create(channel);
  res.status(201).json(channel);
});

pushRoutes.put('/channels/:id', async (req, res, next) => {
  const updated = await channelStore.update(req.params.id, req.body);
  if (!updated) return next(new NotFoundError('通道', req.params.id));
  res.json(updated);
});

pushRoutes.delete('/channels/:id', async (req, res, next) => {
  const ok = await channelStore.delete(req.params.id);
  if (!ok) return next(new NotFoundError('通道', req.params.id));
  res.status(204).end();
});

// --- Templates ---
pushRoutes.get('/templates', async (_req, res) => { res.json(await templateStore.readAll()); });

pushRoutes.post('/templates', async (req, res) => {
  const now = new Date().toISOString();
  const tpl: MessageTemplate = { ...req.body, id: uuid(), createdAt: now, updatedAt: now };
  await templateStore.create(tpl);
  res.status(201).json(tpl);
});

pushRoutes.put('/templates/:id', async (req, res, next) => {
  const updated = await templateStore.update(req.params.id, req.body);
  if (!updated) return next(new NotFoundError('模板', req.params.id));
  res.json(updated);
});

pushRoutes.delete('/templates/:id', async (req, res, next) => {
  const ok = await templateStore.delete(req.params.id);
  if (!ok) return next(new NotFoundError('模板', req.params.id));
  res.status(204).end();
});

// --- Logs ---
pushRoutes.get('/logs', async (req, res) => {
  const all = await logStore.readAll();
  const status = req.query.status as string;
  res.json(status ? all.filter((l) => l.status === status) : all);
});

pushRoutes.post('/logs', async (req, res) => {
  const log: PushLog = { ...req.body, id: uuid() };
  const all = await logStore.readAll();
  all.unshift(log);
  await logStore.writeAll(all.slice(0, 500));
  res.status(201).json(log);
});

pushRoutes.delete('/logs', async (_req, res) => {
  await logStore.writeAll([]);
  res.status(204).end();
});
