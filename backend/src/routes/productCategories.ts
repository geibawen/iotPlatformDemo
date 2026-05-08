import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { JsonStore } from '../storage/jsonStore.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import type { Product, ProductCategoryItem } from '@iot-platform/shared';

const categoryStore = new JsonStore<ProductCategoryItem>('product-categories.json');
const productStore = new JsonStore<Product>('products.json');

export const productCategoryRoutes = Router();

productCategoryRoutes.get('/', async (_req, res) => {
  const all = await categoryStore.readAll();
  res.json(all);
});

productCategoryRoutes.get('/:id', async (req, res, next) => {
  const item = await categoryStore.findById(req.params.id);
  if (!item) return next(new NotFoundError('产品分类', req.params.id));
  res.json(item);
});

productCategoryRoutes.post('/', async (req, res) => {
  const key = String(req.body.key || '').trim();
  const name = String(req.body.name || '').trim();
  if (!key || !name) {
    return res.status(400).json({ message: '分类 key 和名称不能为空' });
  }

  const all = await categoryStore.readAll();
  if (all.some((c) => c.key === key)) {
    return res.status(409).json({ message: '分类 key 已存在' });
  }

  const now = new Date().toISOString();
  const item: ProductCategoryItem = {
    id: uuid(),
    key,
    name,
    createdAt: now,
    updatedAt: now,
  };
  await categoryStore.create(item);
  res.status(201).json(item);
});

productCategoryRoutes.put('/:id', async (req, res, next) => {
  const current = await categoryStore.findById(req.params.id);
  if (!current) return next(new NotFoundError('产品分类', req.params.id));

  const nextKey = req.body.key !== undefined ? String(req.body.key).trim() : current.key;
  const nextName = req.body.name !== undefined ? String(req.body.name).trim() : current.name;
  if (!nextKey || !nextName) {
    return res.status(400).json({ message: '分类 key 和名称不能为空' });
  }

  const all = await categoryStore.readAll();
  if (all.some((c) => c.id !== current.id && c.key === nextKey)) {
    return res.status(409).json({ message: '分类 key 已存在' });
  }

  const updated = await categoryStore.update(req.params.id, { key: nextKey, name: nextName });
  if (!updated) return next(new NotFoundError('产品分类', req.params.id));

  if (nextKey !== current.key) {
    const products = await productStore.readAll();
    const patched = products.map((p) => (p.category === current.key ? { ...p, category: nextKey } : p));
    await productStore.writeAll(patched);
  }

  res.json(updated);
});

productCategoryRoutes.delete('/:id', async (req, res, next) => {
  const current = await categoryStore.findById(req.params.id);
  if (!current) return next(new NotFoundError('产品分类', req.params.id));

  const products = await productStore.readAll();
  const usedCount = products.filter((p) => p.category === current.key).length;
  if (usedCount > 0) {
    return res.status(409).json({ message: `该分类正被 ${usedCount} 个产品使用，无法删除` });
  }

  const ok = await categoryStore.delete(req.params.id);
  if (!ok) return next(new NotFoundError('产品分类', req.params.id));
  res.status(204).end();
});
