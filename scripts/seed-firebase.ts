/**
 * Script to seed all game content (questions, scriptures, proverbs, items)
 * into Firebase Realtime Database under `content/{gameId}`.
 *
 * Usage:
 *   npx tsx scripts/seed-firebase.ts
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import fs from 'fs';
import path from 'path';

// Read .env if present
const envPath = path.resolve(process.cwd(), '.env');
const envVars: Record<string, string> = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...rest] = trimmed.split('=');
      if (key && rest.length > 0) {
        envVars[key.trim()] = rest.join('=').trim();
      }
    }
  });
}

const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: envVars.VITE_FIREBASE_DATABASE_URL || process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
  console.error('❌ Firebase credentials not found in .env. Please check your .env file.');
  process.exit(1);
}

console.log(`Connecting to Firebase RTDB: ${firebaseConfig.databaseURL}...`);
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const games = [
  {
    id: 'who-said',
    filePath: path.resolve(process.cwd(), 'src/content/who-said.json'),
  },
  {
    id: 'testament-sort',
    filePath: path.resolve(process.cwd(), 'src/content/testament-sort.json'),
  },
  {
    id: 'fake-a-proverb',
    filePath: path.resolve(process.cwd(), 'src/games/fake-a-proverb/content.json'),
  },
  {
    id: 'hot-coal',
    filePath: path.resolve(process.cwd(), 'src/games/hot-coal/content.json'),
  },
  {
    id: 'tares-among-the-wheat',
    filePath: path.resolve(process.cwd(), 'src/games/tares-among-the-wheat/content.json'),
  },
];

async function seed() {
  console.log('Seeding game content into Firebase Realtime Database...\n');

  for (const game of games) {
    if (!fs.existsSync(game.filePath)) {
      console.warn(`⚠️ Content file not found for ${game.id}: ${game.filePath}`);
      continue;
    }

    try {
      const raw = fs.readFileSync(game.filePath, 'utf-8');
      const content = JSON.parse(raw);

      const contentRef = ref(db, `content/${game.id}`);
      await set(contentRef, content);

      const count = Array.isArray(content)
        ? content.length
        : Object.keys(content).length;

      console.log(`✅ Seeded ${game.id} (${count} entries) -> content/${game.id}`);
    } catch (err) {
      console.error(`❌ Failed to seed ${game.id}:`, err);
    }
  }

  console.log('\n🎉 All game content has been saved to the database successfully!');
  process.exit(0);
}

seed();
