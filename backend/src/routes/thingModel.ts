import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { JsonStore } from '../storage/jsonStore.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import type { ThingModelProperty, ThingModelAction, ThingModelService } from '@iot-platform/shared';

const propertyStore = new JsonStore<ThingModelProperty>('properties.json');
const actionStore = new JsonStore<ThingModelAction>('actions.json');
const serviceStore = new JsonStore<ThingModelService>('services.json');

export const thingModelRoutes = Router();

// === Properties ===
thingModelRoutes.get('/products/:pid/properties', async (req, res) => {
  const all = await propertyStore.readAll();
  res.json(all.filter((p) => p.productId === req.params.pid));
});

thingModelRoutes.post('/products/:pid/properties', async (req, res) => {
  const now = new Date().toISOString();
  const prop: ThingModelProperty = { ...req.body, id: uuid(), productId: req.params.pid, createdAt: now, updatedAt: now };
  await propertyStore.create(prop);
  res.status(201).json(prop);
});

thingModelRoutes.put('/properties/:id', async (req, res, next) => {
  const updated = await propertyStore.update(req.params.id, req.body);
  if (!updated) return next(new NotFoundError('属性', req.params.id));
  res.json(updated);
});

thingModelRoutes.delete('/properties/:id', async (req, res, next) => {
  const ok = await propertyStore.delete(req.params.id);
  if (!ok) return next(new NotFoundError('属性', req.params.id));
  res.status(204).end();
});

// === Actions ===
thingModelRoutes.get('/products/:pid/actions', async (req, res) => {
  const all = await actionStore.readAll();
  res.json(all.filter((a) => a.productId === req.params.pid));
});

thingModelRoutes.post('/products/:pid/actions', async (req, res) => {
  const now = new Date().toISOString();
  const action: ThingModelAction = { ...req.body, id: uuid(), productId: req.params.pid, createdAt: now, updatedAt: now };
  await actionStore.create(action);
  res.status(201).json(action);
});

thingModelRoutes.put('/actions/:id', async (req, res, next) => {
  const updated = await actionStore.update(req.params.id, req.body);
  if (!updated) return next(new NotFoundError('动作', req.params.id));
  res.json(updated);
});

thingModelRoutes.delete('/actions/:id', async (req, res, next) => {
  const ok = await actionStore.delete(req.params.id);
  if (!ok) return next(new NotFoundError('动作', req.params.id));
  res.status(204).end();
});

// === Services ===
thingModelRoutes.get('/products/:pid/services', async (req, res) => {
  const all = await serviceStore.readAll();
  res.json(all.filter((s) => s.productId === req.params.pid));
});

thingModelRoutes.post('/products/:pid/services', async (req, res) => {
  const now = new Date().toISOString();
  const service: ThingModelService = { ...req.body, id: uuid(), productId: req.params.pid, createdAt: now, updatedAt: now };
  await serviceStore.create(service);
  res.status(201).json(service);
});

thingModelRoutes.put('/services/:id', async (req, res, next) => {
  const updated = await serviceStore.update(req.params.id, req.body);
  if (!updated) return next(new NotFoundError('服务', req.params.id));
  res.json(updated);
});

thingModelRoutes.delete('/services/:id', async (req, res, next) => {
  const ok = await serviceStore.delete(req.params.id);
  if (!ok) return next(new NotFoundError('服务', req.params.id));
  res.status(204).end();
});

// Bulk delete all thing model items for a product
thingModelRoutes.delete('/products/:pid/thingmodel', async (req, res) => {
  const pid = req.params.pid;
  await Promise.all([
    propertyStore.deleteByField('productId', pid),
    actionStore.deleteByField('productId', pid),
    serviceStore.deleteByField('productId', pid),
  ]);
  res.status(204).end();
});
