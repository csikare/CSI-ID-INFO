/**
 * Create Admin User in Firebase Authentication using Admin SDK
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

async function createAdmin() {
  const serviceAccountPath = process.argv[2] || "C:\\Users\\bkris\\Downloads\\csi-id-info-firebase-adminsdk-fbsvc-d8edfde46f.json";
  const email = process.argv[3] || "admin@csikare.org";
  const password = process.argv[4] || "CsiKare@2026!";

  try {
    const raw = fs.readFileSync(path.resolve(serviceAccountPath), 'utf8');
    const serviceAccount = JSON.parse(raw);

    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || 'csi-id-info',
    });

    const auth = getAuth();

    try {
      const existingUser = await auth.getUserByEmail(email);
      await auth.updateUser(existingUser.uid, {
        password: password,
        displayName: "CSI KARE Administrator"
      });
      console.log(`✅ Admin user already exists. Updated password for: ${email}`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        const newUser = await auth.createUser({
          email: email,
          password: password,
          displayName: "CSI KARE Administrator",
          emailVerified: true
        });
        console.log(`✅ Created new Admin user in Firebase Auth: ${email}`);
      } else {
        throw err;
      }
    }

    console.log(`\n========================================`);
    console.log(`ADMIN CREDENTIALS FOR FIREBASE AUTH:`);
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log(`========================================\n`);

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdmin();
