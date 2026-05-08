import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { JsonStore } from '../storage/jsonStore.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import type { Product } from '@iot-platform/shared';

const store = new JsonStore<Product>('products.json');
export const productRoutes = Router();

productRoutes.get('/', async (req, res) => {
  const all = await store.readAll();
  const search = (req.query.search as string)?.toLowerCase();
  const result = search ? all.filter((p) => p.name.toLowerCase().includes(search)) : all;
  res.json(result);
});

productRoutes.get('/:id', async (req, res, next) => {
  const item = await store.findById(req.params.id);
  if (!item) return next(new NotFoundError('产品', req.params.id));
  res.json(item);
});

productRoutes.post('/', async (req, res) => {
  const now = new Date().toISOString();
  const product: Product = { ...req.body, id: uuid(), createdAt: now, updatedAt: now };
  await store.create(product);
  res.status(201).json(product);
});

productRoutes.put('/:id', async (req, res, next) => {
  const updated = await store.update(req.params.id, req.body);
  if (!updated) return next(new NotFoundError('产品', req.params.id));
  res.json(updated);
});

productRoutes.delete('/:id', async (req, res, next) => {
  const ok = await store.delete(req.params.id);
  if (!ok) return next(new NotFoundError('产品', req.params.id));
  res.status(204).end();
});
