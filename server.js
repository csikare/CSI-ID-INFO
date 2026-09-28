import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

app.use(cors());
app.use(express.json());

// Initialize Firebase Admin with serviceAccountKey.json
let db = null;
const keyPath = path.resolve(__dirname, 'serviceAccountKey.json');
if (fs.existsSync(keyPath)) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id || 'csi-id-info',
      });
    }
    db = getFirestore();
    console.log('🔥 [Server] Connected to Firestore project:', serviceAccount.project_id);
  } catch (err) {
    console.warn('⚠️ [Server] Firebase init error:', err.message);
  }
}

// API Routes
app.get('/api/members', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not initialized' });
    const snapshot = await db.collection('members').get();
    const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    members.sort((a, b) => (a.memberId || '').localeCompare(b.memberId || '', undefined, { numeric: true }));
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/members/:id', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not initialized' });
    const memberId = req.params.id.toUpperCase();
    const docSnap = await db.collection('members').doc(memberId).get();
    if (docSnap.exists) {
      return res.json({ id: docSnap.id, ...docSnap.data() });
    }
    res.status(404).json({ error: 'Profile not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not initialized' });
    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ error: 'Member ID is required' });
    const formattedId = memberId.trim().toUpperCase();
    const now = new Date().toISOString();
    const newMember = {
      ...req.body,
      memberId: formattedId,
      createdAt: now,
      updatedAt: now,
    };
    await db.collection('members').doc(formattedId).set(newMember);
    res.status(201).json(newMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/members/:id', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not initialized' });
    const memberId = req.params.id.toUpperCase();
    const now = new Date().toISOString();
    const updated = {
      ...req.body,
      memberId,
      updatedAt: now,
    };
    await db.collection('members').doc(memberId).set(updated, { merge: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/members/:id', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not initialized' });
    const memberId = req.params.id.toUpperCase();
    await db.collection('members').doc(memberId).delete();
    res.json({ success: true, memberId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static frontend in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 CSI KARE Core Team Server listening on port ${PORT}`);
});
