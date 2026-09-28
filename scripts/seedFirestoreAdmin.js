/**
 * Node.js Admin Script to seed all 80 initial member records
 * directly into Firestore using the Firebase Admin SDK service account file.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const sampleRoles = [
  "Core Team Lead",
  "Technical Lead",
  "Events & Workshops Lead",
  "Design & Media Lead",
  "Public Relations Lead",
  "Web & App Operations Lead",
  "Competitive Programming Lead",
  "Sponsorship & Logistics Lead",
  "Content & Editorial Lead",
  "Core Executive Member"
];

function generate80Members() {
  const members = [];
  const now = new Date().toISOString();

  members.push({
    memberId: "CSI26-001",
    name: "Krishna Chaithanya",
    role: "Core Team Lead",
    year: "3rd Year",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
    instagram: "https://instagram.com/csikare",
    linkedin: "https://linkedin.com/company/csi-kare",
    email: "krishna.csi@klu.ac.in",
    phone: "+91 9876543210",
    createdAt: now,
    updatedAt: now,
  });

  for (let i = 2; i <= 80; i++) {
    const paddedId = String(i).padStart(3, '0');
    const memberId = `CSI26-${paddedId}`;
    const roleIndex = (i - 2) % sampleRoles.length;
    const year = i % 2 === 0 ? "3rd Year" : "2nd Year";

    members.push({
      memberId,
      name: `Core Member ${paddedId}`,
      role: sampleRoles[roleIndex],
      year,
      photoUrl: "",
      instagram: "",
      linkedin: "",
      email: `member${paddedId}@klu.ac.in`,
      phone: "",
      createdAt: now,
      updatedAt: now,
    });
  }

  return members;
}

async function runSeed() {
  const serviceAccountPath = process.argv[2] || process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!serviceAccountPath) {
    console.error('Error: Please provide the path to your Firebase Admin SDK service account JSON file.');
    console.log('Example: node scripts/seedFirestoreAdmin.js "C:\\Users\\bkris\\Downloads\\csi-id-info-firebase-adminsdk-fbsvc-d8edfde46f.json"');
    process.exit(1);
  }

  try {
    const raw = fs.readFileSync(path.resolve(serviceAccountPath), 'utf8');
    const serviceAccount = JSON.parse(raw);

    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || 'csi-id-info',
    });

    const db = getFirestore();
    const members = generate80Members();

    console.log(`\nInitializing ${members.length} member records in Firestore for project: ${serviceAccount.project_id}...`);

    const batch = db.batch();
    for (const member of members) {
      const docRef = db.collection('members').doc(member.memberId);
      batch.set(docRef, member, { merge: true });
    }

    await batch.commit();
    console.log(`✅ Successfully seeded all ${members.length} members (CSI26-001 to CSI26-080) to Firestore!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed Firestore:', error);
    process.exit(1);
  }
}

runSeed();
