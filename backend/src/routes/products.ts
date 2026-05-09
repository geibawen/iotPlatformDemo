import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { JsonStore } from '../storage/jsonStore.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import type {
  CreateProductPayload,
  Product,
  ThingModelAction,
  ThingModelProperty,
  ThingModelService,
} from '@iot-platform/shared';

const store = new JsonStore<Product>('products.json');
const propertyStore = new JsonStore<ThingModelProperty>('properties.json');
const actionStore = new JsonStore<ThingModelAction>('actions.json');
const serviceStore = new JsonStore<ThingModelService>('services.json');
export const productRoutes = Router();

async function cloneThingModel(baseProductId: string, targetProductId: string) {
  const now = new Date().toISOString();
  const baseProperties = (await propertyStore.readAll()).filter((p) => p.productId === baseProductId);
  const baseActions = (await actionStore.readAll()).filter((a) => a.productId === baseProductId);
  const baseServices = (await serviceStore.readAll()).filter((s) => s.productId === baseProductId);

  const propertyIdMap = new Map<string, string>();
  const actionIdMap = new Map<string, string>();

  for (const prop of baseProperties) {
    const newId = uuid();
    propertyIdMap.set(prop.id, newId);
    await propertyStore.create({
      ...prop,
      id: newId,
      productId: targetProductId,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const action of baseActions) {
    const newId = uuid();
    actionIdMap.set(action.id, newId);
    await actionStore.create({
      ...action,
      id: newId,
      productId: targetProductId,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const service of baseServices) {
    await serviceStore.create({
      ...service,
      id: uuid(),
      productId: targetProductId,
      propertyIds: (service.propertyIds || [])
        .map((oldId) => propertyIdMap.get(oldId))
        .filter((id): id is string => Boolean(id)),
      actionIds: (service.actionIds || [])
        .map((oldId) => actionIdMap.get(oldId))
        .filter((id): id is string => Boolean(id)),
      createdAt: now,
      updatedAt: now,
    });
  }
}

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
  const { baseProductId, ...payload } = req.body as CreateProductPayload;
  let inheritedFromProductId: string | undefined;

  if (baseProductId) {
    const baseProduct = await store.findById(baseProductId);
    if (!baseProduct) {
      return res.status(400).json({ message: '基础产品不存在，无法继承物模型' });
    }
    inheritedFromProductId = baseProductId;
  }

  const now = new Date().toISOString();
  const product: Product = {
    ...payload,
    status: payload.status ?? 'draft',
    id: uuid(),
    inheritedFromProductId,
    createdAt: now,
    updatedAt: now,
  };

  await store.create(product);

  if (baseProductId) {
    await cloneThingModel(baseProductId, product.id);
  }

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
