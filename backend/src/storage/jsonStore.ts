import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, 'uploads'), { recursive: true });
}

export class JsonStore<T extends { id: string }> {
  private filePath: string;

  constructor(fileName: string) {
    this.filePath = path.join(DATA_DIR, fileName);
  }

  async readAll(): Promise<T[]> {
    await ensureDir();
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(raw);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw err;
    }
  }

  async writeAll(data: T[]): Promise<void> {
    await ensureDir();
    const tmpPath = this.filePath + '.tmp';
    await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tmpPath, this.filePath);
  }

  async findById(id: string): Promise<T | undefined> {
    const all = await this.readAll();
    return all.find((item) => item.id === id);
  }

  async create(item: T): Promise<T> {
    const all = await this.readAll();
    all.push(item);
    await this.writeAll(all);
    return item;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const all = await this.readAll();
    const idx = all.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() } as T;
    await this.writeAll(all);
    return all[idx];
  }

  async delete(id: string): Promise<boolean> {
    const all = await this.readAll();
    const filtered = all.filter((item) => item.id !== id);
    if (filtered.length === all.length) return false;
    await this.writeAll(filtered);
    return true;
  }

  async deleteByField(field: keyof T, value: unknown): Promise<number> {
    const all = await this.readAll();
    const filtered = all.filter((item) => item[field] !== value);
    const count = all.length - filtered.length;
    if (count > 0) await this.writeAll(filtered);
    return count;
  }

  async isEmpty(): Promise<boolean> {
    const all = await this.readAll();
    return all.length === 0;
  }
}
