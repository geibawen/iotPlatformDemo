import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { JsonStore } from '../storage/jsonStore.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import type { WhitelistEntry } from '@iot-platform/shared';

const store = new JsonStore<WhitelistEntry>('whitelist.json');
export const whitelistRoutes = Router();

whitelistRoutes.get('/', async (req, res) => {
  const all = await store.readAll();
  const pluginId = req.query.pluginId as string | undefined;
  const result = pluginId ? all.filter((e) => e.pluginId === pluginId) : all;
  res.json(result);
});

whitelistRoutes.post('/', async (req, res) => {
  const entry: WhitelistEntry = {
    id: uuid(),
    pluginId: req.body.pluginId,
    type: req.body.type || 'user',
    identifier: req.body.identifier,
    name: req.body.name,
    createdAt: new Date().toISOString(),
  };
  await store.create(entry);
  res.status(201).json(entry);
});

whitelistRoutes.delete('/:id', async (req, res, next) => {
  const ok = await store.delete(req.params.id);
  if (!ok) return next(new NotFoundError('白名单', req.params.id));
  res.status(204).end();
});
