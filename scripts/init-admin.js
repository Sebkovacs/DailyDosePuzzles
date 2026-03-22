const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// This script is intended to be run in an environment with appropriate Firebase credentials.
// It initializes the 'admins' collection with the initial admin email.

const adminEmail = 'sebkovacs@gmail.com';

async function initAdmin() {
  console.log(`Initializing admin: ${adminEmail}`);

  try {
    // In a real scenario, you would provide service account credentials here
    // initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore();

    await db.collection('admins').doc(adminEmail.toLowerCase()).set({
      addedAt: new Date(),
      initial: true
    });

    console.log('Admin initialized successfully.');
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
}

// initAdmin();
console.log('Migration script created. Run this script with proper Firebase Admin SDK setup to initialize the first admin.');
