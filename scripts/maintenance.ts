import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();
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

async function sendDailySummaryToDiscord() {
    console.log('--- Envoi du résumé quotidien sur Discord ---');
    
    try {
        const now = Date.now();
        const startOfDay = new Date().setHours(0, 0, 0, 0);
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

        const usersSnapshot = await db.collection('users').get();
        let newUsersToday = 0;
        let dau = 0;
        let wau = 0;
        let mau = 0;

        usersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.createdAt && data.createdAt >= startOfDay) newUsersToday++;
            if (data.lastLogin) {
                if (data.lastLogin >= oneDayAgo) dau++;
                if (data.lastLogin >= sevenDaysAgo) wau++;
                if (data.lastLogin >= thirtyDaysAgo) mau++;
            }
        });

        const totalUsers = usersSnapshot.size;
        const engagementRate = mau > 0 ? ((dau / mau) * 100).toFixed(1) : '0';

        const feedbacksSnapshot = await db.collection('feedback').get();
        let pendingFeedback = 0;
        feedbacksSnapshot.forEach(doc => {
            if (doc.data().status === 'open') pendingFeedback++;
        });
        const totalFeedback = feedbacksSnapshot.size;

        const webhookUrl = process.env.VITE_DISCORD_WEBHOOK_URL;
        if (!webhookUrl) {
            console.log('⚠️ Aucun webhook Discord configuré (VITE_DISCORD_WEBHOOK_URL). Ignoré.');
            return;
        }

        const summaryText = `### 👥 Utilisateurs
- Total : **${totalUsers}**
- Nouveaux aujourd'hui : **+${newUsersToday}**
- DAU / WAU / MAU : ${dau} / ${wau} / ${mau}
- Taux d'engagement : **${engagementRate}%**

### 💬 Feedback
- En attente : **${pendingFeedback}**
- Total : **${totalFeedback}**
`;

        const payload = {
            content: null,
            embeds: [
                {
                    title: "📊 Rapport Quotidien Bingeki",
                    description: summaryText,
                    color: 3447003,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: "Bingeki V2 Maintenance Script"
                    }
                }
            ]
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('✅ Résumé envoyé avec succès sur Discord.');
        } else {
            console.error("❌ Erreur lors de l'envoi sur Discord:", await response.text());
        }
    } catch (e) {
        console.error('❌ Erreur inattendue:', e);
    }
}

async function runMaintenance() {
    console.log('🚀 Début de la maintenance programmée...');
    try {
        await cleanOldFeedbacks();
        await removeDeletedUsersData();
        await sendDailySummaryToDiscord();
        console.log('✨ Maintenance terminée avec succès.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la maintenance:', error);
        process.exit(1);
    }
}

runMaintenance();
