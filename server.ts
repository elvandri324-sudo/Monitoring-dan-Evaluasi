import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  batchDeleteRecords,
  batchUpsertRecords,
  CloudCollectionName,
  deleteRecord,
  getFullWorkspaceData,
  getPublicPortalData,
  restoreWorkspaceBackup,
  upsertRecord,
} from './src/db/repository.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_COLLECTIONS = new Set<CloudCollectionName>([
  'projects',
  'beneficiaries',
  'attendances',
  'accompaniedGroups',
  'knowledgeProducts',
  'storiesOfChange',
  'mediaCoverages',
  'learnings',
  'reports',
  'appUsers',
  'errorReports',
]);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  // Sanitized Public Portal endpoint (zero PII, backed directly by Cloud SQL)
  app.get('/api/public-portal', async (_req, res) => {
    try {
      const data = await getPublicPortalData();
      res.json(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load public portal data';
      res.status(500).json({ error: message });
    }
  });

  // Protected Admin Workspace endpoints (verified Firebase ID Token required)
  app.get('/api/workspace', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const data = await getFullWorkspaceData();
      res.json(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load workspace data';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/workspace/restore', requireAuth, async (req: AuthRequest, res) => {
    try {
      await restoreWorkspaceBackup(req.body || {});
      const updated = await getFullWorkspaceData();
      res.json(updated);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to restore backup';
      res.status(500).json({ error: message });
    }
  });

  app.put('/api/collections/:collection/:id', requireAuth, async (req: AuthRequest, res) => {
    const colName = req.params.collection as CloudCollectionName;
    if (!VALID_COLLECTIONS.has(colName)) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }
    try {
      const item = { ...(req.body || {}), id: req.params.id };
      await upsertRecord(colName, item);
      res.json({ ok: true, id: req.params.id });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save record';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/collections/:collection/batch', requireAuth, async (req: AuthRequest, res) => {
    const colName = req.params.collection as CloudCollectionName;
    if (!VALID_COLLECTIONS.has(colName)) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }
    try {
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      await batchUpsertRecords(colName, items);
      res.json({ ok: true, count: items.length });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to batch save records';
      res.status(500).json({ error: message });
    }
  });

  app.delete('/api/collections/:collection/:id', requireAuth, async (req: AuthRequest, res) => {
    const colName = req.params.collection as CloudCollectionName;
    if (!VALID_COLLECTIONS.has(colName)) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }
    try {
      await deleteRecord(colName, req.params.id);
      res.json({ ok: true, id: req.params.id });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete record';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/collections/:collection/batch-delete', requireAuth, async (req: AuthRequest, res) => {
    const colName = req.params.collection as CloudCollectionName;
    if (!VALID_COLLECTIONS.has(colName)) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }
    try {
      const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
      await batchDeleteRecords(colName, ids);
      res.json({ ok: true, count: ids.length });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to batch delete records';
      res.status(500).json({ error: message });
    }
  });

  // Development vs Production serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
