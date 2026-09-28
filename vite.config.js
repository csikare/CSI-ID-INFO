import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// Custom Vite plugin to handle /api/members with Firebase Admin SDK directly
function firebaseAdminApiPlugin() {
  let adminApp = null;
  let db = null;

  async function getDb() {
    if (db) return db;

    const keyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
    if (fs.existsSync(keyPath)) {
      try {
        const { initializeApp, cert, getApps } = await import('firebase-admin/app');
        const { getFirestore } = await import('firebase-admin/firestore');
        const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

        if (!getApps().length) {
          adminApp = initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id || 'csi-id-info',
          });
        }
        db = getFirestore();
        console.log('🔥 [Vite API] Connected directly to Firebase Firestore:', serviceAccount.project_id);
      } catch (err) {
        console.warn('⚠️ [Vite API] Firebase Admin init note:', err.message);
      }
    }
    return db;
  }

  return {
    name: 'firebase-admin-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) {
          return next();
        }

        const firestore = await getDb();
        if (!firestore) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;

        res.setHeader('Content-Type', 'application/json');

        // Helper to parse JSON body
        const readBody = () => new Promise((resolve, reject) => {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try { resolve(body ? JSON.parse(body) : {}); }
            catch (e) { resolve({}); }
          });
          req.on('error', reject);
        });

        try {
          // 1. GET /api/members (All members)
          if (pathname === '/api/members' && req.method === 'GET') {
            const snapshot = await firestore.collection('members').get();
            const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            members.sort((a, b) => (a.memberId || '').localeCompare(b.memberId || '', undefined, { numeric: true }));
            res.statusCode = 200;
            return res.end(JSON.stringify(members));
          }

          // 2. GET /api/members/:id (Single member)
          const singleMatch = pathname.match(/^\/api\/members\/([A-Za-z0-9_-]+)$/);
          if (singleMatch && req.method === 'GET') {
            const memberId = singleMatch[1].toUpperCase();
            const docSnap = await firestore.collection('members').doc(memberId).get();
            if (docSnap.exists) {
              res.statusCode = 200;
              return res.end(JSON.stringify({ id: docSnap.id, ...docSnap.data() }));
            }
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'Profile not found' }));
          }

          // 3. POST /api/members (Create new member)
          if (pathname === '/api/members' && req.method === 'POST') {
            const body = await readBody();
            if (!body.memberId) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Member ID is required' }));
            }
            const memberId = body.memberId.trim().toUpperCase();
            const now = new Date().toISOString();
            const newMember = {
              ...body,
              memberId,
              createdAt: now,
              updatedAt: now,
            };
            await firestore.collection('members').doc(memberId).set(newMember);
            console.log(`🔥 [Firestore] Created member: ${memberId}`);
            res.statusCode = 201;
            return res.end(JSON.stringify(newMember));
          }

          // 4. PUT /api/members/:id (Update member)
          if (singleMatch && (req.method === 'PUT' || req.method === 'POST')) {
            const memberId = singleMatch[1].toUpperCase();
            const body = await readBody();
            const updated = {
              ...body,
              memberId,
              updatedAt: new Date().toISOString(),
            };
            await firestore.collection('members').doc(memberId).set(updated, { merge: true });
            console.log(`🔥 [Firestore] Updated member: ${memberId}`);
            res.statusCode = 200;
            return res.end(JSON.stringify(updated));
          }

          // 5. DELETE /api/members/:id (Delete member)
          if (singleMatch && req.method === 'DELETE') {
            const memberId = singleMatch[1].toUpperCase();
            await firestore.collection('members').doc(memberId).delete();
            console.log(`🔥 [Firestore] Deleted member: ${memberId}`);
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, memberId }));
          }

        } catch (err) {
          console.error('API Middleware Error:', err);
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: err.message }));
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    firebaseAdminApiPlugin()
  ],
});
