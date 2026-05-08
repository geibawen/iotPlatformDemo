import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { JsonStore } from '../storage/jsonStore.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import type { AppPushMessage } from '@iot-platform/shared';

const store = new JsonStore<AppPushMessage>('app-push-messages.json');
export const appPushRoutes = Router();

appPushRoutes.get('/messages', async (_req, res) => {
  const all = await store.readAll();
  res.json(all);
});

appPushRoutes.get('/messages/:id', async (req, res, next) => {
  const item = await store.findById(req.params.id);
  if (!item) return next(new NotFoundError('推送消息', req.params.id));
  res.json(item);
});

appPushRoutes.post('/messages', async (req, res) => {
  const now = new Date().toISOString();
  const msg: AppPushMessage = {
    id: uuid(),
    title: req.body.title,
    content: req.body.content,
    type: req.body.type || 'notification',
    targetType: req.body.targetType || 'all',
    targetProductIds: req.body.targetProductIds,
    scheduledAt: req.body.scheduledAt,
    status: req.body.scheduledAt ? 'scheduled' : 'draft',
    statistics: { total: 0, sent: 0, delivered: 0, opened: 0 },
    createdAt: now,
    updatedAt: now,
  };
  await store.create(msg);
  res.status(201).json(msg);
});

appPushRoutes.put('/messages/:id', async (req, res, next) => {
  const updated = await store.update(req.params.id, req.body);
  if (!updated) return next(new NotFoundError('推送消息', req.params.id));
  res.json(updated);
});

appPushRoutes.post('/messages/:id/send', async (req, res, next) => {
  const msg = await store.findById(req.params.id);
  if (!msg) return next(new NotFoundError('推送消息', req.params.id));
  const total = msg.statistics.total || Math.floor(Math.random() * 1000) + 100;
  const sent = Math.floor(total * (0.95 + Math.random() * 0.05));
  const delivered = Math.floor(sent * (0.9 + Math.random() * 0.1));
  const opened = Math.floor(delivered * (0.3 + Math.random() * 0.4));
  const updated = await store.update(req.params.id, {
    status: 'sent',
    sentAt: new Date().toISOString(),
    statistics: { total, sent, delivered, opened },
  });
  res.json(updated);
});

appPushRoutes.delete('/messages/:id', async (req, res, next) => {
  const ok = await store.delete(req.params.id);
  if (!ok) return next(new NotFoundError('推送消息', req.params.id));
  res.status(204).end();
});

appPushRoutes.get('/statistics', async (_req, res) => {
  const all = await store.readAll();
  const totals = all.reduce(
    (acc, msg) => {
      acc.totalMessages++;
      acc.totalSent += msg.statistics.sent;
      acc.totalDelivered += msg.statistics.delivered;
      acc.totalOpened += msg.statistics.opened;
      if (msg.status === 'sent') acc.sentMessages++;
      return acc;
    },
    { totalMessages: 0, sentMessages: 0, totalSent: 0, totalDelivered: 0, totalOpened: 0 },
  );
  res.json(totals);
});
