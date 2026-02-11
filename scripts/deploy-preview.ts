
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { signInAnonymously, getAuth } from 'firebase/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const config = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!config.apiKey) {
    console.error('❌ Missing Firebase config. Check your .env file.');
    process.exit(1);
}

// Initialize Firebase
const app = initializeApp(config);
const db = getFirestore(app);
const auth = getAuth(app);

async function deployPreview() {
    try {
        console.log('🚀 Starting Preview Deployment...');

        // Login anonymously to write to Firestore (ensure rules allow this or use a service account for better security)
        // For this script, we assume specific rules or temporary open access for 'deployments' collection or we use a service account in a real CI env.
        // To make it simple for the user locally:
        await signInAnonymously(auth);

        // Generate a channel ID
        const hash = Math.random().toString(36).substring(7);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const channelId = `preview-${timestamp}-${hash}`;

        console.log(`📡 Deploying to channel: ${channelId}`);

        // Build the project first
        console.log('🛠 Building project...');
        execSync('npm run build', { stdio: 'inherit' });

        // Deploy to channel
        console.log('📤 Uploading to Firebase Hosting...');
        // We use --json to parse the result, but also pipe stderr to see progress if possible.
        // Actually execSync returns the buffer.
        const output = execSync(`npx firebase hosting:channel:deploy ${channelId} --expires 7d --json`, { encoding: 'utf-8' });

        const result = JSON.parse(output);
        const previewUrl = result.result[channelId].url;
        const expireTime = result.result[channelId].expireTime;

        console.log(`✅ Deployed successfully!`);
        console.log(`🔗 Preview URL: ${previewUrl}`);
        console.log(`⏳ Expires: ${expireTime}`);

        // Save to Firestore
        console.log('💾 Saving deployment record to Firestore...');
        await addDoc(collection(db, 'deployments'), {
            channelId,
            url: previewUrl,
            createdAt: serverTimestamp(),
            expiresAt: new Date(expireTime),
            type: 'preview',
            status: 'active'
        });

        console.log('📝 Deployment recorded in Firestore.');
        process.exit(0);

    } catch (error: any) {
        console.error('❌ Deployment failed:', error.message);
        if (error.stdout) console.error(error.stdout.toString());
        if (error.stderr) console.error(error.stderr.toString());
        process.exit(1);
    }
}

deployPreview();
