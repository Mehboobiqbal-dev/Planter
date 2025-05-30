// lib/mongodb.ts (or src/lib/mongodb.ts)
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
console.log(`[MongoDB Lib] Module evaluating. NODE_ENV: ${process.env.NODE_ENV}`);

if (!MONGODB_URI) {
  console.error("[MongoDB Lib] CRITICAL: MONGODB_URI is not defined!");
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>; // Renamed for clarity, this will be the exported promise

declare global {
  // eslint-disable-next-line no-unused-vars
  var _mongoClientPromiseGlobal: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  console.log('[MongoDB Lib] In development mode.');
  if (!global._mongoClientPromiseGlobal) {
    console.log('[MongoDB Lib] global._mongoClientPromiseGlobal is NOT set. Creating new global connection promise.');
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromiseGlobal = client.connect();
    global._mongoClientPromiseGlobal
      .then(() => console.log('[MongoDB Lib] Dev global connection promise resolved (connected).'))
      .catch(e => console.error('[MongoDB Lib] Dev global connection promise FAILED.', e));
  } else {
    console.log('[MongoDB Lib] global._mongoClientPromiseGlobal IS SET. Reusing global connection promise.');
  }
  clientPromise = global._mongoClientPromiseGlobal;
} else { // Production or other environments
  console.log(`[MongoDB Lib] In non-development mode (${process.env.NODE_ENV}).`);
  // In production, we initialize the client and promise directly if they haven't been.
  // This relies on module caching: this code block runs only once per server instance.
  if (!client) { // Check if client itself is not initialized
    console.log('[MongoDB Lib] Client not initialized (non-dev). Creating new client and connection promise.');
    client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
    clientPromise
      .then(() => console.log('[MongoDB Lib] Non-dev module connection promise resolved (connected).'))
      .catch(e => console.error('[MongoDB Lib] Non-dev module connection promise FAILED.', e));
  } else {
    // This 'else' should ideally not be hit if module caching works as expected,
    // but if it is, it means client was somehow set without clientPromise.
    // To be safe, if clientPromise isn't set but client is, we re-establish clientPromise.
    // However, the primary path is the `if (!client)` block.
    if (!clientPromise) {
        console.warn('[MongoDB Lib] Client was initialized but clientPromise was not (non-dev). Re-creating promise.');
        clientPromise = client.connect(); // Connect using the existing client instance
         clientPromise
          .then(() => console.log('[MongoDB Lib] Non-dev module connection promise (re-created) resolved.'))
          .catch(e => console.error('[MongoDB Lib] Non-dev module connection promise (re-created) FAILED.', e));
    } else {
        console.log('[MongoDB Lib] Client and clientPromise already initialized (non-dev). Reusing.');
    }
  }
}

export default clientPromise;