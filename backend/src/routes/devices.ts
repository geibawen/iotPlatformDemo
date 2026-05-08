import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { JsonStore } from '../storage/jsonStore.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import type { Device, ThingModelProperty, ThingModelService } from '@iot-platform/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROP_VALUES_PATH = path.join(__dirname, '../../data/device-property-values.json');

const store = new JsonStore<Device>('devices.json');
const propertyStore = new JsonStore<ThingModelProperty>('properties.json');
const serviceStore = new JsonStore<ThingModelService>('services.json');

export const deviceRoutes = Router();

// --- Property value persistence helpers ---

interface PropertyValueMap {
  [did: string]: { [key: string]: unknown }; // key = "siid:piid"
}

async function readPropertyValues(): Promise<PropertyValueMap> {
  try {
    const raw = await fs.readFile(PROP_VALUES_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writePropertyValues(data: PropertyValueMap): Promise<void> {
  const tmp = PROP_VALUES_PATH + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tmp, PROP_VALUES_PATH);
}

// --- Device CRUD ---

deviceRoutes.get('/', async (req, res) => {
  const all = await store.readAll();
  const productId = req.query.productId as string | undefined;
  const search = (req.query.search as string)?.toLowerCase();
  let result = all;
  if (productId) result = result.filter((d) => d.productId === productId);
  if (search) result = result.filter((d) => d.name.toLowerCase().includes(search));
  res.json(result);
});

deviceRoutes.get('/:id', async (req, res, next) => {
  const item = await store.findById(req.params.id);
  if (!item) return next(new NotFoundError('设备', req.params.id));
  res.json(item);
});

deviceRoutes.post('/', async (req, res) => {
  const device: Device = {
    ...req.body,
    id: uuid(),
    status: req.body.status || 'online',
    createdAt: new Date().toISOString(),
  };
  await store.create(device);
  res.status(201).json(device);
});

deviceRoutes.put('/:id', async (req, res, next) => {
  const updated = await store.update(req.params.id, req.body);
  if (!updated) return next(new NotFoundError('设备', req.params.id));
  res.json(updated);
});

deviceRoutes.delete('/:id', async (req, res, next) => {
  const ok = await store.delete(req.params.id);
  if (!ok) return next(new NotFoundError('设备', req.params.id));
  res.status(204).end();
});

// --- Property value APIs (miio-style) ---

// GET all properties with their current values for a device
deviceRoutes.get('/:did/properties/all', async (req, res, next) => {
  const device = await store.findById(req.params.did);
  if (!device) return next(new NotFoundError('设备', req.params.did));

  const services = (await serviceStore.readAll()).filter((s) => s.productId === device.productId);
  const properties = (await propertyStore.readAll()).filter((p) => p.productId === device.productId);
  const values = await readPropertyValues();
  const deviceValues = values[req.params.did] || {};

  const result = services.map((svc, svcIdx) => {
    const siid = svcIdx + 1;
    const props = svc.propertyIds.map((propId, propIdx) => {
      const piid = propIdx + 1;
      const prop = properties.find((p) => p.id === propId);
      return {
        siid,
        piid,
        did: req.params.did,
        prop: prop || null,
        value: deviceValues[`${siid}:${piid}`] ?? null,
      };
    });
    return {
      siid,
      service: svc,
      properties: props,
    };
  });

  res.json(result);
});

// POST get_properties (miio-style)
// Body: { "id": 1234, "method": "get_properties", "params": [{ "did": "xxx", "siid": 1, "piid": 1 }] }
deviceRoutes.post('/:did/properties/get', async (req, res) => {
  const { params } = req.body;
  const values = await readPropertyValues();
  const deviceValues = values[req.params.did] || {};

  const result = (params || []).map((p: { did: string; siid: number; piid: number }) => ({
    did: p.did || req.params.did,
    siid: p.siid,
    piid: p.piid,
    value: deviceValues[`${p.siid}:${p.piid}`] ?? null,
    code: 0,
  }));

  res.json({ id: req.body.id || 0, result });
});

// POST set_properties (miio-style)
// Body: { "id": 1234, "method": "set_properties", "params": [{ "did": "xxx", "siid": 1, "piid": 1, "value": xxx }] }
deviceRoutes.post('/:did/properties/set', async (req, res) => {
  const { params } = req.body;
  const values = await readPropertyValues();
  if (!values[req.params.did]) values[req.params.did] = {};

  const result = (params || []).map((p: { did: string; siid: number; piid: number; value: unknown }) => {
    values[req.params.did][`${p.siid}:${p.piid}`] = p.value;
    return {
      did: p.did || req.params.did,
      siid: p.siid,
      piid: p.piid,
      code: 0,
    };
  });

  await writePropertyValues(values);
  res.json({ id: req.body.id || 0, result });
});
