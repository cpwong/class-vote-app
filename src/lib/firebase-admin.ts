import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

export function getFirebaseAdmin() {
  if (!getApps().length) {
    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
      console.warn("Firebase Admin credentials are not fully configured. Using mock mode if proceeding.");
      // Note: We might want to throw here in a real production app.
    } else {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }
  }
  return getFirestore();
}
