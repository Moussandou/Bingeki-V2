import * as admin from 'firebase-admin';
import { resolve } from 'path';

// This script should be run with a service account JSON path in FIREBASE_APPLICATION_CREDENTIALS
// e.g., FIREBASE_APPLICATION_CREDENTIALS=./service-account.json npx ts-node scripts/maintenance.ts

if (!process.env.FIREBASE_APPLICATION_CREDENTIALS) {
    console.warn("⚠️  Avertissement: FIREBASE_APPLICATION_CREDENTIALS n'est pas défini.");
    console.warn("Le script va tenter d'utiliser les credentials par défaut (valide si exécuté sur GCP).");
}

admin.initializeApp({
    credential: process.env.FIREBASE_APPLICATION_CREDENTIALS 
        ? admin.credential.cert(resolve(process.env.FIREBASE_APPLICATION_CREDENTIALS))
        : admin.credential.applicationDefault()
});

const db = admin.firestore();

async function cleanOldFeedbacks() {
    console.log('--- Nettoyage des vieux feedbacks ---');
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    // Closed feedbacks older than 30 days
    const snapshot = await db.collection('feedback')
        .where('status', 'in', ['closed', 'resolved'])
        .where('timestamp', '<', thirtyDaysAgo)
        .get();

    if (snapshot.empty) {
        console.log('✅ Aucun vieux feedback à nettoyer.');
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`🗑️  ${snapshot.size} vieux feedbacks supprimés.`);
}

async function removeDeletedUsersData() {
    console.log('--- Nettoyage des données d\'utilisateurs supprimés ---');
    
    // Typically, users marked with deleted: true or deletedAt should be fully purged
    const snapshot = await db.collection('users')
        .where('deletedAt', '!=', null)
        .get();

    if (snapshot.empty) {
        console.log('✅ Aucun utilisateur supprimé en attente de purge.');
        return;
    }

    let count = 0;
    for (const doc of snapshot.docs) {
        const data = doc.data();
        const deletedAt = data.deletedAt;
        
        // If deleted more than 30 days ago
        if (deletedAt && (Date.now() - deletedAt > 30 * 24 * 60 * 60 * 1000)) {
            // Delete subcollections (library, progress, etc.)
            const subcollections = await doc.ref.listCollections();
            for (const sub of subcollections) {
                const subDocs = await sub.get();
                const batch = db.batch();
                subDocs.docs.forEach(d => batch.delete(d.ref));
                await batch.commit();
            }
            // Delete user doc
            await doc.ref.delete();
            count++;
        }
    }

    console.log(`🗑️  ${count} comptes utilisateurs purgés définitivement.`);
}

async function runMaintenance() {
    console.log('🚀 Début de la maintenance programmée...');
    try {
        await cleanOldFeedbacks();
        await removeDeletedUsersData();
        console.log('✨ Maintenance terminée avec succès.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la maintenance:', error);
        process.exit(1);
    }
}

runMaintenance();
