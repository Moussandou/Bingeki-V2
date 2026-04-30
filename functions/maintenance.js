const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

/**
 * Daily Maintenance & Reporting
 * Runs every day at 2:00 AM Paris time.
 * - Cleans old feedbacks
 * - Purges deleted users
 * - Sends daily summary to Discord
 */
exports.dailyMaintenance = onSchedule({
    schedule: "0 2 * * *",
    timeZone: "Europe/Paris"
}, async (event) => {
        console.log("🚀 Starting daily maintenance...");
        const db = admin.firestore();
        
        try {
            // 1. Clean old feedbacks (closed & > 30 days)
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const feedbackSnapshot = await db.collection('feedback')
                .where('status', 'in', ['closed', 'resolved'])
                .where('timestamp', '<', thirtyDaysAgo)
                .get();

            if (!feedbackSnapshot.empty) {
                const batch = db.batch();
                feedbackSnapshot.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
                console.log(`🗑️ Deleted ${feedbackSnapshot.size} old feedbacks.`);
            }

            // 2. Remove deleted users data (deleted > 30 days ago)
            const usersSnapshotFull = await db.collection('users').get();
            let purgedUsers = 0;
            
            for (const doc of usersSnapshotFull.docs) {
                const data = doc.data();
                if (data.deletedAt && (Date.now() - data.deletedAt > 30 * 24 * 60 * 60 * 1000)) {
                    const collections = await doc.ref.listCollections();
                    for (const sub of collections) {
                        const subDocs = await sub.get();
                        const batch = db.batch();
                        subDocs.docs.forEach(d => batch.delete(d.ref));
                        await batch.commit();
                    }
                    await doc.ref.delete();
                    purgedUsers++;
                }
            }
            
            console.log(`🗑️ Purged ${purgedUsers} deleted users.`);

            // 3. Send Daily Summary to Discord
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const startOfDayTs = startOfDay.getTime();
            
            const now = Date.now();
            const oneDayAgo = now - 24 * 60 * 60 * 1000;
            const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
            
            let newUsersToday = 0;
            let dau = 0;
            let wau = 0;
            let mau = 0;

            usersSnapshotFull.docs.forEach(doc => {
                const data = doc.data();
                if (data.createdAt && data.createdAt >= startOfDayTs) newUsersToday++;
                if (data.lastLogin) {
                    if (data.lastLogin >= oneDayAgo) dau++;
                    if (data.lastLogin >= sevenDaysAgo) wau++;
                    if (data.lastLogin >= thirtyDaysAgo) mau++;
                }
            });

            const totalUsers = usersSnapshotFull.size;
            const engagementRate = mau > 0 ? ((dau / mau) * 100).toFixed(1) : '0';

            const feedbacksSnapshot = await db.collection('feedback').get();
            let pendingFeedback = 0;
            feedbacksSnapshot.docs.forEach(doc => {
                if (doc.data().status === 'open') pendingFeedback++;
            });
            const totalFeedback = feedbacksSnapshot.size;

            const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
            if (!webhookUrl) {
                console.log('⚠️ No Discord webhook configured (DISCORD_WEBHOOK_URL). Skipping.');
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
                            text: "Bingeki V2 Cloud Scheduler"
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
                console.log('✅ Discord summary sent successfully.');
            } else {
                console.error('❌ Failed to send Discord summary:', await response.text());
            }

            console.log("✨ Daily maintenance completed.");
        } catch (error) {
            console.error("❌ Maintenance error:", error);
        }
        return null;
    });
